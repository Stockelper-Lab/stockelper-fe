"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import {
  getPortfolioRecommendationById,
  PortfolioRecommendationHistory,
} from "@/lib/api/portfolio";
import { MarkdownRenderer } from "@/components/chat/markdown-renderer";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft, Loader2, TrendingUp, User } from "lucide-react";
import { useEffect, useState } from "react";

export default function PortfolioDetailPage() {
  const { user, loading: userLoading } = useUser();
  const params = useParams();
  const router = useRouter();
  const portfolioId = params.id as string;

  const [portfolio, setPortfolio] =
    useState<PortfolioRecommendationHistory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!userLoading) {
      const loadPortfolio = async () => {
        try {
          const found = await getPortfolioRecommendationById(portfolioId);
          setPortfolio(found);
        } catch (err) {
          console.error("포트폴리오 추천 로드 실패:", err);
          setPortfolio(null);
        } finally {
          setIsLoading(false);
        }
      };
      loadPortfolio();
    }
  }, [portfolioId, userLoading]);

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
          <div className="space-y-4 max-w-4xl mx-auto">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-32 w-full" />
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

  if (!portfolio) {
    return (
      <div className="h-full flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/portfolio")}
            className="mr-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              포트폴리오 추천
            </h1>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              추천을 찾을 수 없습니다
            </p>
          </div>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/50 p-6 pb-12 flex flex-col items-center justify-center">
          <div className="text-center">
            <p className="text-zinc-500 dark:text-zinc-400 mb-4">
              해당 포트폴리오 추천을 찾을 수 없습니다.
            </p>
            <Button
              onClick={() => router.push("/portfolio")}
              variant="outline"
            >
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const dateStr = format(
    new Date(portfolio.createdAt),
    "yyyy년 MM월 dd일 HH:mm",
    { locale: ko }
  );
  const isProcessing = !portfolio.result || portfolio.result.trim() === "";

  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 flex-shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/portfolio")}
          className="mr-2"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          {isProcessing ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <TrendingUp className="w-5 h-5 text-white" />
          )}
        </div>
        <div>
          <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            포트폴리오 추천
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">{dateStr}</p>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/50 p-6 pb-12">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 투자 성향 배지 */}
          <div className="flex items-center gap-3 p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center">
              <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                투자 성향
              </p>
              <p className="font-semibold text-zinc-900 dark:text-zinc-100">
                {portfolio.investorType}
              </p>
            </div>
          </div>

          {/* 결과 영역 */}
          {isProcessing ? (
            <div className="p-6 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 text-amber-600 dark:text-amber-400 animate-spin mb-4" />
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                  분석 중입니다
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-sm">
                  포트폴리오 추천을 생성하고 있습니다.
                  <br />
                  잠시만 기다려주세요.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700">
              <div className="prose prose-zinc dark:prose-invert max-w-none">
                <MarkdownRenderer content={portfolio.result} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
