import os
import asyncio
import re
import pathlib
import time
import base64
from typing import List, Optional
from datetime import datetime, timedelta
from collections import defaultdict
from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx
from dotenv import load_dotenv

load_dotenv(dotenv_path=pathlib.Path(__file__).parent / ".env", override=True)

app = FastAPI(title="Veriq AI — Premium Multi-Agent Workspace")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ══════════════════════════════════════════════════════════════════════════
#  TOKEN / RATE LIMIT SYSTEM
# ══════════════════════════════════════════════════════════════════════════

# Per-user daily token limits
DAILY_TOKEN_LIMIT = int(os.getenv("DAILY_TOKEN_LIMIT", "50000"))   # 50k tokens/day per user
HOURLY_QUERY_LIMIT = int(os.getenv("HOURLY_QUERY_LIMIT", "30"))    # 30 queries/hour per user

# In-memory store (resets on server restart — use Redis for production)
_token_usage: dict = defaultdict(lambda: {"tokens": 0, "queries": 0, "reset_at": None, "hour_reset_at": None})

def get_user_id(request: Request) -> str:
    """Get user identifier from headers or IP."""
    return (
        request.headers.get("x-user-id") or
        request.headers.get("x-forwarded-for") or
        request.client.host or
        "anonymous"
    )

def check_rate_limit(user_id: str) -> dict:
    """
    Check if user has exceeded limits.
    Returns dict with status and reset time.
    """
    now = datetime.utcnow()
    usage = _token_usage[user_id]

    # Reset daily tokens at midnight UTC
    if usage["reset_at"] is None or now >= usage["reset_at"]:
        usage["tokens"] = 0
        usage["reset_at"] = (now + timedelta(days=1)).replace(hour=0, minute=0, second=0)

    # Reset hourly queries
    if usage["hour_reset_at"] is None or now >= usage["hour_reset_at"]:
        usage["queries"] = 0
        usage["hour_reset_at"] = now + timedelta(hours=1)

    # Check hourly query limit
    if usage["queries"] >= HOURLY_QUERY_LIMIT:
        reset_in = int((usage["hour_reset_at"] - now).total_seconds() / 60)
        return {
            "allowed": False,
            "reason": "hourly_limit",
            "message": f"You've reached the limit of {HOURLY_QUERY_LIMIT} queries per hour. Try again in {reset_in} minutes.",
            "reset_in_minutes": reset_in,
            "reset_at": usage["hour_reset_at"].isoformat(),
        }

    # Check daily token limit
    if usage["tokens"] >= DAILY_TOKEN_LIMIT:
        reset_at = usage["reset_at"]
        reset_in_hours = int((reset_at - now).total_seconds() / 3600)
        return {
            "allowed": False,
            "reason": "daily_token_limit",
            "message": f"You've used {usage['tokens']:,} tokens today (daily limit: {DAILY_TOKEN_LIMIT:,}). Resets in {reset_in_hours} hours.",
            "tokens_used": usage["tokens"],
            "daily_limit": DAILY_TOKEN_LIMIT,
            "reset_at": reset_at.isoformat(),
        }

    return {"allowed": True, "tokens_used": usage["tokens"], "queries_used": usage["queries"]}

def add_usage(user_id: str, tokens: int):
    """Add token usage for a user."""
    _token_usage[user_id]["tokens"] += tokens
    _token_usage[user_id]["queries"] += 1

# ── Pydantic Models ───────────────────────────────────────────────────────

class QueryRequest(BaseModel):
    prompt: str
    user_id: Optional[str] = None

class ModelResult(BaseModel):
    model_name: str
    model_slug: str
    response: str
    status: str
    tokens: int = 0
    speed_ms: int = 0
    score: float = 0.0

class SafetyEvaluation(BaseModel):
    is_risky: bool
    reason: str
    suggestion: str

