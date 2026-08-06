import { create } from "zustand";
import type { ModelResponse } from "./ai-models";

type ShareState = {
  prompt: string;
  responses: ModelResponse[];
  merged?: string;
  setShareData: (data: { prompt: string; responses: ModelResponse[]; merged?: string }) => void;
  clearShareData: () => void;
};

export const useShareChat = create<ShareState>((set) => ({
  prompt: "",
  responses: [],
  merged: undefined,
  setShareData: ({ prompt, responses, merged }) => set({ prompt, responses, merged }),
  clearShareData: () => set({ prompt: "", responses: [], merged: undefined }),
}));