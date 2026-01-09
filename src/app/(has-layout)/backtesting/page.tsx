"use client";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { getBacktestingHistory } from "@/lib/api/backtesting";
import { BacktestingHistoryItem } from "@/lib/types/backtesting";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ArrowRight,
  CheckCircle2,
  ComputerIcon,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const ITEMS_PER_PAGE = 10;

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

function getAnalysisStatusLabel(status: string) {
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

function getAnalysisStatusBadgeClass(status: string) {
  switch (status) {
    case "completed":
      return "bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300";
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

function getTargetSymbols(item: BacktestingHistoryItem) {
  const symbols = item.inputJson?.parameters?.target_symbols;
  if (Array.isArray(symbols) && symbols.length > 0) return symbols;

  const stockSymbol = item.inputJson?.stock_symbol;
  if (typeof stockSymbol === "string" && stockSymbol.trim()) {
    return [stockSymbol.trim()];
  }

  return [];
}

function getDateRangeText(item: BacktestingHistoryItem) {
  const start = item.inputJson?.parameters?.start_date;
  const end = item.inputJson?.parameters?.end_date;
  if (typeof start === "string" && typeof end === "string") {
    return `${start} ~ ${end}`;
  }
  return null;
}

// 스켈레톤 컴포넌트
function BacktestingSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              상태
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              생성일시
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              요청
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              백테스트
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              해석
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              액션
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {[1, 2, 3].map((i) => (
            <tr
              key={i}
              className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors"
            >
              <td className="px-4 py-3">
                <Skeleton className="w-8 h-8 rounded" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-64" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-4 py-3 text-right">
                <Skeleton className="h-4 w-4 ml-auto" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function BacktestingPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();

  const [history, setHistory] = useState<BacktestingHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = useMemo(
    () => Math.ceil(history.length / ITEMS_PER_PAGE),
    [history.length]
  );

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return history.slice(startIndex, endIndex);
  }, [history, currentPage]);

  const loadHistory = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const loaded = await getBacktestingHistory();
      setHistory(loaded);
      setCurrentPage(1);
    } catch (err) {
      console.error("백테스팅 이력 로드 실패:", err);
      setHistory([]);
      setError(
        err instanceof Error ? err.message : "백테스팅 이력을 불러오지 못했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      setHistory([]);
      setIsLoading(false);
      return;
    }

    loadHistory();
  }, [user, userLoading, loadHistory]);

  // 페이지 변경 시 상단으로 스크롤
  useEffect(() => {
    if (currentPage > 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ComputerIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              백테스팅
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {userLoading || isLoading ? "불러오는 중..." : `${history.length}건`}
            </p>
          </div>
        </div>
        <Button
          onClick={loadHistory}
          disabled={!user || userLoading || isLoading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          <span className="hidden sm:inline">새로고침</span>
        </Button>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div className="mx-6 mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/50 p-6 pb-12">
        {userLoading || isLoading ? (
          <BacktestingSkeleton />
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-zinc-500 dark:text-zinc-400">
              로그인이 필요합니다.
            </p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-6 shadow-lg">
              <ComputerIcon className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              아직 백테스팅 이력이 없어요
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-sm">
              채팅에서 백테스팅을 요청하면 여기에 결과가 저장됩니다.
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      생성일시
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      요청
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      백테스트
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      해석
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700 bg-white dark:bg-zinc-800">
                  {paginatedHistory.map((item) => {
                    const dateStr = format(
                      new Date(item.createdAt),
                      "yyyy년 MM월 dd일 HH:mm",
                      { locale: ko }
                    );

                    const queryText = getQueryText(item);
                    const symbols = getTargetSymbols(item);
                    const dateRange = getDateRangeText(item);

                    return (
                      <tr
                        key={item.id}
                        className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer group"
                        onClick={() => router.push(`/backtesting/${item.id}`)}
                      >
                        {/* 상태 아이콘 */}
                        <td className="px-4 py-3">
                          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/40 dark:to-indigo-900/40 flex items-center justify-center">
                            {item.status === "running" || item.status === "pending" ? (
                              <Loader2
                                size={16}
                                className="text-blue-600 dark:text-blue-400 animate-spin"
                              />
                            ) : item.status === "failed" ? (
                              <XCircle
                                size={16}
                                className="text-red-600 dark:text-red-400"
                              />
                            ) : (
                              <CheckCircle2
                                size={16}
                                className="text-green-600 dark:text-green-400"
                              />
                            )}
                          </div>
                        </td>

                        {/* 생성일시 */}
                        <td className="px-4 py-3">
                          <span className="text-sm text-zinc-900 dark:text-zinc-100">
                            {dateStr}
                          </span>
                        </td>

                        {/* 요청 */}
                        <td className="px-4 py-3">
                          <div className="max-w-[420px]">
                            <p className="text-sm text-zinc-900 dark:text-zinc-100 truncate">
                              {queryText}
                            </p>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                              {symbols.length > 0 ? `대상: ${symbols.join(", ")}` : "대상: -"}
                              {dateRange ? ` · 기간: ${dateRange}` : ""}
                            </p>
                          </div>
                        </td>

                        {/* 백테스트 상태 */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getStatusBadgeClass(
                              item.status
                            )}`}
                          >
                            {getStatusLabel(item.status)}
                          </span>
                        </td>

                        {/* 해석 상태 */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${getAnalysisStatusBadgeClass(
                              item.analysisStatus
                            )}`}
                          >
                            {getAnalysisStatusLabel(item.analysisStatus)}
                          </span>
                        </td>

                        {/* 액션 */}
                        <td className="px-4 py-3 text-right">
                          <ArrowRight
                            size={16}
                            className="text-zinc-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors ml-auto inline-block"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="mt-6 flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
