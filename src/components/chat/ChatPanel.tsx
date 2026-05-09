import { useState, useRef, useEffect } from "react";
import { Send, Trash2, Loader2, Bot } from "lucide-react";
import ReactMarkdown, { defaultUrlTransform } from "react-markdown";
import remarkGfm from "remark-gfm";
import { openUrl } from "@tauri-apps/plugin-opener";
import { useLLMStore } from "../../store/llmStore";
import { useEditorStore } from "../../store/editorStore";
import { useVaultStore } from "../../store/vaultStore";
import { useSettingsStore } from "../../store/settingsStore";
import { callLLM, buildApiMessages } from "../../lib/llmService";
import { buildSystemPrompt } from "../../lib/contextBuilder";
import { basename } from "../../lib/tauriFs";
import { resolveWikilink } from "../../lib/wikilinkParser";

function preprocessSources(content: string): string {
  return content.replace(
    /\[Source:\s*([^\]]+)\]/g,
    (_match, names: string) =>
      names
        .split(",")
        .map((n) => `[[${n.trim()}]]`)
        .join(" ")
  );
}

function preprocessWikilinks(content: string): string {
  return content.replace(
    /\[\[([^\[\]|#]+?)(?:#[^\[\]|]*)?(?:\|[^\[\]]*)?\]\]/g,
    (_match, target) => `[${target}](wikilink://${encodeURIComponent(target)})`
  );
}

function preprocessChatContent(content: string): string {
  return preprocessWikilinks(preprocessSources(content));
}

interface Props {
  vaultMode?: boolean;
  onNavigate?: () => void;
}

export function ChatPanel({ vaultMode, onNavigate }: Props = {}) {
  const { messages, settings, isLoading, addMessage, clearChat, setLoading } =
    useLLMStore();
  const activeFilePath = useEditorStore((s) => s.activeFilePath);
  const openFile = useEditorStore((s) => s.openFile);
  const files = useVaultStore((s) => s.files);
  const openSettings = useSettingsStore((s) => s.open);
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const isConfigured = !!(settings.url && settings.model);
  const activeFileName = activeFilePath ? basename(activeFilePath, ".md") : null;

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
      const apiUserContent = settings.userPrompt?.trim()
        ? `${settings.userPrompt.trim()}\n\n${text}`
        : text;
      const apiMessages = buildApiMessages(systemPrompt, messages, apiUserContent);
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
          {vaultMode ? (
            <span className="text-xs text-muted truncate max-w-[120px]">· All notes</span>
          ) : activeFileName ? (
            <span className="text-xs text-muted truncate max-w-[120px]">· {activeFileName}</span>
          ) : null}
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
                ? vaultMode || activeFileName
                  ? vaultMode
                    ? "Ask anything about your vault."
                    : `Ask anything about "${activeFileName}" or your vault.`
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
            {msg.role === "user" ? (
              <div className="max-w-[85%] rounded-lg px-3 py-2 text-xs whitespace-pre-wrap break-words leading-relaxed bg-accent text-white">
                {msg.content}
              </div>
            ) : (
              <div className="max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed bg-background border border-border text-foreground">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  urlTransform={(url) =>
                    url.startsWith("wikilink://") ? url : defaultUrlTransform(url)
                  }
                  components={{
                    p({ children }) {
                      return <p className="mb-1.5 last:mb-0">{children}</p>;
                    },
                    ul({ children }) {
                      return <ul className="list-disc pl-4 mb-1.5 space-y-0.5">{children}</ul>;
                    },
                    ol({ children }) {
                      return <ol className="list-decimal pl-4 mb-1.5 space-y-0.5">{children}</ol>;
                    },
                    li({ children }) {
                      return <li>{children}</li>;
                    },
                    strong({ children }) {
                      return <strong className="font-semibold">{children}</strong>;
                    },
                    h1({ children }) {
                      return <h1 className="font-semibold text-sm mb-1 mt-2">{children}</h1>;
                    },
                    h2({ children }) {
                      return <h2 className="font-semibold mb-1 mt-2">{children}</h2>;
                    },
                    h3({ children }) {
                      return <h3 className="font-medium mb-1 mt-1.5">{children}</h3>;
                    },
                    code({ children, className }) {
                      const isBlock = Boolean(className?.includes("language-"));
                      return isBlock ? (
                        <code className="block bg-black/20 rounded px-2 py-1 my-1 text-[11px] font-mono overflow-x-auto whitespace-pre">
                          {children}
                        </code>
                      ) : (
                        <code className="bg-black/20 rounded px-1 text-[11px] font-mono">{children}</code>
                      );
                    },
                    a({ href, children }) {
                      if (href?.startsWith("wikilink://")) {
                        const target = decodeURIComponent(href.replace("wikilink://", ""));
                        const resolved = resolveWikilink(target, files);
                        return (
                          <a
                            href="#"
                            className={
                              resolved
                                ? "text-accent underline cursor-pointer"
                                : "text-muted line-through cursor-not-allowed opacity-60"
                            }
                            onClick={(e) => {
                              e.preventDefault();
                              if (resolved) {
                                openFile(resolved.path).catch(console.error);
                                onNavigate?.();
                              }
                            }}
                          >
                            {children}
                          </a>
                        );
                      }
                      return (
                        <a
                          href={href}
                          className="text-accent underline cursor-pointer"
                          onClick={async (e) => {
                            e.preventDefault();
                            if (!href) return;
                            try {
                              await openUrl(href);
                            } catch {
                              window.open(href, "_blank");
                            }
                          }}
                        >
                          {children}
                        </a>
                      );
                    },
                  }}
                >
                  {preprocessChatContent(msg.content)}
                </ReactMarkdown>
              </div>
            )}
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
