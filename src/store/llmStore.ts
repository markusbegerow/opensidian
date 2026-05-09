import { create } from "zustand";
import { vaultRef } from "../lib/vaultRef";
import { updateConfigKeys } from "../lib/configFile";
import { writeFile } from "../lib/tauriFs";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface LLMSettings {
  url: string;
  model: string;
  token: string;
  systemPrompt: string;
  userPrompt: string;
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
  settings: { url: "", model: "", token: "", systemPrompt: "", userPrompt: "" },
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
      writeFile(`${vaultRef.path}/.configs/llm-system-prompt.md`, s.systemPrompt ?? "");
      writeFile(`${vaultRef.path}/.configs/llm-user-prompt.md`, s.userPrompt ?? "");
    }
  },
}));
