import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { EditorView } from "@codemirror/view";
import { useEditorStore } from "../../store/editorStore";
import { useVaultStore } from "../../store/vaultStore";
import { useThemeStore } from "../../store/themeStore";
import { resolveWikilink } from "../../lib/wikilinkParser";

export function CodeMirrorEditor() {
  const content = useEditorStore((s) => s.content);
  const setContent = useEditorStore((s) => s.setContent);
  const openFile = useEditorStore((s) => s.openFile);
  const files = useVaultStore((s) => s.files);
  const theme = useThemeStore((s) => s.theme);

  // Click handler for [[wikilinks]] in the editor
  const wikilinkClickHandler = EditorView.domEventHandlers({
    click(event, view) {
      const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
      if (pos === null) return false;

      const doc = view.state.doc.toString();
      // Find [[...]] spanning the click position
      const wikilinkRe = /\[\[([^\[\]]+?)\]\]/g;
      let match: RegExpExecArray | null;
      wikilinkRe.lastIndex = 0;
      while ((match = wikilinkRe.exec(doc)) !== null) {
        const start = match.index;
        const end = start + match[0].length;
        if (pos >= start && pos <= end) {
          const target = match[1].split(/[|#]/)[0].trim();
          const resolved = resolveWikilink(target, files);
          if (resolved) {
            openFile(resolved.path);
            return true;
          }
        }
      }
      return false;
    },
  });

  return (
    <CodeMirror
      value={content}
      height="100%"
      extensions={[
        markdown(),
        ...(theme === "dark" ? [oneDark] : []),
        EditorView.lineWrapping,
        wikilinkClickHandler,
      ]}
      onChange={setContent}
      basicSetup={{
        lineNumbers: false,
        foldGutter: false,
        highlightActiveLine: true,
        searchKeymap: true,
      }}
      style={{ height: "100%", fontSize: "16px" }}
    />
  );
}
