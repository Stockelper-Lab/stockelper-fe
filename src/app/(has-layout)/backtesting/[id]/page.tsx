"use client";

import { MarkdownRenderer } from "@/components/chat/markdown-renderer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { getBacktestingById } from "@/lib/api/backtesting";
import { BacktestingHistoryItem } from "@/lib/types/backtesting";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ArrowLeft,
  CheckCircle2,
  ComputerIcon,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function formatPercent(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return `${new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 2,
  }).format(value)}%`;
}

function formatNumber(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 2 }).format(
    value
  );
}

function formatCurrency(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "-";
  return `₩${new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 0,
  }).format(value)}`;
}

function getStatusLabel(status: string) {
  switch (status) {
    case "completed":
      return "완료";
    case "failed":
      return "실패";
    case "running":
      return "진행 중";
    case "pending":
      return "대기";
    default:
      return status || "-";
  }
}

function getStatusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300";
    case "failed":
      return "bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300";
    case "running":
      return "bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300";
    case "pending":
      return "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300";
    default:
      return "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300";
  }
}

function getQueryText(item: BacktestingHistoryItem) {
  const query = item.inputJson?.query;
  if (typeof query === "string" && query.trim()) return query.trim();
  return "백테스팅 요청";
}

function getTargetText(item: BacktestingHistoryItem) {
  const symbols = item.inputJson?.parameters?.target_symbols;
  if (Array.isArray(symbols) && symbols.length > 0) return symbols.join(", ");

  const corpNames = item.inputJson?.parameters?.target_corp_names;
  if (Array.isArray(corpNames) && corpNames.length > 0) return corpNames.join(", ");

  const stockSymbol = item.inputJson?.stock_symbol;
  if (typeof stockSymbol === "string" && stockSymbol.trim()) return stockSymbol.trim();

  return "-";
}

function getDateRangeText(item: BacktestingHistoryItem) {
  const start = item.inputJson?.parameters?.start_date;
  const end = item.inputJson?.parameters?.end_date;
  if (typeof start === "string" && typeof end === "string") {
    return `${start} ~ ${end}`;
  }
  return "-";
}

