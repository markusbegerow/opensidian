import { useState, useEffect, useCallback } from "react";
import { PanelGroup, Panel, PanelResizeHandle } from "react-resizable-panels";
import { GitGraph, MessageSquare } from "lucide-react";
import { Sidebar } from "../sidebar/Sidebar";
import { EditorPane } from "../editor/EditorPane";
import { BacklinksPanel } from "../backlinks/BacklinksPanel";
import { StatusBar } from "./StatusBar";
import { GraphModal } from "../graph/GraphModal";
import { ChatPanel } from "../chat/ChatPanel";
import { SettingsModal } from "../settings/SettingsModal";
import { useVaultWatcher } from "../../hooks/useVault";
import { useEditorStore } from "../../store/editorStore";
import { useVaultStore } from "../../store/vaultStore";
import { useSettingsStore } from "../../store/settingsStore";

export function AppShell() {
  const [showGraph, setShowGraph] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const isIndexing = useVaultStore((s) => s.isIndexing);
  const settingsOpen = useSettingsStore((s) => s.isOpen);

  useVaultWatcher();

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "s") {
          e.preventDefault();
          useEditorStore.getState().saveFile();
        }
        if (e.key === "g") {
          e.preventDefault();
          setShowGraph((v) => !v);
        }
      }
    },
    []
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="flex flex-col h-screen">
      {/* Main panel layout */}
      <div className="flex-1 min-h-0">
        <PanelGroup direction="horizontal" autoSaveId="app-shell">
          {/* Sidebar */}
          <Panel defaultSize={20} minSize={12} maxSize={40}>
            <Sidebar />
          </Panel>
          <PanelResizeHandle className="w-px bg-border hover:bg-accent transition-colors cursor-col-resize" />

          {/* Editor */}
          <Panel defaultSize={55} minSize={20}>
            <div className="h-full relative">
              {isIndexing && (
                <div className="absolute inset-x-0 top-0 z-10 h-0.5 bg-accent/30 animate-pulse" />
              )}
              <EditorPane />
            </div>
          </Panel>
          <PanelResizeHandle className="w-px bg-border hover:bg-accent transition-colors cursor-col-resize" />

          {/* Right panel — backlinks + chat toggle */}
          <Panel defaultSize={25} minSize={15} maxSize={40}>
            <div className="h-full flex flex-col bg-surface border-l border-border">
              {/* Panel header with Graph + Chat toggles */}
              <div className="flex items-center justify-between px-3 py-2 border-b border-border shrink-0">
                <div className="flex items-center gap-1">
                  <button
                    className={`text-xs px-2 py-1 rounded hover:bg-white/5 ${!showChat ? "text-foreground font-medium" : "text-muted hover:text-accent"}`}
                    onClick={() => setShowChat(false)}
                  >
                    Backlinks
                  </button>
                  <button
                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-white/5 ${showChat ? "text-accent font-medium" : "text-muted hover:text-accent"}`}
                    onClick={() => setShowChat(true)}
                    title="AI Chat"
                  >
                    <MessageSquare size={12} />
                    Chat
                  </button>
                </div>
                <button
                  className="flex items-center gap-1 text-xs text-muted hover:text-accent px-2 py-1 rounded hover:bg-white/5"
                  onClick={() => setShowGraph(true)}
                  title="Open graph view (Ctrl+G)"
                >
                  <GitGraph size={13} />
                  Graph
                </button>
              </div>
              {showChat ? <ChatPanel /> : <BacklinksPanel />}
            </div>
          </Panel>
        </PanelGroup>
      </div>

      <StatusBar />

      {showGraph && <GraphModal onClose={() => setShowGraph(false)} />}
      {settingsOpen && <SettingsModal />}
    </div>
  );
}