class FusionBackendResponse(BaseModel):
    safety_evaluation: SafetyEvaluation
    results: List[ModelResult]
    best_answer: str
    best_model: str
    usage: Optional[dict] = None

class TranscribeResponse(BaseModel):
    text: str
    detected_language: str
    translated_to_english: bool

class RateLimitResponse(BaseModel):
    allowed: bool
    message: str
    reset_at: Optional[str] = None
    tokens_used: Optional[int] = None
    daily_limit: Optional[int] = None

# ── System Prompts ────────────────────────────────────────────────────────

SYSTEM_PROMPT = """You are a helpful, knowledgeable AI assistant. You ALWAYS give detailed, well-structured responses.

STRICT FORMATTING RULES — ALWAYS FOLLOW THESE:
- NEVER give one-line answers
- ALWAYS use ## for main section headers
- ALWAYS use **bold** for key terms and important points
- ALWAYS use bullet points (- ) for lists of items
- ALWAYS use numbered lists (1. 2. 3.) for steps or sequences
- Use ``` code blocks with language for any code
- Use markdown tables for comparisons

RESPONSE STRUCTURE — use this for EVERY response:
1. Start with a brief 1-2 sentence introduction
2. Use ## sections to organize your answer
3. Use bullet points inside each section
4. End with a ## Summary or ## Conclusion section

MATH RULES:
- Inline math: $x^2 + y^2 = z^2$
- Block math on own line: $$\\log_2(235) \\approx 7.89$$

EXAMPLE of how to answer "hi there":
## Greeting
Hi there! I'm your AI assistant, ready to help.

## What I Can Help With
- **Answer questions** on any topic
- **Explain concepts** step by step
- **Write and debug code**
- **Solve math problems** with full working

## Quick Start
1. Ask me any question
2. I'll give you a detailed structured answer
3. Compare my response with other AI models

## Summary
I'm here to provide thorough, accurate, well-formatted answers. What would you like to explore today?

REMEMBER: Short answers are FORBIDDEN. Always be thorough and structured.
"""
MERGE_SYSTEM_PROMPT = """You are an expert AI response synthesizer and technical editor. Your job is to take multiple AI responses to a user query and combine them into ONE definitive, beautifully formatted, comprehensive answer.

STRICT SYNTHESIS & FORMATTING RULES:
1. NO PREAMBLE / META-TEXT: Do NOT start with phrases like "Here is a merged response", "Based on the provided models", or "Combined Answer". Jump directly into the introductory content.
2. STRUCTURE & HEADINGS: Organize the content logically using clear `##` level-2 Markdown headings for main topics and `###` level-3 headings for sub-topics.
3. VISUAL CLARITY:
   - Bold key terms, parameters, and core concepts (`**term**`).
   - Use bulleted lists (`- `) or numbered lists (`1. `) liberally for high scannability.
   - Use Markdown tables for comparisons or structured attributes.
4. CODE & TECHNICAL DATA: Preserve all correct code blocks, ensuring proper language tags (e.g. ```python). Fix any syntax inconsistencies between models.
5. ACCURACY & DEDUPLICATION: Synthesize redundant information cleanly into comprehensive points. If models conflict, select the most technically accurate and logically sound information.
6. CONCLUSION: Always end with a clean `## Summary` or `## Conclusion` section wrapping up the response.
7. MATH FORMATTING: Keep inline equations inside `$ ... $` and standalone block math inside `$$...$$`.
"""
# ── Helpers ───────────────────────────────────────────────────────────────

