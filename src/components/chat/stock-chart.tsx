"use client";

import {
  addEdge,
  Background,
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
import { Subgraph } from "./types";

// 노드 타입 정의
interface NodeData {
  id: string;
  type: string;
  label: string;
}

// 엣지 타입 정의
interface EdgeData {
  source: string;
  target: string;
  label: string;
}

// 노드 컴포넌트 Props 타입 정의
interface NodeComponentProps {
  data: {
    label: string;
    [key: string]: unknown; // For any other properties
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

// 기업 노드 컴포넌트 - memo 사용으로 불필요한 리렌더링 방지
const CompanyNode = React.memo(({ data }: NodeComponentProps) => {
  return (
    <div className="p-3 rounded-xl shadow-lg bg-blue-50 dark:bg-blue-900 border-2 border-blue-200 dark:border-blue-700 min-w-[100px] text-center relative">
      {/* 핸들 추가 - 상하좌우 방향 */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: "#3b82f6", width: "10px", height: "10px" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: "#3b82f6", width: "10px", height: "10px" }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ background: "#3b82f6", width: "10px", height: "10px" }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ background: "#3b82f6", width: "10px", height: "10px" }}
      />
      <div className="font-medium flex flex-col items-center gap-1 text-blue-700 dark:text-blue-300">
        <span className="text-xl">🏢</span>
        <span>{data.label}</span>
      </div>
    </div>
  );
});
CompanyNode.displayName = "CompanyNode";

// 인물 노드 컴포넌트 - memo 사용으로 불필요한 리렌더링 방지
const PersonNode = React.memo(({ data }: NodeComponentProps) => {
  return (
    <div className="p-3 rounded-xl shadow-lg bg-green-50 dark:bg-green-900 border-2 border-green-200 dark:border-green-700 min-w-[100px] text-center relative">
      {/* 핸들 추가 - 좌우 방향 */}
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: "#10b981", width: "10px", height: "10px" }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: "#10b981", width: "10px", height: "10px" }}
      />
      <div className="font-medium flex flex-col items-center gap-1 text-green-700 dark:text-green-300">
        <span className="text-xl">👤</span>
        <span>{data.label}</span>
      </div>
    </div>
  );
});
PersonNode.displayName = "PersonNode";

// 제품/서비스 노드 컴포넌트 - memo 사용으로 불필요한 리렌더링 방지
const ProductNode = React.memo(({ data }: NodeComponentProps) => {
  return (
    <div className="p-3 rounded-xl shadow-lg bg-amber-50 dark:bg-amber-900 border-2 border-amber-200 dark:border-amber-700 min-w-[100px] text-center relative">
      {/* 핸들 추가 - 좌우 방향 */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: "#f59e0b", width: "10px", height: "10px" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: "#f59e0b", width: "10px", height: "10px" }}
      />
      <div className="font-medium flex flex-col items-center gap-1 text-amber-700 dark:text-amber-300">
        <span className="text-xl">📦</span>
        <span>{data.label}</span>
      </div>
    </div>
  );
});
ProductNode.displayName = "ProductNode";

// 섹터 노드 컴포넌트
const SectorNode = React.memo(({ data }: NodeComponentProps) => {
  return (
    <div className="p-3 rounded-xl shadow-lg bg-purple-50 dark:bg-purple-900 border-2 border-purple-200 dark:border-purple-700 min-w-[100px] text-center relative">
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ background: "#8b5cf6", width: "10px", height: "10px" }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right"
        style={{ background: "#8b5cf6", width: "10px", height: "10px" }}
      />
      <div className="font-medium flex flex-col items-center gap-1 text-purple-700 dark:text-purple-300">
        <span className="text-xl">🏭</span>
        <span>{data.label}</span>
      </div>
    </div>
  );
});
SectorNode.displayName = "SectorNode";

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

/**
 * Subgraph 데이터를 ExtendedGraphData로 변환하는 함수
 */
