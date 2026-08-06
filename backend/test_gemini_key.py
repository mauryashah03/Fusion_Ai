"""
Standalone Gemini key tester — bypasses the FastAPI app entirely.
Run this directly to confirm whether the key/quota issue is server-side
(Google) or something in your app's setup.

Usage:
    python test_gemini_key.py
"""
import os
import sys
import pathlib
import httpx
from dotenv import load_dotenv

load_dotenv(dotenv_path=pathlib.Path(__file__).parent / ".env", override=True)

api_key = os.getenv("GEMINI_API_KEY", "")

if not api_key:
    print("❌ GEMINI_API_KEY not found in .env — check the file is in the same folder as this script.")
    sys.exit(1)

print(f"🔑 Using key starting with: {api_key[:10]}... (length {len(api_key)})")

url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + api_key

try:
    response = httpx.post(
        url,
        headers={"Content-Type": "application/json"},
        json={
            "contents": [{"parts": [{"text": "Say hello in 5 words."}]}],
            "generationConfig": {"maxOutputTokens": 50},
        },
        timeout=15.0,
    )

    print(f"\n📡 HTTP Status: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        text = data["candidates"][0]["content"]["parts"][0]["text"]
        print(f"✅ SUCCESS — Gemini responded: {text.strip()}")
    else:
        print("❌ FAILED — full raw response below:\n")
        print(response.text)

        # Try to pinpoint the quota type
        if response.status_code == 429:
            body = response.text.lower()
            if "per_day" in body or "perday" in body:
                print("\n👉 This looks like a DAILY quota limit. Wait 24h or use a key on a fresh project.")
            elif "per_minute" in body or "perminute" in body:
                print("\n👉 This looks like a PER-MINUTE rate limit. Wait 60 seconds and retry.")
            else:
                print("\n👉 Generic 429 — check the 'quotaId' or 'violations' field above for specifics.")

except httpx.TimeoutException:
    print("❌ Request timed out — check your internet connection or firewall.")
except Exception as e:
    print(f"❌ Unexpected error: {e}")