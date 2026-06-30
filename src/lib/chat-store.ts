import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ModelResponse } from "./ai-models";

export type ChatRecord = {
  id: string;
  prompt: string;
  createdAt: number;
  responses: ModelResponse[];
  merged?: string;
  saved?: boolean;
};

type ChatState = {
  history: ChatRecord[];
  addRecord: (r: ChatRecord) => void;
  toggleSaved: (id: string) => void;
  removeRecord: (id: string) => void;
  clearHistory: () => void;
};

export const useChat = create<ChatState>()(
  persist(
    (set) => ({
      history: [],
      addRecord: (r) => set((s) => ({ history: [r, ...s.history].slice(0, 200) })),
      toggleSaved: (id) =>
        set((s) => ({
          history: s.history.map((r) => (r.id === id ? { ...r, saved: !r.saved } : r)),
        })),
      removeRecord: (id) =>
        set((s) => ({ history: s.history.filter((r) => r.id !== id) })),
      clearHistory: () => set({ history: [] }),
    }),
    { name: "Veriq AI-chat" },
  ),
);
