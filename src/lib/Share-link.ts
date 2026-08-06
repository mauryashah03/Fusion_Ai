import { addDoc, collection, doc, getDoc } from "firebase/firestore";
import { firebaseEnabled, getFirebase } from "./firebase";
import type { ModelResponse } from "./ai-models";

export type SharedChatPayload = {
  prompt: string;
  responses: ModelResponse[];
  merged?: string;
  createdAt: number;
};

const SHARE_COLLECTION = "sharedChats";

// btoa/atob only handle Latin1, so we escape/unescape through URI encoding
// to safely round-trip any unicode characters in the prompt/answers.
function encodePayload(payload: SharedChatPayload): string {
  const json = JSON.stringify(payload);
  return btoa(unescape(encodeURIComponent(json)));
}

function decodePayload(encoded: string): SharedChatPayload {
  const json = decodeURIComponent(escape(atob(encoded)));
  return JSON.parse(json) as SharedChatPayload;
}

/**
 * Creates a shareable URL for a chat.
 * - If Firebase/Firestore is configured, stores the chat and returns a short link: /share/{id}
 * - Otherwise, falls back to encoding the whole chat into the URL itself: /share/local?d=...
 *   (no backend required — this always works out of the box)
 */
export async function createShareLink(payload: SharedChatPayload): Promise<string> {
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  if (firebaseEnabled) {
    try {
      const { db } = getFirebase();
      if (db) {
        const ref = await addDoc(collection(db, SHARE_COLLECTION), payload);
        return `${origin}/share/${ref.id}`;
      }
    } catch {
      // Firestore write failed — fall through to the local link below
    }
  }

  return `${origin}/share/local?d=${encodePayload(payload)}`;
}

/** Resolves a shared chat from Firestore (by id) or from the encoded URL payload. */
export async function resolveSharedChat(
  shareId: string,
  encodedData?: string | null,
): Promise<SharedChatPayload | null> {
  if (shareId === "local") {
    if (!encodedData) return null;
    try {
      return decodePayload(encodedData);
    } catch {
      return null;
    }
  }

  if (firebaseEnabled) {
    try {
      const { db } = getFirebase();
      if (db) {
        const snap = await getDoc(doc(db, SHARE_COLLECTION, shareId));
        if (snap.exists()) return snap.data() as SharedChatPayload;
      }
    } catch {
      // ignore and fall through to null
    }
  }

  return null;
}