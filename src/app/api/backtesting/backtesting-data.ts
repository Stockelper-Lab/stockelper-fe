import { prisma } from "@/lib/prisma";
import {
  BacktestingAnalysisJson,
  BacktestingHistoryItem,
  BacktestingInputJson,
  BacktestingOutputJson,
  safeJsonParse,
} from "@/lib/types/backtesting";

interface BacktestingRow {
  id: string;
  job_id: string;
  user_id: number;
  request_source: string;
  status: string;
  input_json: unknown;
  output_json: unknown;
  result_file_path: string | null;
  report_file_path: string | null;
  error_message: string | null;
  analysis_status: string;
  analysis_md: string | null;
  analysis_json: unknown;
  analysis_model: string | null;
  analysis_prompt_version: string | null;
  analysis_error_message: string | null;
  analysis_started_at: Date | null;
  analysis_completed_at: Date | null;
  analysis_elapsed_seconds: number | null;
  elapsed_seconds: number | null;
  started_at: Date | null;
  completed_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

function mapRow(row: BacktestingRow): BacktestingHistoryItem {
  return {
    id: row.id,
    jobId: row.job_id,
    userId: row.user_id,
    requestSource: row.request_source,
    status: row.status,
    inputJson: safeJsonParse<BacktestingInputJson>(row.input_json),
    outputJson: safeJsonParse<BacktestingOutputJson>(row.output_json),
    resultFilePath: row.result_file_path,
    reportFilePath: row.report_file_path,
    errorMessage: row.error_message,
    analysisStatus: row.analysis_status,
    analysisMd: row.analysis_md,
    analysisJson: safeJsonParse<BacktestingAnalysisJson>(row.analysis_json),
    analysisModel: row.analysis_model,
    analysisPromptVersion: row.analysis_prompt_version,
    analysisErrorMessage: row.analysis_error_message,
    analysisStartedAt: row.analysis_started_at?.toISOString() ?? null,
    analysisCompletedAt: row.analysis_completed_at?.toISOString() ?? null,
    analysisElapsedSeconds: row.analysis_elapsed_seconds,
    elapsedSeconds: row.elapsed_seconds,
    startedAt: row.started_at?.toISOString() ?? null,
    completedAt: row.completed_at?.toISOString() ?? null,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

// 특정 사용자의 백테스팅 이력 조회
export async function getBacktestingByUserId(
  userId: number,
  limit: number = 50
): Promise<BacktestingHistoryItem[]> {
  const rows = await prisma.backtesting.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
    take: limit,
  });

  return rows.map(mapRow);
}

// 특정 백테스팅 결과 조회
export async function getBacktestingById(
  id: string
): Promise<BacktestingHistoryItem | null> {
  const row = await prisma.backtesting.findUnique({
    where: { id },
  });

  if (!row) return null;

  return mapRow(row);
}
