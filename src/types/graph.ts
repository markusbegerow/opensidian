import type { SimulationNodeDatum, SimulationLinkDatum } from "d3";

export interface GraphNode extends SimulationNodeDatum {
  id: string;
  label: string;
  group: string;
  linkCount: number;
  color?: string; // explicit color from emoji prefix (overrides group color)
  preview?: string[]; // first 3 # / ## heading texts
}

export interface GraphEdge extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
}
