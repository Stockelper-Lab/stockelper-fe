"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import {
  requestPortfolioRecommendation,
  getPortfolioRecommendationHistory,
  PortfolioRecommendationHistory,
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
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

// 스켈레톤 컴포넌트
function PortfolioSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="w-12 h-12 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-3 w-1/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function PortfolioPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const [history, setHistory] = useState<PortfolioRecommendationHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 이력 로드
  useEffect(() => {
    if (user && !userLoading) {
      const loadHistory = async () => {
        try {
          const loadedHistory = await getPortfolioRecommendationHistory(user.id);
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

    setIsRequesting(true);
    setError(null);

    try {
      const recommendation = await requestPortfolioRecommendation(user.id);
      
      // 새로 생성된 추천 상세 페이지로 이동
      router.push(`/portfolio/${recommendation.id}`);
    } catch (err) {
      console.error("포트폴리오 추천 요청 실패:", err);
      setError(
        err instanceof Error
          ? err.message
          : "포트폴리오 추천을 받는 중 오류가 발생했습니다."
      );
      setIsRequesting(false);
    }
  }, [user, router]);

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
          disabled={isRequesting || !user}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20 disabled:opacity-50"
        >
          {isRequesting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span className="hidden sm:inline">분석 중...</span>
            </>
          ) : (
            <>
              <RefreshCw size={16} />
              <span className="hidden sm:inline">새 추천 받기</span>
            </>
          )}
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
              disabled={isRequesting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 shadow-md shadow-indigo-500/20"
            >
              {isRequesting ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  분석 중...
                </>
              ) : (
                <>
                  <RefreshCw size={18} className="mr-2" />
                  포트폴리오 추천 받기
                </>
              )}
            </Button>
          </div>
        ) : (
          // 포트폴리오 이력 목록
          <div className="space-y-3">
            {history.map((portfolio) => {
              const dateStr = format(
                new Date(portfolio.createdAt),
                "yyyy년 MM월 dd일 HH:mm",
                { locale: ko }
              );

              return (
                <Link key={portfolio.id} href={`/portfolio/${portfolio.id}`}>
                  <div className="group flex items-center gap-4 p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all cursor-pointer">
                    {/* 아이콘 */}
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/50 dark:to-orange-900/50 flex items-center justify-center flex-shrink-0">
                      <TrendingUp
                        size={22}
                        className="text-amber-600 dark:text-amber-400"
                      />
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        포트폴리오 추천
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {dateStr}
                      </p>
                      <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
                        {portfolio.investorType}
                      </p>
                    </div>

                    {/* 화살표 */}
                    <ArrowRight
                      size={18}
                      className="text-zinc-400 group-hover:text-indigo-500 transition-colors"
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
