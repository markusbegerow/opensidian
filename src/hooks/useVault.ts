import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { useVaultStore } from "../store/vaultStore";
import type { FsEvent } from "../types/vault";

export function useVaultWatcher() {
  const vaultPath = useVaultStore((s) => s.vaultPath);
  const handleFsEvent = useVaultStore((s) => s.handleFsEvent);

  useEffect(() => {
    if (!vaultPath) return;

    // Start the Rust watcher
    invoke("watch_vault", { path: vaultPath }).catch(console.error);

    // Listen for FS change events
    const unlisten = listen<FsEvent>("vault://changed", (event) => {
      handleFsEvent(event.payload);
    });

    return () => {
      invoke("unwatch_vault").catch(console.error);
      unlisten.then((fn) => fn());
    };
  }, [vaultPath, handleFsEvent]);
}
