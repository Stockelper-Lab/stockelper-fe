export type BacktestingStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | string;

export type BacktestingAnalysisStatus =
  | "pending"
  | "running"
  | "completed"
  | "failed"
  | string;

export interface BacktestingInputParameters {
  start_date?: string;
  end_date?: string;
  target_symbols?: string[];
  target_corp_names?: string[];
  use_dart_disclosure?: boolean;
  sort_by?: string;
  event_indicator_conditions?: unknown[];
  [key: string]: unknown;
}

export interface BacktestingInputJson {
  query?: string;
  user_id?: number;
  parameters?: BacktestingInputParameters | null;
  stock_symbol?: string | null;
  stock_ticker?: string | null;
  strategy_type?: string | null;
  candidate_symbols?: string[];
  [key: string]: unknown;
}

export interface BacktestingOutputJson {
  total_return?: number;
  annualized_return?: number;
  mdd?: number;
  win_rate?: number;
  sharpe_ratio?: number;
  total_trades?: number;
  total_profit?: number;
  total_loss?: number;
  [key: string]: unknown;
}

export interface BacktestingAnalysisJson {
  summary?: string[];
  next_experiments?: string[];
  limitations_and_warnings?: string[];
  performance_interpretation?: string;
  trade_and_rebalance_characteristics?: string;
  [key: string]: unknown;
}

export interface BacktestingHistoryItem {
  id: string;
  jobId: string;
  userId: number;
  requestSource: string;
  status: BacktestingStatus;
  inputJson: BacktestingInputJson | null;
  outputJson: BacktestingOutputJson | null;
  resultFilePath: string | null;
  reportFilePath: string | null;
  errorMessage: string | null;
  analysisStatus: BacktestingAnalysisStatus;
  analysisMd: string | null;
  analysisJson: BacktestingAnalysisJson | null;
  analysisModel: string | null;
  analysisPromptVersion: string | null;
  analysisErrorMessage: string | null;
  analysisStartedAt: string | null;
  analysisCompletedAt: string | null;
  analysisElapsedSeconds: number | null;
  elapsedSeconds: number | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function safeJsonParse<T = unknown>(value: unknown): T | null {
  if (value == null) return null;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return null;
    try {
      return JSON.parse(trimmed) as T;
    } catch {
      return null;
    }
  }

  if (typeof value === "object") {
    return value as T;
  }

  return null;
}

