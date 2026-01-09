"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import type { ForceGraphMethods, LinkObject, NodeObject } from "react-force-graph-2d";

import type { Subgraph } from "./types";
import type {
  NodeProperties,
  SelectedGraphNode,
} from "./node-properties-panel";
import { NodePropertiesPanel } from "./node-properties-panel";

type ForceNode = {
  id: string;
  label: string;
  nodeType?: string;
  properties?: NodeProperties;
  isPlaceholder?: boolean;
};

type ForceLink = {
  id: string;
  source: string;
  target: string;
  label: string;
};

const GRAPH_STYLE = {
  nodeRadius: 26,
  nodePointerRadius: 30,
  nodeFontSize: 14,
  linkFontSize: 11,
  linkLabelPadding: 3,
  linkLabelOffset: 3,
  linkArrowLength: 9,
  chargeStrength: -320,
  linkDistance: 140,
} as const;

function normalizeText(value: string): string {
  return value.normalize("NFKC").trim().replace(/\s+/g, " ");
}

function toSlug(value: string): string {
  return normalizeText(value).toLowerCase().replace(/\s+/g, "_");
}

function makeNodeId(name: string, type?: string): string {
  const base = toSlug(name);
  const typeSlug = type ? toSlug(type) : "";
  return typeSlug ? `${base}__${typeSlug}` : base;
}

function normalizeRelationship(relationship: string): string {
  return relationship.toUpperCase().replace(/\s+/g, "_");
}

function getNodeColor(nodeType?: string): string {
  const type = nodeType ? toSlug(nodeType) : "";
  if (type.includes("stockprice")) return "rgba(239, 68, 68, 0.70)"; // red-500
  if (type.includes("company")) return "rgba(168, 85, 247, 0.65)"; // purple-500
  if (type.includes("document")) return "rgba(236, 72, 153, 0.60)"; // pink-500
  if (type.includes("event")) return "rgba(217, 70, 239, 0.60)"; // fuchsia-500
  if (type.includes("date")) return "rgba(34, 197, 94, 0.60)"; // green-500
  return "rgba(148, 163, 184, 0.55)"; // slate-400
}

function getCompactNodeLabel(node: ForceNode): string {
  const rawLabel = normalizeText(node.label);
  const type = node.nodeType ? toSlug(node.nodeType) : "";
  const props = node.properties;

  let label = rawLabel;

  if (type.includes("date")) {
    const date = typeof props?.date === "string" ? props.date : null;
    if (date) {
      label = date;
    } else if (rawLabel.includes(":")) {
      label = rawLabel.split(":").pop() || rawLabel;
    }
  } else if (type.includes("stockprice")) {
    const tradedAt =
      typeof props?.traded_at === "string" ? props.traded_at : null;
    if (tradedAt) {
      label = tradedAt;
    } else if (rawLabel.includes("@")) {
      label = rawLabel.split("@").pop() || rawLabel;
    }
  } else {
    const beforeParen = rawLabel.split("(")[0].trim();
    label = beforeParen || rawLabel;
  }

  label = normalizeText(label);
  return label.length > 10 ? `${label.slice(0, 9)}…` : label;
}

