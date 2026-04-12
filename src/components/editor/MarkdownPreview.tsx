import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEditorStore } from "../../store/editorStore";
import { useVaultStore } from "../../store/vaultStore";
import { resolveWikilink } from "../../lib/wikilinkParser";

// Replace [[wikilinks]] with markdown links before rendering
function preprocessWikilinks(content: string): string {
  return content.replace(
    /\[\[([^\[\]|#]+?)(?:#([^\[\]|]*))?(?:\|([^\[\]]*))?\]\]/g,
    (_match, target, _anchor, alias) => {
      const display = alias ?? target;
      return `[${display}](wikilink://${encodeURIComponent(target)})`;
    }
  );
}

export function MarkdownPreview() {
  const content = useEditorStore((s) => s.content);
  const files = useVaultStore((s) => s.files);
  const openFile = useEditorStore((s) => s.openFile);

  const processed = preprocessWikilinks(content);

  return (
    <div className="markdown-preview h-full w-full overflow-y-auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children }) {
            if (href?.startsWith("wikilink://")) {
              const target = decodeURIComponent(href.replace("wikilink://", ""));
              const resolved = resolveWikilink(target, files);
              return (
                <a
                  onClick={(e) => {
                    e.preventDefault();
                    if (resolved) openFile(resolved.path);
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {children}
                </a>
              );
            }
            return (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  );
}