def estimate_tokens(text: str) -> int:
    return max(1, len(text) // 4)

def score_response(text: str, speed_ms: int) -> float:
    if not text or len(text) < 20:
        return 0.0
    score = 0.0
    length = len(text)
    if length > 2000: score += 40
    elif length > 1200: score += 35
    elif length > 800:  score += 30
    elif length > 400:  score += 22
    elif length > 200:  score += 14
    elif length > 100:  score += 7
    if "##" in text or "###" in text: score += 8
    if "**" in text:                  score += 6
    if "- " in text or "* " in text:  score += 7
    if re.search(r'\d+\.', text):     score += 5
    if "```" in text:                 score += 8
    if "$$" in text:                  score += 6
    if "$" in text:                   score += 3
    sentences = [s.strip() for s in re.split(r'[.!?]', text) if len(s.strip()) > 25]
    score += min(len(sentences) * 1.5, 20)
    words = text.lower().split()
    if len(words) > 10:
        unique_ratio = len(set(words)) / len(words)
        score += round(unique_ratio * 5, 1)
    if speed_ms < 800:    score += 5
    elif speed_ms < 1500: score += 4
    elif speed_ms < 3000: score += 3
    elif speed_ms < 5000: score += 2
    return round(score, 1)

def friendly_error(model_name: str, status_code: int, raw_text: str) -> str:
    if status_code == 429:
        return f"{model_name} is rate-limited. Wait ~60 seconds and try again."
    if status_code in (401, 403):
        return f"{model_name} API key rejected. Check your .env file."
    if status_code == 404:
        return f"{model_name} model not found. Slug may be outdated."
    if status_code >= 500:
        return f"{model_name} server error. Try again shortly."
    return f"{model_name} returned error (HTTP {status_code}). Please try again."

# ── OpenRouter caller ─────────────────────────────────────────────────────

async def call_openrouter(
    client: httpx.AsyncClient,
    messages: list,
    model_name: str,
    slugs: list,
    max_tokens: int = 1200,
) -> ModelResult:
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    if not api_key:
        return ModelResult(model_name=model_name, model_slug=slugs[0],
                           response="Missing OPENROUTER_API_KEY in .env", status="error")
    last_error_text = ""
    last_status = 0
    for slug in slugs:
        start = time.time()
        try:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": os.getenv("YOUR_SITE_URL", "http://localhost:5173"),
                    "X-Title": "Veriq AI",
                },
                json={
                    "model": slug,
                    "messages": messages,
                    "temperature": 0.7,
                    "max_tokens": max_tokens,
                },
                timeout=12.0,   # ✅ 20s timeout for speed
            )
            speed_ms = int((time.time() - start) * 1000)
            if response.status_code == 200:
                data = response.json()
                choices = data.get("choices", [])
                if choices:
                    text = choices[0].get("message", {}).get("content", "")
                    tokens = data.get("usage", {}).get("total_tokens", 0) or estimate_tokens(text)
                    score = score_response(text, speed_ms)
                    print(f"[{model_name}] ✅ '{slug}' — {tokens}tok | {speed_ms}ms | score {score}")
                    return ModelResult(model_name=model_name, model_slug=slug,
                                       response=text, status="success",
                                       tokens=tokens, speed_ms=speed_ms, score=score)
            last_error_text = response.text[:300]
            last_status = response.status_code
            print(f"[{model_name}] ❌ '{slug}' {response.status_code}: {last_error_text[:100]}")
        except httpx.TimeoutException:
            last_error_text = "Timed out"
            last_status = 0
            print(f"[{model_name}] ⏰ '{slug}' timed out")
        except Exception as e:
            last_error_text = str(e)
            last_status = 0

    msg = friendly_error(model_name, last_status, last_error_text) if last_status else f"{model_name} connection error. Is backend running on port 8000?"
    return ModelResult(model_name=model_name, model_slug=slugs[0], response=msg, status="error")

def build_messages(prompt: str, system: str = SYSTEM_PROMPT) -> list:
    return [{"role": "system", "content": system}, {"role": "user", "content": prompt}]

# ── Individual model fetchers ─────────────────────────────────────────────

async def fetch_chatgpt(client: httpx.AsyncClient, messages: list) -> ModelResult:
    return await call_openrouter(client, messages, "GPT-4o",
                                  ["openai/gpt-4o-mini"], max_tokens=1200)