function convertSubgraphToExtendedGraphData(
  subgraph: Subgraph
): ExtendedGraphData {
  // 노드 변환
  const nodes: NodeData[] = subgraph.node.map((node) => ({
    id: node.node_name.toLowerCase().replace(/\s+/g, "_"),
    type: node.node_type.toLowerCase(),
    label: node.node_name,
  }));

  // 엣지 변환 (한글 번역 적용)
  const edges: EdgeData[] = subgraph.relation.map((relation) => ({
    source: relation.start.name.toLowerCase().replace(/\s+/g, "_"),
    target: relation.end.name.toLowerCase().replace(/\s+/g, "_"),
    label: translateRelationship(relation.relationship),
  }));

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

  // 노드 타입 매핑
  const nodeTypeMap: Record<string, string> = {
    company: "company",
    person: "person",
    product: "product",
    sector: "sector",
  };

  // ReactFlow 노드 형식으로 변환
  return nodes.map((node) => {
    return {
      id: node.id,
      type: nodeTypeMap[node.type] || "default",
      data: { label: node.label },
      position: positions[node.id] || { x: 0, y: 0 },
      draggable: true,
    };
  });
}

/**
 * 엣지 데이터를 ReactFlow 엣지 형식으로 변환
 */
function createInitialEdges(edges: EdgeData[]): Edge[] {
  return edges.map((edge, index) => ({
    id: `e${index + 1}`,
    source: edge.source,
    target: edge.target,
    sourceHandle: "right",
    targetHandle: "left",
    type: "straight",
    label: edge.label,
    style: { stroke: "#93c5fd", strokeWidth: 2 },
    labelStyle: { fill: "#3b82f6", fontWeight: 500, fontSize: 12 },
    labelBgStyle: { fill: "#dbeafe", fillOpacity: 0.7 },
  }));
}

export function StockChart({ subgraphData }: StockChartProps) {
  // 노드와 엣지 상태 초기화
  const [nodes, setNodes, onNodesChange] = useNodesState<ReactFlowNode>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);

  // 노드 타입 정의 - 메모이제이션으로 렌더링 최적화
  const nodeTypes = useMemo<NodeTypes>(
    () => ({
      company: CompanyNode,
      person: PersonNode,
      product: ProductNode,
      sector: SectorNode,
    }),
    []
  );

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
      const positionedNodes = calculateNodesPosition(data.nodes, data.edges);
      const initialEdges = createInitialEdges(data.edges);

      console.log("계산된 노드:", positionedNodes);
      console.log("계산된 엣지:", initialEdges);

      setNodes(positionedNodes);
      setEdges(initialEdges);
    } else {
      setHasData(false);
      setNodes([]);
      setEdges([]);
    }
  }, [subgraphData]);

  // 엣지 연결 핸들러
  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) =>
      addEdge(
        {
          ...params,
          type: "straight",
          style: { stroke: "#93c5fd", strokeWidth: 2 },
          labelStyle: { fill: "#3b82f6", fontWeight: 500, fontSize: 12 },
          labelBgStyle: { fill: "#dbeafe", fillOpacity: 0.7 },
        },
        eds
      )
    );
  }, []);

  // 스냅 그리드 설정
  const snapGrid = useMemo(() => [20, 20] as [number, number], []);

  return (
    <div className="flex flex-col h-full overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      {/* 헤더 */}
      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <span>🔍</span> 관계 네트워크
        </h3>
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
              nodeTypes={nodeTypes}
              snapToGrid={true}
              snapGrid={snapGrid}
              fitView
              className="rounded-lg overflow-hidden bg-zinc-50 dark:bg-zinc-800"
              proOptions={{ hideAttribution: true }}
              defaultEdgeOptions={{
                type: "straight",
                style: { stroke: "#93c5fd", strokeWidth: 2 },
              }}
            >
              <Background color="#94a3b8" gap={20} size={1} />
              <Controls className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-md" />
            </ReactFlow>
          </div>
          <div className="py-3 flex gap-4 justify-center flex-wrap border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-xs text-zinc-700 dark:text-zinc-300">
                기업
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-xs text-zinc-700 dark:text-zinc-300">
                인물
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <span className="text-xs text-zinc-700 dark:text-zinc-300">
                제품/서비스
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-500"></div>
              <span className="text-xs text-zinc-700 dark:text-zinc-300">
                산업/섹터
              </span>
            </div>
          </div>
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
