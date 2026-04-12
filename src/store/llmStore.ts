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

const SETTINGS_KEY = "llm-settings";

function loadSettings(): LLMSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { url: "", model: "", token: "" };
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
  settings: loadSettings(),
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
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
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