async def fetch_gemini(client: httpx.AsyncClient, messages: list) -> ModelResult:
    return await call_openrouter(client, messages, "Gemini Pro",
                                  ["google/gemini-2.5-flash-lite:free", "openrouter/auto"],
                                  max_tokens=1200)

async def fetch_groq(client: httpx.AsyncClient, messages: list) -> ModelResult:
    api_key = os.getenv("GROQ_API_KEY", "")
    if not api_key:
        return ModelResult(model_name="Llama 3", model_slug="llama-3.1-8b-instant",
                           response="Missing GROQ_API_KEY in .env", status="error")
    start = time.time()
    # Groq: strip image content if any
    safe_messages = []
    for m in messages:
        if isinstance(m.get("content"), list):
            text_parts = [p["text"] for p in m["content"] if p.get("type") == "text"]
            safe_messages.append({"role": m["role"], "content": " ".join(text_parts)})
        else:
            safe_messages.append(m)
    try:
        async with httpx.AsyncClient(timeout=10.0) as c:   # ✅ Groq is fast — 15s max
            response = await c.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json={"model": "llama-3.1-8b-instant", "messages": safe_messages,
                      "max_tokens": 1200, "temperature": 0.7},
            )
        speed_ms = int((time.time() - start) * 1000)
        if response.status_code == 200:
            data = response.json()
            choices = data.get("choices", [])
            if choices:
                text = choices[0].get("message", {}).get("content", "")
                tokens = data.get("usage", {}).get("total_tokens", 0) or estimate_tokens(text)
                score = score_response(text, speed_ms)
                print(f"[Llama3/Groq] ✅ {tokens}tok | {speed_ms}ms | score {score}")
                return ModelResult(model_name="Llama 3", model_slug="llama-3.1-8b-instant",
                                   response=text, status="success",
                                   tokens=tokens, speed_ms=speed_ms, score=score)
        raw_error = response.text[:300]
        return ModelResult(model_name="Llama 3", model_slug="llama-3.1-8b-instant",
                           response=friendly_error("Llama 3", response.status_code, raw_error),
                           status="error", speed_ms=speed_ms)
    except httpx.TimeoutException:
        return ModelResult(model_name="Llama 3", model_slug="llama-3.1-8b-instant",
                           response="Llama 3 timed out. Try again.", status="error")
    except Exception as e:
        return ModelResult(model_name="Llama 3", model_slug="llama-3.1-8b-instant",
                           response=f"Llama 3 error. Is backend running?", status="error")

# ── AI Merge ──────────────────────────────────────────────────────────────

async def generate_ai_merged_answer(
    client: httpx.AsyncClient, user_prompt: str, results: List[ModelResult]
) -> str:
    successful = [r for r in results if r.status == "success" and r.response]
    if not successful:
        return "All AI models encountered errors. Please check your API keys and try again."
    if len(successful) == 1:
        return successful[0].response

    responses_text = ""
    for r in successful:
        responses_text += f"\n\n### {r.model_name}:\n{r.response}"

    merge_prompt = f"Question: {user_prompt}\n\nAI Responses:{responses_text}\n\nCreate ONE perfect merged answer."
    api_key = os.getenv("OPENROUTER_API_KEY", "")
    if not api_key:
        successful.sort(key=lambda r: r.score, reverse=True)
        return successful[0].response

    try:
        response = await client.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json",
                     "HTTP-Referer": os.getenv("YOUR_SITE_URL", "http://localhost:5173"),
                     "X-Title": "Veriq AI"},
            json={"model": "openai/gpt-4o-mini",
                  "messages": [{"role": "system", "content": MERGE_SYSTEM_PROMPT},
                                {"role": "user", "content": merge_prompt}],
                  "temperature": 0.3, "max_tokens": 1500},
            timeout=20.0,
        )
        if response.status_code == 200:
            data = response.json()
            choices = data.get("choices", [])
            if choices:
                return choices[0].get("message", {}).get("content", "")
    except Exception as e:
        print(f"[MergeEngine] Error: {e}")

    successful.sort(key=lambda r: r.score, reverse=True)
    return successful[0].response

