import { create } from "zustand";
import { vaultRef } from "../lib/vaultRef";
import { updateConfigKeys } from "../lib/configFile";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface LLMSettings {
  url: string;
  model: string;
  token: string;
}

interface LLMState {
  messages: ChatMessage[];
  settings: LLMSettings;
  isLoading: boolean;

  addMessage: (msg: Omit<ChatMessage, "id">) => void;
  clearChat: () => void;
  setLoading: (v: boolean) => void;
  updateSettings: (s: LLMSettings) => void;
}

export const useLLMStore = create<LLMState>()((set) => ({
  messages: [],
  settings: { url: "", model: "", token: "" },
  isLoading: false,

  addMessage: (msg) =>
    set((state) => ({
      messages: [
        ...state.messages,
        { ...msg, id: `${Date.now()}-${Math.random()}` },
      ],
    })),

  clearChat: () => set({ messages: [] }),

  setLoading: (v) => set({ isLoading: v }),

  updateSettings: (s) => {
    set({ settings: s });
    if (vaultRef.path) {
      updateConfigKeys(vaultRef.path, {
        "llm.url": s.url,
        "llm.model": s.model,
        "llm.token": s.token,
      });
    }
  },
}));
