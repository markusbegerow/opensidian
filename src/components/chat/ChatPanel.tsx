import { useState, useRef, useEffect } from "react";
import { Send, Trash2, Loader2, Bot } from "lucide-react";
import { useLLMStore } from "../../store/llmStore";
import { useEditorStore } from "../../store/editorStore";
import { useSettingsStore } from "../../store/settingsStore";
import { callLLM, buildApiMessages } from "../../lib/llmService";
import { buildSystemPrompt } from "../../lib/contextBuilder";
import { basename } from "../../lib/tauriFs";

export function ChatPanel() {
  const { messages, settings, isLoading, addMessage, clearChat, setLoading } =
    useLLMStore();
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const openSettings = useSettingsStore((s) => s.open);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const isConfigured = !!(settings.url && settings.model);
  const activeFileName = activeFilePath
    ? basename(activeFilePath, ".md")
    : null;

  async function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;

    if (!isConfigured) {
      openSettings("llm");
      return;
    }

    setInput("");
    addMessage({ role: "user", content: text });
    setLoading(true);

    try {
      const systemPrompt = await buildSystemPrompt();
      const apiMessages = buildApiMessages(systemPrompt, messages, text);
      const reply = await callLLM(settings, apiMessages);
      addMessage({ role: "assistant", content: reply });
    } catch (e: unknown) {
      addMessage({
        role: "assistant",
        content: `Error: ${e instanceof Error ? e.message : String(e)}`,
      });
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="h-full flex flex-col bg-surface">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
        <div className="flex items-center gap-1.5">
          <Bot size={14} className="text-accent" />
          <span className="text-sm font-medium">Chat</span>
          {activeFileName && (
            <span className="text-xs text-muted truncate max-w-[120px]">
              · {activeFileName}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-muted hover:text-foreground p-1 rounded hover:bg-white/5"
              title="Clear chat"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {messages.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted space-y-2">
            <Bot size={28} className="opacity-30" />
            <p className="text-xs">
              {isConfigured
                ? activeFileName
                  ? `Ask anything about "${activeFileName}" or your vault.`
                  : "Open a note to start chatting."
                : "Configure your LLM to get started."}
            </p>
            {!isConfigured && (
              <button
                onClick={() => openSettings("llm")}
                className="text-xs text-accent hover:underline"
              >
                Open settings
              </button>
            )}
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-xs whitespace-pre-wrap break-words leading-relaxed ${
                msg.role === "user"
                  ? "bg-accent text-white"
                  : "bg-background border border-border text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-background border border-border rounded-lg px-3 py-2">
              <Loader2 size={13} className="animate-spin text-muted" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-2 border-t border-border shrink-0">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your notes… (Enter to send)"
            rows={1}
            className="flex-1 bg-background border border-border rounded px-3 py-2 text-xs resize-none focus:outline-none focus:border-accent placeholder:text-muted"
            style={{ minHeight: "36px", maxHeight: "120px" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-2 rounded bg-accent text-white hover:bg-accent/80 disabled:opacity-40 shrink-0"
          >
            <Send size={13} />
          </button>
        </div>
      </div>

    </div>
  );
}
