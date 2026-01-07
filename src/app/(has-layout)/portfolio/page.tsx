"use client";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import {
  getPortfolioRecommendationHistory,
  PortfolioRecommendationHistory,
  requestPortfolioRecommendation,
} from "@/lib/api/portfolio";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ArrowRight,
  Briefcase,
  Loader2,
  RefreshCw,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

// 스켈레톤 컴포넌트
function PortfolioSkeleton() {
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
              투자자 유형
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              진행상태
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              액션
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {[1, 2, 3].map((i) => (
            <tr key={i} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
              <td className="px-4 py-3">
                <Skeleton className="w-8 h-8 rounded" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-32" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-20" />
              </td>
              <td className="px-4 py-3">
                <Skeleton className="h-4 w-16" />
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

const ITEMS_PER_PAGE = 10;

export default function PortfolioPage() {
  const { user, loading: userLoading } = useUser();
  const [history, setHistory] = useState<PortfolioRecommendationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const router = useRouter();

  // 페이지네이션 계산
  const totalPages = useMemo(
    () => Math.ceil(history.length / ITEMS_PER_PAGE),
    [history.length]
  );

  const paginatedHistory = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return history.slice(startIndex, endIndex);
  }, [history, currentPage]);

  // 페이지 변경 시 상단으로 스크롤
  useEffect(() => {
    if (currentPage > 1) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentPage]);
  // 이력 로드
  useEffect(() => {
    if (user && !userLoading) {
      const loadHistory = async () => {
        try {
          const loadedHistory = await getPortfolioRecommendationHistory();
          setHistory(loadedHistory);
        } catch (err) {
          console.error("포트폴리오 추천 이력 로드 실패:", err);
          setHistory([]);
        } finally {
          setIsLoading(false);
        }
      };
      loadHistory();
    }
  }, [user, userLoading]);

  // 새 추천 요청
  const handleRequestRecommendation = useCallback(async () => {
    if (!user) return;

    setError(null);

    try {
      // 서버에서 pending 상태로 추가
      await requestPortfolioRecommendation();
      
      // 목록 갱신
      const loadedHistory = await getPortfolioRecommendationHistory();
      setHistory(loadedHistory);
      setCurrentPage(1); // 새 추천 요청 시 첫 페이지로 이동
    } catch (err) {
      console.error("포트폴리오 추천 요청 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "포트폴리오 추천을 받는 중 오류가 발생했습니다."
      );
    }
  }, [user]);

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              포트폴리오 추천
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isLoading
                ? "불러오는 중..."
                : `${history.length}개의 추천 이력`}
            </p>
          </div>
        </div>
        <Button
          onClick={handleRequestRecommendation}
          disabled={!user}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 disabled:opacity-50"
        >
          <RefreshCw size={16} />
          <span className="hidden sm:inline">새 추천 받기</span>
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
          <PortfolioSkeleton />
        ) : !user ? (
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-zinc-500 dark:text-zinc-400">
              로그인이 필요합니다.
            </p>
          </div>
        ) : history.length === 0 ? (
          // 빈 상태
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mb-6 shadow-lg">
              <Briefcase className="w-10 h-10 text-amber-600 dark:text-amber-400" />
            </div>
            <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              아직 포트폴리오 추천이 없어요
            </h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-sm mb-6">
              위 버튼을 눌러 AI 기반 포트폴리오 추천을 받아보세요.
              <br />
              투자 성향에 맞는 종목을 추천해드려요.
            </p>
            <Button
              onClick={handleRequestRecommendation}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 shadow-md shadow-indigo-500/20"
            >
              <RefreshCw size={18} className="mr-2" />
              포트폴리오 추천 받기
            </Button>
          </div>
        ) : (
          <>
            {/* 포트폴리오 이력 목록 (테이블 형식) */}
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
                      투자자 유형
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      진행상태
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700 bg-white dark:bg-zinc-800">
                  {paginatedHistory.map((portfolio) => {
                    const dateStr = format(
                      new Date(portfolio.createdAt),
                      "yyyy년 MM월 dd일 HH:mm",
                      { locale: ko }
                    );
                    const isProcessing = !portfolio.result || portfolio.result.trim() === "";

                    return (
                        <tr key={portfolio.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors cursor-pointer group" onClick={() => router.push(`/portfolio/${portfolio.id}`)}>
                          {/* 상태 아이콘 */}
                          <td className="px-4 py-3">
                            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 flex items-center justify-center">
                              {isProcessing ? (
                                <Loader2
                                  size={16}
                                  className="text-amber-600 dark:text-amber-400 animate-spin"
                                />
                              ) : (
                                <TrendingUp
                                  size={16}
                                  className="text-amber-600 dark:text-amber-400"
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

                          {/* 투자자 유형 */}
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300">
                              {portfolio.investorType}
                            </span>
                          </td>

                          {/* 진행상태 */}
                          <td className="px-4 py-3">
                            {isProcessing ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                                분석 중
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                                완료
                              </span>
                            )}
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

            {/* 페이지네이션 */}
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
