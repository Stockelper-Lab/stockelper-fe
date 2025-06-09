export interface Message {
  id: string;
  role: "user" | "assistant" | "question";
  content: string;
  timestamp: Date;
  subgraph?: Subgraph;
  trading_action?: TradingAction | null;
  error?: string | null;
  feedbackResponse?: boolean | null;
}

export interface TradingAction {
  order_side?: "buy" | "sell";
  order_type?: "market" | "limit";
  stock_code?: string;
  order_price?: number | null;
  order_quantity?: number;
}

export interface Subgraph {
  node: SubgraphNode[];
  relation: SubgraphRelation[];
}

export interface SubgraphNode {
  node_type: string;
  node_name: string;
  properties: Record<string, string | number | null>;
}

export interface SubgraphRelation {
  relationship: string;
  start: {
    name: string;
    type: string;
  };
  end: {
    name: string;
    type: string;
  };
}