function renderAnalysisJson(item: BacktestingHistoryItem) {
  const analysisJson = item.analysisJson;
  if (!analysisJson || typeof analysisJson !== "object") return null;

  const summary = Array.isArray(analysisJson.summary)
    ? (analysisJson.summary.filter((v) => typeof v === "string") as string[])
    : null;
  const nextExperiments = Array.isArray(analysisJson.next_experiments)
    ? (analysisJson.next_experiments.filter((v) => typeof v === "string") as string[])
    : null;
  const limitations = Array.isArray(analysisJson.limitations_and_warnings)
    ? (analysisJson.limitations_and_warnings.filter((v) => typeof v === "string") as string[])
    : null;

  if (!summary && !nextExperiments && !limitations) return null;

  return (
    <div className="space-y-6">
      {summary && summary.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            요약
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
            {summary.map((text, idx) => (
              <li key={idx}>{text}</li>
            ))}
          </ul>
        </div>
      )}

      {limitations && limitations.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            한계 및 주의사항
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
            {limitations.map((text, idx) => (
              <li key={idx}>{text}</li>
            ))}
          </ul>
        </div>
      )}

      {nextExperiments && nextExperiments.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            다음 실험 제안
          </h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-zinc-700 dark:text-zinc-300">
            {nextExperiments.map((text, idx) => (
              <li key={idx}>{text}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function BacktestingDetailPage() {
  const { user, loading: userLoading } = useUser();
  const params = useParams();
  const router = useRouter();

  const backtestingId = params.id as string;

  const [data, setData] = useState<BacktestingHistoryItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      setData(null);
      setIsLoading(false);
      return;
    }

    const load = async () => {
      setError(null);
      setIsLoading(true);
      try {
        const found = await getBacktestingById(backtestingId);
        setData(found);
      } catch (err) {
        console.error("백테스팅 결과 로드 실패:", err);
        setData(null);
        setError(
          err instanceof Error ? err.message : "백테스팅 결과를 불러오지 못했습니다."
        );
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [backtestingId, user, userLoading]);

  const createdAtText = useMemo(() => {
    if (!data) return "";
    return format(new Date(data.createdAt), "yyyy년 MM월 dd일 HH:mm", {
      locale: ko,
    });
  }, [data]);

  if (userLoading || isLoading) {
    return (
      <div className="h-full flex flex-col">
        {/* 헤더 스켈레톤 */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 flex-shrink-0">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        {/* 콘텐츠 스켈레톤 */}
        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/50 p-6 pb-12">
          <div className="space-y-4 max-w-5xl mx-auto">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center">
        <p className="text-zinc-500 dark:text-zinc-400">
          로그인이 필요합니다.
        </p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-full flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/backtesting")}
            className="mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ComputerIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              백테스팅
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              결과를 찾을 수 없습니다
            </p>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/50 p-6 pb-12 flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              {error || "해당 백테스팅 결과를 찾을 수 없습니다."}
            </p>
            <Button onClick={() => router.push("/backtesting")} variant="outline">
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isProcessing = data.status === "pending" || data.status === "running";
  const isFailed = data.status === "failed";
  const isAnalysisProcessing =
    data.analysisStatus === "pending" || data.analysisStatus === "running";
  const analysisJsonContent = renderAnalysisJson(data);

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/backtesting")}
          className="mr-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
          {isProcessing ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : isFailed ? (
            <XCircle className="w-5 h-5 text-white" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-white" />
          )}
        </div>
        <div className="min-w-0">
          <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            백테스팅
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {createdAtText}
          </p>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/50 p-6 pb-12">
        <div className="max-w-5xl mx-auto space-y-6">
          {/* 요약 */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">요청</p>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100 mt-1 break-words">
                  {getQueryText(data)}
                </p>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      대상
                    </p>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 mt-1">
                      {getTargetText(data)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      기간
                    </p>
                    <p className="text-sm text-zinc-800 dark:text-zinc-200 mt-1">
                      {getDateRangeText(data)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      백테스트 상태
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium mt-1 ${getStatusBadgeClass(
                        data.status
                      )}`}
                    >
                      {getStatusLabel(data.status)}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      해석 상태
                    </p>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium mt-1 ${getStatusBadgeClass(
                        data.analysisStatus
                      )}`}
                    >
                      {getStatusLabel(data.analysisStatus)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 hidden sm:flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                <FileText className="w-4 h-4" />
                <span className="truncate max-w-[220px]">{data.jobId}</span>
              </div>
            </div>
          </div>

          {/* 에러 */}
          {(data.errorMessage || data.analysisErrorMessage) && (
            <div className="p-5 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
              <h3 className="text-sm font-semibold text-red-700 dark:text-red-300 mb-2">
                오류
              </h3>
              {data.errorMessage && (
                <p className="text-sm text-red-700 dark:text-red-200 whitespace-pre-wrap">
                  {data.errorMessage}
                </p>
              )}
              {data.analysisErrorMessage && (
                <p className="text-sm text-red-700 dark:text-red-200 whitespace-pre-wrap mt-2">
                  {data.analysisErrorMessage}
                </p>
              )}
            </div>
          )}

          {/* 핵심 지표 */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              핵심 지표
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700/60">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">총 수익률</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                  {formatPercent(data.outputJson?.total_return)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700/60">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">연환산 수익률</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                  {formatPercent(data.outputJson?.annualized_return)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700/60">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">MDD</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                  {formatPercent(data.outputJson?.mdd)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700/60">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">샤프</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                  {formatNumber(data.outputJson?.sharpe_ratio)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700/60">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">승률</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                  {formatPercent(data.outputJson?.win_rate)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700/60">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">거래 횟수</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                  {typeof data.outputJson?.total_trades === "number"
                    ? new Intl.NumberFormat("ko-KR").format(
                        data.outputJson.total_trades
                      )
                    : "-"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700/60">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">총 수익</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                  {formatCurrency(data.outputJson?.total_profit)}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700/60">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">총 손실</p>
                <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mt-1">
                  {formatCurrency(data.outputJson?.total_loss)}
                </p>
              </div>
            </div>
          </div>

          {/* 해석 */}
          <div className="p-5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                해석 리포트
              </h2>
            </div>

            {data.analysisMd ? (
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <MarkdownRenderer content={data.analysisMd} />
              </div>
            ) : isAnalysisProcessing ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Loader2 className="w-8 h-8 text-indigo-600 dark:text-indigo-400 animate-spin mb-3" />
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
                  해석을 생성 중입니다. 잠시만 기다려주세요.
                </p>
              </div>
            ) : analysisJsonContent ? (
              analysisJsonContent
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  해석 결과가 아직 없습니다.
                </p>
              </div>
            )}
          </div>

          {/* 원본 데이터 */}
          <details className="p-5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <summary className="cursor-pointer text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              원본 데이터 보기
            </summary>
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                  input_json
                </p>
                <pre className="text-xs bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 overflow-auto">
                  {JSON.stringify(data.inputJson, null, 2)}
                </pre>
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-2">
                  output_json
                </p>
                <pre className="text-xs bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-700 rounded-lg p-3 overflow-auto">
                  {JSON.stringify(data.outputJson, null, 2)}
                </pre>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}