function convertSubgraphToForceGraph(subgraph: Subgraph): {
  nodes: ForceNode[];
  links: ForceLink[];
} {
  const nodeMap = new Map<string, ForceNode>();
  const inputNodeIdSet = new Set<string>();
  const createdFromRelations: string[] = [];

  const upsertNode = (
    name: string,
    type: string,
    source: "node" | "relation",
    properties?: NodeProperties
  ) => {
    const id = makeNodeId(name, type);
    if (nodeMap.has(id)) return id;

    if (source === "relation" && !inputNodeIdSet.has(id)) {
      createdFromRelations.push(id);
    }

    nodeMap.set(id, {
      id,
      label: normalizeText(name),
      nodeType: normalizeText(type),
      properties,
      isPlaceholder: source === "relation" && !inputNodeIdSet.has(id),
    });
    return id;
  };

  subgraph.node.forEach((node) => {
    const id = upsertNode(
      node.node_name,
      node.node_type,
      "node",
      node.properties as NodeProperties
    );
    inputNodeIdSet.add(id);
  });

  const links: ForceLink[] = subgraph.relation.map((relation, index) => {
    const sourceId = upsertNode(
      relation.start.name,
      relation.start.type,
      "relation",
      undefined
    );
    const targetId = upsertNode(
      relation.end.name,
      relation.end.type,
      "relation",
      undefined
    );

    const relationshipLabel = normalizeRelationship(relation.relationship);
    const linkId = `${sourceId}__${targetId}__${toSlug(
      relation.relationship
    )}__${index}`;

    return {
      id: linkId,
      source: sourceId,
      target: targetId,
      label: relationshipLabel,
    };
  });

  if (createdFromRelations.length > 0 && process.env.NODE_ENV !== "production") {
    console.warn("[subgraph] relation이 참조했지만 node 목록에 없어서 추가된 노드:", {
      count: createdFromRelations.length,
      ids: createdFromRelations.slice(0, 20),
    });
  }

  return {
    nodes: [...nodeMap.values()],
    links,
  };
}

function useElementSize<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const el = ref.current;
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const { width, height } = entry.contentRect;
      setSize({ width: Math.floor(width), height: Math.floor(height) });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return { ref, size };
}

interface StockForceGraphProps {
  subgraphData: Subgraph | null;
}

