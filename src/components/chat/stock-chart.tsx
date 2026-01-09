"use client";

import {
  addEdge,
  Connection,
  Controls,
  Edge,
  Handle,
  NodeTypes,
  Position,
  ReactFlow,
  Node as ReactFlowNode,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { LabeledArrowEdge } from "./labeled-arrow-edge";
import {
  NodeProperties,
  NodePropertiesPanel,
  SelectedGraphNode,
} from "./node-properties-panel";
import { Subgraph } from "./types";

// 노드 타입 정의
interface NodeData {
  id: string;
  type: string;
  label: string;
  typeLabel?: string;
  properties?: NodeProperties;
  isPlaceholder?: boolean;
}

// 엣지 타입 정의
interface EdgeData {
  id: string;
  source: string;
  target: string;
  label: string;
}

// 노드 컴포넌트 Props 타입 정의
interface NodeComponentProps {
  data: {
    label: string;
    nodeType?: string;
    properties?: NodeProperties;
    isPlaceholder?: boolean;
  };
}

// 확장된 GraphData 인터페이스
interface ExtendedGraphData {
  nodes: NodeData[];
  edges: EdgeData[];
}

interface StockChartProps {
  subgraphData: Subgraph | null;
}

const HIDDEN_HANDLE_STYLE = {
  opacity: 0,
  width: 1,
  height: 1,
  border: 0,
  background: "transparent",
} as const;

function getCircleNodeTheme(nodeType?: string): { bg: string; border: string } {
  const type = nodeType ? toSlug(nodeType) : "";
  if (type.includes("stockprice")) {
    return {
      bg: "bg-red-400/60 dark:bg-red-500/40",
      border: "border-red-500 dark:border-red-400",
    };
  }
  if (type.includes("company")) {
    return {
      bg: "bg-purple-400/60 dark:bg-purple-500/40",
      border: "border-purple-500 dark:border-purple-400",
    };
  }
  if (type.includes("document")) {
    return {
      bg: "bg-pink-400/55 dark:bg-pink-500/40",
      border: "border-pink-500 dark:border-pink-400",
    };
  }
  if (type.includes("event")) {
    return {
      bg: "bg-fuchsia-400/55 dark:bg-fuchsia-500/40",
      border: "border-fuchsia-500 dark:border-fuchsia-400",
    };
  }
  if (type.includes("date")) {
    return {
      bg: "bg-emerald-400/55 dark:bg-emerald-500/40",
      border: "border-emerald-500 dark:border-emerald-400",
    };
  }
  return {
    bg: "bg-zinc-300/55 dark:bg-zinc-600/35",
    border: "border-zinc-400 dark:border-zinc-500",
  };
}

function getCompactNodeLabel(data: NodeComponentProps["data"]): string {
  const rawLabel = normalizeText(data.label);
  const nodeType = typeof data.nodeType === "string" ? data.nodeType : "";
  const type = nodeType ? toSlug(nodeType) : "";
  const properties = data.properties;

  let label = rawLabel;

  if (type.includes("date")) {
    const date = typeof properties?.date === "string" ? properties.date : null;
    if (date) {
      label = date;
    } else if (rawLabel.includes(":")) {
      label = rawLabel.split(":").pop() || rawLabel;
    }
  } else if (type.includes("stockprice")) {
    const tradedAt =
      typeof properties?.traded_at === "string" ? properties.traded_at : null;
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

// 사진 스타일(원형) 노드
const CircleNode = React.memo(({ data }: NodeComponentProps) => {
  const theme = getCircleNodeTheme(data.nodeType);
  const displayLabel = getCompactNodeLabel(data);
  const isPlaceholder = Boolean(data.isPlaceholder);

  return (
    <div
      className={[
        "relative flex items-center justify-center text-center rounded-full border-2 shadow-sm",
        "w-[72px] h-[72px] px-2",
        theme.bg,
        theme.border,
        isPlaceholder ? "border-dashed" : "",
      ].join(" ")}
      title={data.label}
    >
      {/* source handles */}
      <Handle
        type="source"
        position={Position.Left}
        id="sl"
        style={HIDDEN_HANDLE_STYLE}
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="sr"
        style={HIDDEN_HANDLE_STYLE}
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="st"
        style={HIDDEN_HANDLE_STYLE}
        isConnectable={false}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="sb"
        style={HIDDEN_HANDLE_STYLE}
        isConnectable={false}
      />

      {/* target handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="tl"
        style={HIDDEN_HANDLE_STYLE}
        isConnectable={false}
      />
      <Handle
        type="target"
        position={Position.Right}
        id="tr"
        style={HIDDEN_HANDLE_STYLE}
        isConnectable={false}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="tt"
        style={HIDDEN_HANDLE_STYLE}
        isConnectable={false}
      />
      <Handle
        type="target"
        position={Position.Bottom}
        id="tb"
        style={HIDDEN_HANDLE_STYLE}
        isConnectable={false}
      />

      <span className="text-[11px] leading-tight font-medium text-zinc-900 dark:text-zinc-50 select-none">
        {displayLabel}
      </span>
    </div>
  );
});
CircleNode.displayName = "CircleNode";

// 관계(Edge) 한글 번역 매핑
const relationshipTranslation: Record<string, string> = {
  BELONGS_TO: "소속됨",
  HAS_COMPETITOR: "경쟁사",
  USES: "사용함",
  PRODUCES: "생산함",
  PROVIDES: "제공함",
  OWNS: "소유함",
  PART_OF: "일부분",
  MANAGES: "관리함",
  LEADS: "이끎",
  ACQUIRES: "인수함",
  INVESTS_IN: "투자함",
  SUPPLIES: "공급함",
  COLLABORATES_WITH: "협력함",
  DISTRIBUTES: "유통함",
  PARTNERS_WITH: "파트너십",
  SUBSIDIARY_OF: "자회사",
  PARENT_OF: "모회사",
  // 추가 관계 번역 필요시 여기에 추가
};

/**
 * 관계 이름을 한글로 번역하는 함수
 * @param relationship 영문 관계 이름
 * @returns 한글로 번역된 관계 이름 또는 원본 이름
 */
function translateRelationship(relationship: string): string {
  const normalized = relationship.toUpperCase().replace(/\s+/g, "_");
  return relationshipTranslation[normalized] || relationship;
}

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

/**
 * Subgraph 데이터를 ExtendedGraphData로 변환하는 함수
 */
function convertSubgraphToExtendedGraphData(
  subgraph: Subgraph
): ExtendedGraphData {
  const nodes: NodeData[] = [];
  const nodeIdSet = new Set<string>();
  const inputNodeIdSet = new Set<string>();
  const createdFromRelations: string[] = [];

  const upsertNode = (
    name: string,
    type: string,
    source: "node" | "relation",
    properties?: NodeProperties
  ) => {
    const id = makeNodeId(name, type);
    if (nodeIdSet.has(id)) {
      if (source === "node" && process.env.NODE_ENV !== "production") {
        console.warn("[subgraph] 중복 노드(id 충돌):", { id, name, type });
      }
      return id;
    }
    nodeIdSet.add(id);
    if (source === "relation" && !inputNodeIdSet.has(id)) {
      createdFromRelations.push(id);
    }
    nodes.push({
      id,
      type: toSlug(type),
      typeLabel: normalizeText(type),
      label: normalizeText(name),
      properties,
      isPlaceholder: source === "relation" && !inputNodeIdSet.has(id),
    });
    return id;
  };

  // 노드 변환 (name+type 기반 ID로 충돌 방지)
  subgraph.node.forEach((node) => {
    const id = upsertNode(node.node_name, node.node_type, "node", node.properties);
    inputNodeIdSet.add(id);
  });

  // 엣지 변환 (name+type 기반 ID 매칭 + 엣지 ID 안정화)
  const edges: EdgeData[] = subgraph.relation.map((relation, index) => {
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
    const relationshipLabel = translateRelationship(relation.relationship);
    const edgeId = `${sourceId}__${targetId}__${toSlug(
      relation.relationship
    )}__${index}`;

    return {
      id: edgeId,
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

  return { nodes, edges };
}

/**
 * 노드 위치를 자동으로 계산하는 함수 - 향상된 레이아웃 알고리즘
 */
function calculateNodesPosition(
  nodes: NodeData[],
  edges: EdgeData[]
): ReactFlowNode[] {
  if (nodes.length === 0) return [];

  const NODE_WIDTH = 150;
  const NODE_HEIGHT = 100;
  const HORIZONTAL_GAP = 250;
  const VERTICAL_GAP = 120;

  // 노드 연결 그래프 생성 (인바운드 및 아웃바운드 모두 추적)
  const outboundGraph: Record<string, string[]> = {};
  const inboundGraph: Record<string, string[]> = {};
  const inDegree: Record<string, number> = {};
  const outDegree: Record<string, number> = {};

  // 그래프 초기화
  nodes.forEach((node) => {
    const id = node.id;
    outboundGraph[id] = [];
    inboundGraph[id] = [];
    inDegree[id] = 0;
    outDegree[id] = 0;
  });

  // 엣지 연결 정보 추가
  edges.forEach((edge) => {
    const source = edge.source;
    const target = edge.target;

    if (outboundGraph[source]) {
      outboundGraph[source].push(target);
      outDegree[source] = (outDegree[source] || 0) + 1;
    }

    if (inboundGraph[target]) {
      inboundGraph[target].push(source);
      inDegree[target] = (inDegree[target] || 0) + 1;
    }
  });

  // 중요도 점수 계산 (연결이 많은 노드가 중앙에 오도록)
  const importanceScore: Record<string, number> = {};
  nodes.forEach((node) => {
    const id = node.id;
    // 인바운드와 아웃바운드 연결 수를 모두 고려
    importanceScore[id] = (inDegree[id] || 0) + (outDegree[id] || 0);
  });

  // 중요도 기준으로 노드 정렬
  const sortedNodes = [...nodes].sort(
    (a, b) => importanceScore[b.id] - importanceScore[a.id]
  );

  // 루트 노드 결정 (중요도가 가장 높은 노드, 또는 인바운드가 없는 노드 중 중요도가 높은 노드)
  let rootNodes: string[] = [];

  // 우선 인바운드가 없는 노드들을 찾음
  const sourceNodes = nodes
    .filter((node) => inDegree[node.id] === 0)
    .map((node) => node.id);

  if (sourceNodes.length > 0) {
    // 인바운드가 없는 노드 중 중요도 순으로 정렬
    rootNodes = sourceNodes.sort(
      (a, b) => importanceScore[b] - importanceScore[a]
    );
  } else {
    // 인바운드가 없는 노드가 없으면 중요도가 가장 높은 노드를 루트로 선택
    rootNodes = [sortedNodes[0].id];
  }

  // 계층별 노드 분류를 위한 BFS
  const layers: string[][] = [];
  const visited: Record<string, boolean> = {};
  const layerMap: Record<string, number> = {};
  const queue: string[] = [...rootNodes];

  // 루트 노드들은 첫 번째 계층에 배치
  rootNodes.forEach((nodeId) => {
    layerMap[nodeId] = 0;
  });

  // BFS로 계층 구조 파악
  while (queue.length > 0) {
    const nodeId = queue.shift()!;

    if (!layers[layerMap[nodeId]]) {
      layers[layerMap[nodeId]] = [];
    }

    // 현재 계층에 노드 추가
    layers[layerMap[nodeId]].push(nodeId);
    visited[nodeId] = true;

    // 아웃바운드 엣지를 따라 다음 계층의 노드들 처리
    outboundGraph[nodeId].forEach((targetId) => {
      // 아직 방문하지 않았거나, 더 깊은 계층으로 이동해야 하는 경우
      if (!layerMap[targetId] || layerMap[targetId] < layerMap[nodeId] + 1) {
        layerMap[targetId] = layerMap[nodeId] + 1;
      }

      if (!visited[targetId] && !queue.includes(targetId)) {
        queue.push(targetId);
      }
    });

    // 인바운드 엣지에 연결된 노드 중 아직 처리되지 않은 노드가 있다면 처리
    // (이렇게 하면 역방향 연결도 고려하여 모든 노드를 배치할 수 있음)
    inboundGraph[nodeId].forEach((sourceId) => {
      if (!visited[sourceId] && !queue.includes(sourceId)) {
        // 역방향 연결된 노드는 현재 노드보다 이전 계층에 배치
        layerMap[sourceId] = Math.max(0, layerMap[nodeId] - 1);
        queue.push(sourceId);
      }
    });
  }

  // 방문하지 않은 노드가 있다면 별도 처리 (연결되지 않은 노드)
  nodes.forEach((node) => {
    if (!visited[node.id]) {
      // 연결되지 않은 노드는 새로운 계층(맨 위)에 배치
      if (!layers[0]) layers[0] = [];
      layers[0].push(node.id);
      visited[node.id] = true;
    }
  });

  // 각 계층 내에서 노드 정렬 (중요도 순)
  layers.forEach((layerNodes, index) => {
    layers[index] = layerNodes.sort(
      (a, b) => importanceScore[b] - importanceScore[a]
    );
  });

  // 최종 노드 포지션 계산
  const positions: Record<string, { x: number; y: number }> = {};

  // 각 계층별로 노드 배치
  layers.forEach((layerNodes, layerIndex) => {
    const layerWidth =
      layerNodes.length * (NODE_WIDTH + HORIZONTAL_GAP) - HORIZONTAL_GAP;
    const startX = -layerWidth / 2 + NODE_WIDTH / 2;

    // 계층 내 각 노드의 위치 결정
    layerNodes.forEach((nodeId, nodeIndex) => {
      positions[nodeId] = {
        x: startX + nodeIndex * (NODE_WIDTH + HORIZONTAL_GAP),
        y: layerIndex * (NODE_HEIGHT + VERTICAL_GAP),
      };
    });
  });

  // 엣지 방향을 고려한 위치 최적화
  // 여러 번 반복하여 점진적으로 위치 개선
  for (let iteration = 0; iteration < 3; iteration++) {
    // 각 노드에 대해 연결된 노드들의 위치를 고려하여 위치 조정
    nodes.forEach((node) => {
      const nodeId = node.id;
      const outgoingNodes = outboundGraph[nodeId] || [];
      const incomingNodes = inboundGraph[nodeId] || [];

      if (outgoingNodes.length > 0 || incomingNodes.length > 0) {
        let avgX = 0;
        let count = 0;

        // 아웃바운드 노드의 X좌표 평균을 계산 (약간 오른쪽으로 가중치)
        outgoingNodes.forEach((targetId) => {
          if (positions[targetId]) {
            avgX += positions[targetId].x * 1.5; // 오른쪽에 있는 노드쪽으로 더 가중치
            count++;
          }
        });

        // 인바운드 노드의 X좌표 평균을 계산 (약간 왼쪽으로 가중치)
        incomingNodes.forEach((sourceId) => {
          if (positions[sourceId]) {
            avgX += positions[sourceId].x * 0.5; // 왼쪽에 있는 노드쪽으로 가중치 줄임
            count++;
          }
        });

        // 연결된 노드가 있는 경우만 조정
        if (count > 0) {
          const currentX = positions[nodeId].x;
          const targetX = avgX / count;

          // 점진적으로 위치 조정 (급격한 변화 방지)
          positions[nodeId].x = currentX * 0.7 + targetX * 0.3;
        }
      }
    });
  }

  // 중복 위치 조정 (같은 위치에 여러 노드가 있을 경우)
  const usedPositions: Record<string, boolean> = {};
  const adjustPosition = (nodeId: string) => {
    const pos = positions[nodeId];
    const posKey = `${Math.round(pos.x)},${Math.round(pos.y)}`;

    if (usedPositions[posKey]) {
      // 겹치면 약간 이동 (X축으로만 이동하여 계층 구조 유지)
      pos.x += HORIZONTAL_GAP / 3;

      // 재귀적으로 확인
      adjustPosition(nodeId);
    } else {
      usedPositions[posKey] = true;
    }
  };

  // 모든 노드에 대해 위치 조정
  Object.keys(positions).forEach(adjustPosition);

  // ReactFlow 노드 형식으로 변환
  return nodes.map((node) => ({
    id: node.id,
    type: "circle",
    data: {
      label: node.label,
      nodeType: node.typeLabel ?? node.type,
      properties: node.properties,
      isPlaceholder: node.isPlaceholder,
    },
    position: positions[node.id] || { x: 0, y: 0 },
    draggable: true,
  }));
}

type LayoutMode = "radial" | "hierarchy";

/**
 * 방사형(사진 스타일) 레이아웃 - 중심 노드 기준으로 거리별 원형 배치
 */
function calculateNodesPositionRadial(
  nodes: NodeData[],
  edges: EdgeData[]
): ReactFlowNode[] {
  if (nodes.length === 0) return [];

  const adjacency: Record<string, string[]> = {};
  const degree: Record<string, number> = {};

  nodes.forEach((node) => {
    adjacency[node.id] = [];
    degree[node.id] = 0;
  });

  edges.forEach((edge) => {
    if (adjacency[edge.source]) adjacency[edge.source].push(edge.target);
    if (adjacency[edge.target]) adjacency[edge.target].push(edge.source);
    degree[edge.source] = (degree[edge.source] || 0) + 1;
    degree[edge.target] = (degree[edge.target] || 0) + 1;
  });

  const root =
    [...nodes].sort((a, b) => (degree[b.id] || 0) - (degree[a.id] || 0))[0]?.id ||
    nodes[0].id;

  const dist: Record<string, number> = { [root]: 0 };
  const queue: string[] = [root];

  while (queue.length > 0) {
    const current = queue.shift()!;
    const d = dist[current] ?? 0;
    adjacency[current]?.forEach((next) => {
      if (dist[next] === undefined) {
        dist[next] = d + 1;
        queue.push(next);
      }
    });
  }

  const maxDist = Math.max(0, ...Object.values(dist));
  const fallbackLayer = maxDist + 1; // 연결되지 않은 노드는 가장 바깥 원에 배치

  const layers: Record<number, string[]> = {};
  nodes.forEach((node) => {
    const layer = dist[node.id] ?? fallbackLayer;
    if (!layers[layer]) layers[layer] = [];
    layers[layer].push(node.id);
  });

  Object.keys(layers).forEach((key) => {
    layers[Number(key)].sort((a, b) => (degree[b] || 0) - (degree[a] || 0));
  });

  const positions: Record<string, { x: number; y: number }> = {};
  const RADIUS_STEP = 190;

  const sortedLayers = Object.keys(layers)
    .map(Number)
    .sort((a, b) => a - b);

  sortedLayers.forEach((layer) => {
    const ids = layers[layer];
    if (!ids || ids.length === 0) return;

    if (layer === 0) {
      positions[ids[0]] = { x: 0, y: 0 };
      return;
    }

    const count = ids.length;
    const radius = layer * RADIUS_STEP + Math.min(160, count * 6);

    ids.forEach((id, idx) => {
      const angle = (2 * Math.PI * idx) / count;
      positions[id] = {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
      };
    });
  });

  return nodes.map((node) => ({
    id: node.id,
    type: "circle",
    data: {
      label: node.label,
      nodeType: node.typeLabel ?? node.type,
      properties: node.properties,
      isPlaceholder: node.isPlaceholder,
    },
    position: positions[node.id] || { x: 0, y: 0 },
    draggable: true,
  }));
}

/**
 * 엣지 데이터를 ReactFlow 엣지 형식으로 변환
 */
function createInitialEdges(edges: EdgeData[], positionedNodes: ReactFlowNode[]): Edge[] {
  const NODE_DIAMETER = 72;
  const positionMap = new Map<string, { x: number; y: number }>();
  positionedNodes.forEach((n) => positionMap.set(n.id, n.position));

  const pickHandles = (sourceId: string, targetId: string) => {
    const sp = positionMap.get(sourceId);
    const tp = positionMap.get(targetId);
    if (!sp || !tp) {
      return { sourceHandle: "sr", targetHandle: "tl" };
    }

    const sx = sp.x + NODE_DIAMETER / 2;
    const sy = sp.y + NODE_DIAMETER / 2;
    const tx = tp.x + NODE_DIAMETER / 2;
    const ty = tp.y + NODE_DIAMETER / 2;

    const dx = tx - sx;
    const dy = ty - sy;

    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx >= 0
        ? { sourceHandle: "sr", targetHandle: "tl" }
        : { sourceHandle: "sl", targetHandle: "tr" };
    }

    return dy >= 0
      ? { sourceHandle: "sb", targetHandle: "tt" }
      : { sourceHandle: "st", targetHandle: "tb" };
  };

  return edges.map((edge, index) => {
    const { sourceHandle, targetHandle } = pickHandles(edge.source, edge.target);
    return {
      id: edge.id || `e${index + 1}`,
      source: edge.source,
      target: edge.target,
      sourceHandle,
      targetHandle,
      type: "labeledArrow",
      label: edge.label,
      style: { stroke: "#94a3b8", strokeWidth: 1.5 },
    };
  });
}

export function StockChart({ subgraphData }: StockChartProps) {
  // 노드와 엣지 상태 초기화
  const [nodes, setNodes, onNodesChange] = useNodesState<ReactFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [selectedNode, setSelectedNode] = useState<SelectedGraphNode | null>(
    null
  );
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("radial");

  // 노드 타입 정의 - 메모이제이션으로 렌더링 최적화
  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      circle: CircleNode,
    }),
    []
  );

  const edgeTypes = useMemo(() => ({ labeledArrow: LabeledArrowEdge }), []);

  // 데이터 유무 상태
  const [hasData, setHasData] = useState(false);

  // 데이터 가공 및 초기 레이아웃 설정
  useEffect(() => {
    // subgraphData가 있으면 변환하여 사용
    if (subgraphData && subgraphData.node && subgraphData.node.length > 0) {
      setHasData(true);
      const data = convertSubgraphToExtendedGraphData(subgraphData);
      console.log("API에서 받은 서브그래프 데이터:", subgraphData);
      console.log("변환된 그래프 데이터:", data);

      // 노드 위치 계산
      const positionedNodes =
        layoutMode === "radial"
          ? calculateNodesPositionRadial(data.nodes, data.edges)
          : calculateNodesPosition(data.nodes, data.edges);
      const initialEdges = createInitialEdges(data.edges, positionedNodes);

      console.log("계산된 노드:", positionedNodes);
      console.log("계산된 엣지:", initialEdges);

      setNodes(positionedNodes);
      setEdges(initialEdges);
      setSelectedNode(null);
    } else {
      setHasData(false);
      setNodes([]);
      setEdges([]);
      setSelectedNode(null);
    }
  }, [subgraphData, layoutMode, setEdges, setNodes]);

  // 엣지 연결 핸들러
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) =>
      addEdge(
        {
          ...params,
          type: "labeledArrow",
          style: { stroke: "#94a3b8", strokeWidth: 1.5 },
        },
        eds
      )
    );
  }, [setEdges]);

  // 스냅 그리드 설정
  const snapGrid = useMemo(() => [20, 20] as [number, number], []);

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span>🔍</span> 관계 네트워크
        </h3>
        <div className="flex items-center gap-1 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/70 dark:bg-zinc-900/40 p-1">
          <button
            type="button"
            onClick={() => setLayoutMode("radial")}
            className={[
              "px-2 py-1 rounded-md text-[11px] transition-colors",
              layoutMode === "radial"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
            ].join(" ")}
          >
            방사형
          </button>
          <button
            type="button"
            onClick={() => setLayoutMode("hierarchy")}
            className={[
              "px-2 py-1 rounded-md text-[11px] transition-colors",
              layoutMode === "hierarchy"
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
                : "text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
            ].join(" ")}
          >
            계층형
          </button>
        </div>
      </div>
      {hasData ? (
        <div className="flex-1 w-full flex flex-col min-h-0">
          <div className="flex-1 min-h-[300px]">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={(_, node) => {
                const data = node.data as unknown as {
                  label?: string;
                  nodeType?: string;
                  properties?: NodeProperties;
                  isPlaceholder?: boolean;
                };
                setSelectedNode({
                  id: node.id,
                  label: data.label || node.id,
                  nodeType: data.nodeType,
                  properties: data.properties,
                  isPlaceholder: data.isPlaceholder,
                });
              }}
              onPaneClick={() => setSelectedNode(null)}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              snapToGrid={true}
              snapGrid={snapGrid}
              fitView
              className="rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-800"
              proOptions={{ hideAttribution: true }}
              defaultEdgeOptions={{
                type: "labeledArrow",
                style: { stroke: "#94a3b8", strokeWidth: 1.5 },
              }}
            >
              <Controls className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-md" />
            </ReactFlow>
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
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-xs text-zinc-700 dark:text-zinc-300">
                  회사
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-fuchsia-500"></div>
                <span className="text-xs text-zinc-700 dark:text-zinc-300">
                  이벤트/문서
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-xs text-zinc-700 dark:text-zinc-300">
                  주가
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs text-zinc-700 dark:text-zinc-300">
                  날짜
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-zinc-500"></div>
                <span className="text-xs text-zinc-700 dark:text-zinc-300">
                  기타
                </span>
              </div>
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
