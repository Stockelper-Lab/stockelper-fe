export interface Message {
  id: string;
  role: "user" | "assistant" | "question";
  content: string;
  timestamp: Date;
  subgraph?: Subgraph;
  trading_action?: TradingAction | null;
  error?: string | null;
  feedbackResponse?: boolean | null;
  progressStep?: string | null; // 현재 진행 중인 분석 단계
}

// 진행 단계별 표시 텍스트
export const PROGRESS_STEP_LABELS: Record<string, string> = {
  // 메인 에이전트
  supervisor: "작업을 분배하고 있어요",
  MarketAnalysisAgent: "시장 동향을 분석하고 있어요",
  FundamentalAnalysisAgent: "기업 펀더멘털을 분석하고 있어요",
  TechnicalAnalysisAgent: "기술적 지표를 분석하고 있어요",
  
  // 세부 분석 작업
  analize_financial_statements: "재무제표를 살펴보고 있어요",
  analysis_stock: "종목 데이터를 분석하고 있어요",
  predict_stock: "주가 흐름을 예측하고 있어요",
  korean_stock_chart_analysis: "차트 패턴을 분석하고 있어요",
  search_investment_bank_report: "증권사 리포트를 검색하고 있어요",
  search_news: "관련 뉴스를 수집하고 있어요",
  financial_knowledge_graph_analysis: "금융 지식 그래프를 탐색하고 있어요",
  report_sentiment_analysis: "리포트 감성을 분석하고 있어요",
};

// 로딩 팁 메시지 (랜덤으로 표시)
export const LOADING_TIPS: string[] = [
  "AI가 여러 데이터 소스를 종합하고 있어요",
  "더 정확한 분석을 위해 여러 에이전트가 협력 중이에요",
  "실시간 시장 데이터를 수집하고 있어요",
  "과거 패턴과 현재 상황을 비교 분석 중이에요",
  "신뢰할 수 있는 정보만 필터링하고 있어요",
  "복잡한 금융 데이터를 이해하기 쉽게 정리 중이에요",
];

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