export function StockForceGraph({ subgraphData }: StockForceGraphProps) {
  const [selectedNode, setSelectedNode] = useState<SelectedGraphNode | null>(
    null
  );

  const graphData = useMemo(() => {
    if (!subgraphData || !subgraphData.node || subgraphData.node.length === 0) {
      return { nodes: [], links: [] } as { nodes: ForceNode[]; links: ForceLink[] };
    }
    return convertSubgraphToForceGraph(subgraphData);
  }, [subgraphData]);

  const hasData = graphData.nodes.length > 0;

  const { ref: graphRef, size } = useElementSize<HTMLDivElement>();
  type FGNode = NodeObject<ForceNode>;
  type FGLink = LinkObject<ForceNode, ForceLink>;
  type FGMethods = ForceGraphMethods<FGNode, FGLink>;
  const fgRef = useRef<FGMethods | undefined>(undefined);

  // Force 설정 및 화면 맞춤
  useEffect(() => {
    if (!fgRef.current) return;
    if (!hasData) return;
    if (size.width <= 0 || size.height <= 0) return;

    const charge = fgRef.current.d3Force("charge");
    if (charge?.strength) {
      charge.strength(GRAPH_STYLE.chargeStrength);
    }

    const link = fgRef.current.d3Force("link");
    if (link?.distance) {
      link.distance(GRAPH_STYLE.linkDistance);
    }

    fgRef.current.d3ReheatSimulation();

    const t = window.setTimeout(() => {
      fgRef.current?.zoomToFit(450, 60);
    }, 200);

    return () => window.clearTimeout(t);
  }, [hasData, size.height, size.width, graphData]);

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span>🧲</span> 관계 네트워크 (Force)
        </h3>
      </div>

      {hasData ? (
        <div className="flex-1 w-full flex flex-col min-h-0">
          <div
            ref={graphRef}
            className="flex-1 min-h-[320px] bg-white dark:bg-zinc-900"
          >
            {size.width > 0 && size.height > 0 ? (
              <ForceGraph2D
                ref={fgRef}
                width={size.width}
                height={size.height}
                graphData={graphData}
                backgroundColor="rgba(0,0,0,0)"
                nodeLabel={(n) => {
                  const node = n as ForceNode;
                  const type = node.nodeType ? normalizeText(node.nodeType) : "";
                  return type ? `${node.label} (${type})` : node.label;
                }}
                nodeCanvasObjectMode={() => "replace"}
                nodeCanvasObject={(n, ctx) => {
                  const node = n as ForceNode & { x: number; y: number };
                  const r = GRAPH_STYLE.nodeRadius;
                  const label = getCompactNodeLabel(node);
                  const fill = getNodeColor(node.nodeType);

                  // 노드 원
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                  ctx.fillStyle = fill;
                  ctx.fill();
                  ctx.lineWidth = 1;
                  ctx.strokeStyle = "rgba(51, 65, 85, 0.55)";
                  ctx.stroke();

                  // 텍스트
                  const fontSize = GRAPH_STYLE.nodeFontSize;
                  ctx.font = `${fontSize}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
                  ctx.textAlign = "center";
                  ctx.textBaseline = "middle";
                  ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
                  ctx.fillText(label, node.x, node.y);
                }}
                nodePointerAreaPaint={(n, color, ctx) => {
                  const node = n as ForceNode & { x: number; y: number };
                  const r = GRAPH_STYLE.nodePointerRadius;
                  ctx.fillStyle = color;
                  ctx.beginPath();
                  ctx.arc(node.x, node.y, r, 0, 2 * Math.PI, false);
                  ctx.fill();
                }}
                linkDirectionalArrowLength={GRAPH_STYLE.linkArrowLength}
                linkDirectionalArrowRelPos={1}
                linkColor={() => "rgba(100, 116, 139, 0.85)"}
                linkWidth={1}
                linkCanvasObjectMode={() => "after"}
                linkCanvasObject={(l, ctx) => {
                  const link = l as ForceLink & {
                    source: ForceNode & { x: number; y: number };
                    target: ForceNode & { x: number; y: number };
                  };
                  const text = link.label;
                  if (!text) return;

                  const start = link.source;
                  const end = link.target;
                  const midX = (start.x + end.x) / 2;
                  const midY = (start.y + end.y) / 2;
                  const angle = Math.atan2(end.y - start.y, end.x - start.x);

                  const fontSize = GRAPH_STYLE.linkFontSize;
                  ctx.save();
                  ctx.translate(midX, midY);
                  ctx.rotate(angle);
                  if (angle > Math.PI / 2 || angle < -Math.PI / 2) {
                    ctx.rotate(Math.PI);
                  }
                  ctx.font =
                    `${fontSize}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace`;

                  const shown = text.length > 20 ? `${text.slice(0, 19)}…` : text;
                  const metrics = ctx.measureText(shown);
                  const padding = GRAPH_STYLE.linkLabelPadding;
                  const boxW = metrics.width + padding * 2;
                  const boxH = fontSize + padding * 2;

                  // 배경 박스
                  ctx.fillStyle = "rgba(255, 255, 255, 0.72)";
                  ctx.fillRect(
                    -boxW / 2,
                    -boxH - GRAPH_STYLE.linkLabelOffset,
                    boxW,
                    boxH
                  );

                  // 텍스트
                  ctx.fillStyle = "rgba(30, 41, 59, 0.85)";
                  ctx.textAlign = "center";
                  ctx.textBaseline = "middle";
                  ctx.fillText(
                    shown,
                    0,
                    -boxH / 2 - GRAPH_STYLE.linkLabelOffset
                  );
                  ctx.restore();
                }}
                onNodeClick={(n) => {
                  const node = n as ForceNode;
                  setSelectedNode({
                    id: node.id,
                    label: node.label,
                    nodeType: node.nodeType,
                    properties: node.properties,
                    isPlaceholder: node.isPlaceholder,
                  });
                }}
                onBackgroundClick={() => setSelectedNode(null)}
              />
            ) : null}
          </div>

          {selectedNode ? (
            <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <NodePropertiesPanel
                node={selectedNode}
                onClose={() => setSelectedNode(null)}
              />
            </div>
          ) : (
            <div className="py-3 flex gap-4 justify-center flex-wrap border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                노드를 클릭하면 속성을 볼 수 있어요
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-center flex-1 rounded-lg bg-zinc-50 dark:bg-zinc-800 m-4">
          <div className="text-center p-8">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-base font-medium text-zinc-700 dark:text-zinc-300 mb-2">
              관계 네트워크 정보 없음
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              주식 관련 질문을 하시면
              <br />
              관련 기업 및 관계 정보가 표시됩니다.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


