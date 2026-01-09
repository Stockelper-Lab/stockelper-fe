import { readFile } from "node:fs/promises";
import { join } from "node:path";

import {
  BacktestingAnalysisJson,
  BacktestingHistoryItem,
  BacktestingInputJson,
  BacktestingOutputJson,
  safeJsonParse,
} from "@/lib/types/backtesting";

interface BacktestingRawRow {
  id: string;
  job_id: string;
  user_id: number;
  request_source: string;
  status: string;
  input_json: unknown;
  output_json: unknown;
  result_file_path?: string | null;
  report_file_path?: string | null;
  error_message?: string | null;
  analysis_status: string;
  analysis_md?: string | null;
  analysis_json: unknown;
  analysis_model?: string | null;
  analysis_prompt_version?: string | null;
  analysis_error_message?: string | null;
  analysis_started_at?: string | null;
  analysis_completed_at?: string | null;
  analysis_elapsed_seconds?: number | null;
  elapsed_seconds?: number | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

interface BacktestingRawFile {
  backtesting?: BacktestingRawRow[];
}

function mapRow(row: BacktestingRawRow): BacktestingHistoryItem {
  return {
    id: row.id,
    jobId: row.job_id,
    userId: row.user_id,
    requestSource: row.request_source,
    status: row.status,
    inputJson: safeJsonParse<BacktestingInputJson>(row.input_json),
    outputJson: safeJsonParse<BacktestingOutputJson>(row.output_json),
    resultFilePath: row.result_file_path ?? null,
    reportFilePath: row.report_file_path ?? null,
    errorMessage: row.error_message ?? null,
    analysisStatus: row.analysis_status,
    analysisMd: row.analysis_md ?? null,
    analysisJson: safeJsonParse<BacktestingAnalysisJson>(row.analysis_json),
    analysisModel: row.analysis_model ?? null,
    analysisPromptVersion: row.analysis_prompt_version ?? null,
    analysisErrorMessage: row.analysis_error_message ?? null,
    analysisStartedAt: row.analysis_started_at ?? null,
    analysisCompletedAt: row.analysis_completed_at ?? null,
    analysisElapsedSeconds: row.analysis_elapsed_seconds ?? null,
    elapsedSeconds: row.elapsed_seconds ?? null,
    startedAt: row.started_at ?? null,
    completedAt: row.completed_at ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function loadBacktestingFromFile(): Promise<BacktestingHistoryItem[]> {
  const filePath = join(process.cwd(), "back_testing_result.json");
  const raw = await readFile(filePath, "utf8");
  const parsed = JSON.parse(raw) as BacktestingRawFile;
  const rows = Array.isArray(parsed.backtesting) ? parsed.backtesting : [];
  return rows.map(mapRow);
}

