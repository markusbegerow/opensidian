import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { basename } from "../lib/tauriFs";

interface WikilinkState {
  /** sourcePath -> Set of target basenames */
  linkMap: Record<string, string[]>;
  /** targetBasename -> Set of source paths */
  backlinkMap: Record<string, string[]>;

  setLinksForFile: (path: string, targets: string[]) => void;
  removeFile: (path: string) => void;
  reset: () => void;
}

export const useWikilinkStore = create<WikilinkState>()(
  immer((set) => ({
    linkMap: {},
    backlinkMap: {},

    setLinksForFile: (path, targets) => {
      set((state) => {
        // Remove old backlinks from this source
        const oldTargets = state.linkMap[path] ?? [];
        for (const oldTarget of oldTargets) {
          const sources = state.backlinkMap[oldTarget];
          if (sources) {
            state.backlinkMap[oldTarget] = sources.filter((s) => s !== path);
            if (state.backlinkMap[oldTarget].length === 0) {
              delete state.backlinkMap[oldTarget];
            }
          }
        }

        // Set new outbound links
        state.linkMap[path] = targets;

        // Add new backlinks
        for (const target of targets) {
          if (!state.backlinkMap[target]) {
            state.backlinkMap[target] = [];
          }
          if (!state.backlinkMap[target].includes(path)) {
            state.backlinkMap[target].push(path);
          }
        }
      });
    },

    removeFile: (path) => {
      set((state) => {
        // Remove outbound links and their backlink entries
        const targets = state.linkMap[path] ?? [];
        for (const target of targets) {
          const sources = state.backlinkMap[target];
          if (sources) {
            state.backlinkMap[target] = sources.filter((s) => s !== path);
            if (state.backlinkMap[target].length === 0) {
              delete state.backlinkMap[target];
            }
          }
        }
        delete state.linkMap[path];

        // Remove this file as a backlink target
        const name = basename(path, ".md");
        delete state.backlinkMap[name];
      });
    },

    reset: () => {
      set((state) => {
        state.linkMap = {};
        state.backlinkMap = {};
      });
    },
  }))
);