# ── Safety ────────────────────────────────────────────────────────────────

def check_safety(prompt: str) -> SafetyEvaluation:
    blocked = ["bomb", "kill", "murder", "hack someone", "child abuse"]
    lower = prompt.lower()
    for word in blocked:
        if word in lower:
            return SafetyEvaluation(is_risky=True,
                                    reason=f"Harmful content: '{word}'",
                                    suggestion="Please rephrase your query.")
    return SafetyEvaluation(is_risky=False, reason="Passed safety scan.", suggestion="None")

# ── File extractor ────────────────────────────────────────────────────────

async def extract_file_content(file: UploadFile) -> dict:
    content = await file.read()
    filename = file.filename or ""
    ext = filename.lower().split(".")[-1] if "." in filename else ""

    if ext in ("txt", "md", "py", "js", "ts", "html", "css", "json", "xml"):
        try:
            text = content.decode("utf-8", errors="ignore")
            return {"type": "text", "content": text[:8000], "filename": filename}
        except Exception:
            return {"type": "error", "content": "Could not read file", "filename": filename}

    if ext == "csv":
        try:
            text = content.decode("utf-8", errors="ignore")
            return {"type": "csv", "content": text[:8000], "filename": filename}
        except Exception:
            return {"type": "error", "content": "Could not read CSV", "filename": filename}

    if ext in ("jpg", "jpeg", "png", "webp", "gif"):
        b64 = base64.b64encode(content).decode("utf-8")
        mime = f"image/{'jpeg' if ext == 'jpg' else ext}"
        return {"type": "image", "content": b64, "mime": mime, "filename": filename}

    if ext == "pdf":
        try:
            pdf_str = content.decode("latin-1", errors="ignore")
            texts = re.findall(r'BT(.*?)ET', pdf_str, re.DOTALL)
            text = ""
            for t in texts:
                strings = re.findall(r'\(([^)]*)\)', t)
                text += " ".join(strings) + "\n"
            if len(text.strip()) < 50:
                text = f"PDF file: {filename}. Content could not be fully extracted."
            return {"type": "pdf", "content": text[:8000], "filename": filename}
        except Exception:
            return {"type": "pdf", "content": f"PDF uploaded: {filename}", "filename": filename}

    if ext == "docx":
        try:
            import zipfile, io
            with zipfile.ZipFile(io.BytesIO(content)) as z:
                with z.open("word/document.xml") as f:
                    xml = f.read().decode("utf-8")
                    text = re.sub(r'<[^>]+>', ' ', xml)
                    text = re.sub(r'\s+', ' ', text).strip()
            return {"type": "docx", "content": text[:8000], "filename": filename}
        except Exception:
            return {"type": "docx", "content": f"Word document: {filename}", "filename": filename}

    try:
        text = content.decode("utf-8", errors="ignore")
        return {"type": "text", "content": text[:8000], "filename": filename}
    except Exception:
        return {"type": "unknown", "content": f"File: {filename} ({len(content)} bytes)", "filename": filename}

# ══════════════════════════════════════════════════════════════════════════
#  ENDPOINTS
# ══════════════════════════════════════════════════════════════════════════

# ── 1. Text query ─────────────────────────────────────────────────────────

