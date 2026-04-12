import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import type { GraphNode, GraphEdge } from "../../types/graph";
import { useEditorStore } from "../../store/editorStore";
import { useColorStore } from "../../store/colorStore";
import { useNoteEmojiStore } from "../../store/noteEmojiStore";
import { useThemeStore } from "../../store/themeStore";

interface Props {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onClose: () => void;
}

interface Tooltip {
  x: number;
  y: number;
  node: GraphNode;
}

export function GraphCanvas({ nodes, edges, onClose }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const openFile = useEditorStore((s) => s.openFile);
  const emojiMap = useColorStore((s) => s.emojiMap);
  const emojiByPath = useNoteEmojiStore((s) => s.emojiByPath);
  const theme = useThemeStore((s) => s.theme);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);

  const categoryForNode = (node: GraphNode): string | null => {
    const emoji = emojiByPath[node.id];
    return emoji ? (emojiMap[emoji]?.label || null) : null;
  };

  useEffect(() => {
    if (!containerRef.current || !svgRef.current) return;

    // Color scale by group (folder)
    const groups = [...new Set(nodes.map((n) => n.group))];
    const color = d3.scaleOrdinal(d3.schemeTableau10).domain(groups);

    let simulation: d3.Simulation<GraphNode, GraphEdge> | null = null;

    const init = (width: number, height: number) => {
      const css = getComputedStyle(document.documentElement);
      const colorText = css.getPropertyValue("--color-text").trim();
      const colorBorder = css.getPropertyValue("--color-border").trim();
      const colorBase = css.getPropertyValue("--color-base").trim();

      const svg = d3.select(svgRef.current!);
      svg.selectAll("*").remove();

      // Zoom container
      const g = svg.append("g");
      svg.call(
        d3.zoom<SVGSVGElement, unknown>()
          .scaleExtent([0.1, 4])
          .on("zoom", (event) => g.attr("transform", event.transform))
      );

      // Clone nodes/links for D3 mutation
      const simNodes: GraphNode[] = nodes.map((n) => ({ ...n }));
      const simEdges: GraphEdge[] = edges.map((e) => ({ ...e }));

      simulation = d3
        .forceSimulation<GraphNode>(simNodes)
        .force("link", d3.forceLink<GraphNode, GraphEdge>(simEdges).id((d) => d.id).distance(80))
        .force("charge", d3.forceManyBody().strength(-120))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide(20));

      // Edges
      const link = g
        .append("g")
        .selectAll("line")
        .data(simEdges)
        .join("line")
        .attr("stroke", colorBorder)
        .attr("stroke-width", 1.5)
        .attr("stroke-opacity", 0.8);

      // Node radius: base 5 + up to 10 more based on linkCount
      const maxLinks = Math.max(1, ...nodes.map((n) => n.linkCount));
      const radius = (d: GraphNode) => 5 + (d.linkCount / maxLinks) * 10;

      // Nodes
      const node = g
        .append("g")
        .selectAll<SVGGElement, GraphNode>("g")
        .data(simNodes)
        .join("g")
        .style("cursor", "pointer")
        .call(
          d3.drag<SVGGElement, GraphNode>()
            .on("start", (event, d) => {
              if (!event.active) simulation!.alphaTarget(0.3).restart();
              d.fx = d.x;
              d.fy = d.y;
            })
            .on("drag", (event, d) => {
              d.fx = event.x;
              d.fy = event.y;
            })
            .on("end", (event, d) => {
              if (!event.active) simulation!.alphaTarget(0);
              d.fx = null;
              d.fy = null;
            })
        );

      node
        .append("circle")
        .attr("r", radius)
        .attr("fill", (d) => d.color ?? color(d.group))
        .attr("stroke", colorBase)
        .attr("stroke-width", 1.5);

      node
        .append("text")
        .text((d) => d.label)
        .attr("x", (d) => radius(d) + 4)
        .attr("y", 4)
        .attr("font-size", 11)
        .attr("fill", colorText)
        .style("pointer-events", "none");

      // Click to open file
      node.on("click", (_event, d) => {
        openFile(d.id);
        onClose();
      });

      // Hover highlight + tooltip
      node
        .on("mouseover", (event, d) => {
          const connected = new Set<string>([d.id]);
          simEdges.forEach((e) => {
            const src = typeof e.source === "object" ? (e.source as GraphNode).id : e.source;
            const tgt = typeof e.target === "object" ? (e.target as GraphNode).id : e.target;
            if (src === d.id) connected.add(tgt);
            if (tgt === d.id) connected.add(src);
          });
          node.style("opacity", (n) => (connected.has(n.id) ? 1 : 0.2));
          link.style("opacity", (e) => {
            const src = typeof e.source === "object" ? (e.source as GraphNode).id : e.source;
            const tgt = typeof e.target === "object" ? (e.target as GraphNode).id : e.target;
            return src === d.id || tgt === d.id ? 1 : 0.05;
          });
          const rect = containerRef.current!.getBoundingClientRect();
          setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, node: d });
        })
        .on("mousemove", (event) => {
          const rect = containerRef.current!.getBoundingClientRect();
          setTooltip((t) => t ? { ...t, x: event.clientX - rect.left, y: event.clientY - rect.top } : t);
        })
        .on("mouseout", () => {
          node.style("opacity", 1);
          link.style("opacity", 0.6);
          setTooltip(null);
        });

      // Simulation tick
      simulation.on("tick", () => {
        link
          .attr("x1", (d) => (d.source as GraphNode).x ?? 0)
          .attr("y1", (d) => (d.source as GraphNode).y ?? 0)
          .attr("x2", (d) => (d.target as GraphNode).x ?? 0)
          .attr("y2", (d) => (d.target as GraphNode).y ?? 0);

        node.attr("transform", (d) => `translate(${d.x ?? 0},${d.y ?? 0})`);
      });
    };

    // Use ResizeObserver so we get real dimensions even if layout isn't settled yet
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) {
        simulation?.stop();
        init(width, height);
      }
    });
    ro.observe(containerRef.current);

    // Also try immediately in case the container is already sized
    const { width, height } = containerRef.current.getBoundingClientRect();
    if (width > 0 && height > 0) {
      init(width, height);
    }

    return () => {
      ro.disconnect();
      simulation?.stop();
      setTooltip(null);
    };
  }, [nodes, edges, openFile, onClose, theme]);

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg
        ref={svgRef}
        className="w-full h-full"
        style={{ background: "var(--color-base)" }}
      />
      {tooltip && (
        <div
          className="pointer-events-none absolute z-50 px-3 py-2 rounded-lg border border-border bg-surface shadow-lg text-xs"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y - 10,
            maxWidth: 220,
          }}
        >
          <div className="flex items-center gap-1.5">
            {tooltip.node.color && (
              <span
                className="inline-block w-2 h-2 rounded-full shrink-0"
                style={{ background: tooltip.node.color }}
              />
            )}
            <p className="font-medium text-foreground truncate">{tooltip.node.label}</p>
          </div>
          {categoryForNode(tooltip.node) && (
            <p className="text-muted mt-0.5 text-[11px]">{categoryForNode(tooltip.node)}</p>
          )}
          <p className="text-muted mt-0.5">{tooltip.node.linkCount} link{tooltip.node.linkCount !== 1 ? "s" : ""}</p>
          {tooltip.node.preview && tooltip.node.preview.length > 0 && (
            <div className="mt-1.5 border-t border-border/50 pt-1.5 space-y-0.5">
              {tooltip.node.preview.map((line, i) => (
                <p key={i} className="text-muted text-[11px] truncate">{line}</p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