@app.post("/api/query", response_model=FusionBackendResponse)
async def process_query(payload: QueryRequest, request: Request):
    user_id = payload.user_id or get_user_id(request)

    # ── Rate limit check ──────────────────────────────────────────────────
    limit_check = check_rate_limit(user_id)
    if not limit_check["allowed"]:
        raise HTTPException(
            status_code=429,
            detail={
                "error": "rate_limit_exceeded",
                "message": limit_check["message"],
                "reset_at": limit_check.get("reset_at"),
                "tokens_used": limit_check.get("tokens_used"),
                "daily_limit": limit_check.get("daily_limit"),
            }
        )

    user_prompt = payload.prompt.strip()
    safety = check_safety(user_prompt)
    if safety.is_risky:
        return FusionBackendResponse(safety_evaluation=safety, results=[],
                                     best_answer="Query blocked for safety reasons.", best_model="None")

    messages = build_messages(user_prompt)

    async with httpx.AsyncClient() as client:
        results_list: List[ModelResult] = await asyncio.gather(
            fetch_chatgpt(client, messages),
            fetch_groq(client, messages),
            fetch_gemini(client, messages),
        )
        best_answer = await generate_ai_merged_answer(client, user_prompt, list(results_list))

    # ── Track token usage ─────────────────────────────────────────────────
    total_tokens = sum(r.tokens for r in results_list) + estimate_tokens(best_answer)
    add_usage(user_id, total_tokens)
    current_usage = _token_usage[user_id]

    successful = [r for r in results_list if r.status == "success"]
    best_model = max(successful, key=lambda r: r.score).model_name if successful else "None"

    return FusionBackendResponse(
        safety_evaluation=safety,
        results=list(results_list),
        best_answer=best_answer,
        best_model=best_model,
        usage={
            "tokens_this_query": total_tokens,
            "tokens_used_today": current_usage["tokens"],
            "daily_limit": DAILY_TOKEN_LIMIT,
            "tokens_remaining": max(0, DAILY_TOKEN_LIMIT - current_usage["tokens"]),
            "queries_this_hour": current_usage["queries"],
            "hourly_limit": HOURLY_QUERY_LIMIT,
        }
    )

# ── 2. File upload ────────────────────────────────────────────────────────

@app.post("/api/query/file", response_model=FusionBackendResponse)
async def process_file_query(
    request: Request,
    file: UploadFile = File(...),
    prompt: str = Form(default=""),
    user_id: str = Form(default=""),
):
    uid = user_id or get_user_id(request)
    limit_check = check_rate_limit(uid)
    if not limit_check["allowed"]:
        raise HTTPException(status_code=429, detail={"message": limit_check["message"], "reset_at": limit_check.get("reset_at")})

    file_data = await extract_file_content(file)
    filename = file_data.get("filename", "file")
    user_question = prompt.strip() if prompt.strip() else f"Please analyze this file: {filename}"

    safety = check_safety(user_question)
    if safety.is_risky:
        return FusionBackendResponse(safety_evaluation=safety, results=[],
                                     best_answer="Query blocked for safety reasons.", best_model="None")

    if file_data["type"] == "image":
        messages_vision = [
            {"role": "system", "content": "You are an expert image analyst. Describe and analyze the image in detail."},
            {"role": "user", "content": [
                {"type": "image_url", "image_url": {"url": f"data:{file_data['mime']};base64,{file_data['content']}"}},
                {"type": "text", "text": user_question},
            ]},
        ]
        messages_text = build_messages(f"An image was uploaded ({filename}). {user_question}")
    else:
        file_content = file_data.get("content", "")
        combined = f"File: {filename}\n\nContent:\n{file_content}\n\nQuestion: {user_question}"
        messages_vision = build_messages(combined, "You are an expert document analyst. Answer questions about the provided file content.")
        messages_text = messages_vision

    async with httpx.AsyncClient() as client:
        results_list: List[ModelResult] = await asyncio.gather(
            fetch_chatgpt(client, messages_vision),
            fetch_groq(client, messages_text),
            fetch_gemini(client, messages_vision),
        )
        best_answer = await generate_ai_merged_answer(client, user_question, list(results_list))

    total_tokens = sum(r.tokens for r in results_list)
    add_usage(uid, total_tokens)
    successful = [r for r in results_list if r.status == "success"]
    best_model = max(successful, key=lambda r: r.score).model_name if successful else "None"
    return FusionBackendResponse(safety_evaluation=safety, results=list(results_list),
                                  best_answer=best_answer, best_model=best_model)

# ── 3. Voice transcription ────────────────────────────────────────────────

@app.post("/api/voice/transcribe", response_model=TranscribeResponse)
async def transcribe_voice(audio: UploadFile = File(...)):
    groq_key = os.getenv("GROQ_API_KEY", "")
    if not groq_key:
        raise HTTPException(500, "GROQ_API_KEY not set.")

    audio_content = await audio.read()
    filename = audio.filename or "audio.webm"

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/audio/transcriptions",
                headers={"Authorization": f"Bearer {groq_key}"},
                files={"file": (filename, audio_content, audio.content_type or "audio/webm")},
                data={"model": "whisper-large-v3", "response_format": "verbose_json"},
            )
            if response.status_code != 200:
                raise HTTPException(500, f"Transcription failed: {response.text[:200]}")

            result = response.json()
            transcribed_text = result.get("text", "").strip()
            detected_lang = result.get("language", "unknown")
            translated = False
            final_text = transcribed_text

            # Auto-translate Gujarati → English
            if detected_lang in ("gujarati", "gu") or any('\u0A80' <= c <= '\u0AFF' for c in transcribed_text):
                try:
                    tr = await client.post(
                        "https://api.groq.com/openai/v1/chat/completions",
                        headers={"Authorization": f"Bearer {groq_key}", "Content-Type": "application/json"},
                        json={"model": "llama-3.1-8b-instant",
                              "messages": [
                                  {"role": "system", "content": "Translate Gujarati to English. Return ONLY the translation."},
                                  {"role": "user", "content": transcribed_text}
                              ], "temperature": 0.1, "max_tokens": 300},
                        timeout=15.0,
                    )
                    if tr.status_code == 200:
                        final_text = tr.json()["choices"][0]["message"]["content"].strip()
                        translated = True
                except Exception:
                    pass

            return TranscribeResponse(text=final_text, detected_language=detected_lang,
                                       translated_to_english=translated)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(500, f"Voice error: {str(e)}")

# ── 4. Usage stats ────────────────────────────────────────────────────────

@app.get("/api/usage/{user_id}")
async def get_usage(user_id: str):
    """Get current token usage for a user."""
    usage = _token_usage.get(user_id, {"tokens": 0, "queries": 0})
    return {
        "user_id": user_id,
        "tokens_used_today": usage.get("tokens", 0),
        "daily_limit": DAILY_TOKEN_LIMIT,
        "tokens_remaining": max(0, DAILY_TOKEN_LIMIT - usage.get("tokens", 0)),
        "queries_this_hour": usage.get("queries", 0),
        "hourly_limit": HOURLY_QUERY_LIMIT,
        "percentage_used": round((usage.get("tokens", 0) / DAILY_TOKEN_LIMIT) * 100, 1),
    }

# ── Health ────────────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {"status": "Veriq AI Backend running ✅", "version": "2.0"}

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": "2.0",
        "features": {
            "text_query":         True,
            "file_upload":        True,
            "voice_transcribe":   bool(os.getenv("GROQ_API_KEY")),
            "gujarati_translate": bool(os.getenv("GROQ_API_KEY")),
            "ai_merge":           bool(os.getenv("OPENROUTER_API_KEY")),
            "token_limits":       True,
        },
        "limits": {
            "daily_tokens":  DAILY_TOKEN_LIMIT,
            "hourly_queries": HOURLY_QUERY_LIMIT,
        },
        "keys": {
            "openrouter": bool(os.getenv("OPENROUTER_API_KEY")),
            "groq":       bool(os.getenv("GROQ_API_KEY")),
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)