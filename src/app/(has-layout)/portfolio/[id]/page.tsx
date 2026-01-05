"use client";

import PageHeader from "@/app/(has-layout)/components/page-header";
import { useUser } from "@/hooks/use-user";
import { fetchPortfolioRecommendations, PortfolioRecommendation, PortfolioItem } from "@/lib/api/portfolio";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PortfolioDetailPage() {
  const { user, loading: userLoading } = useUser();
  const params = useParams();
  const router = useRouter();
  const portfolioId = params.id as string;

  const {
    data: recommendations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["portfolio-recommendations", user?.id],
    queryFn: () => fetchPortfolioRecommendations(user!.id),
    enabled: !!user && !userLoading,
  });

  if (userLoading || isLoading) {
    return (
      <div className="flex h-full flex-col p-8 overflow-scroll">
        <PageHeader title="포트폴리오 추천 상세" description="포트폴리오 추천 정보를 불러오는 중..." />
        <div className="mt-6 space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full flex-col p-8 overflow-scroll">
        <PageHeader title="포트폴리오 추천 상세" description="로그인이 필요합니다." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col p-8 overflow-scroll">
        <PageHeader title="포트폴리오 추천 상세" description="포트폴리오 추천 정보를 불러오는 중..." />
        <div className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-500 dark:text-red-400">
                포트폴리오 추천 정보를 불러오는 중 오류가 발생했습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const portfolioList = Array.isArray(recommendations) ? recommendations : [];
  const portfolioIndex = parseInt(portfolioId, 10);
  const portfolio = portfolioList[portfolioIndex] || portfolioList.find((p) => p.id === portfolioIndex);

  if (!portfolio) {
    return (
      <div className="flex h-full flex-col p-8 overflow-scroll">
        <PageHeader title="포트폴리오 추천 상세" description="포트폴리오 추천을 찾을 수 없습니다." />
        <div className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-zinc-500 dark:text-zinc-400 text-center">
                해당 포트폴리오 추천을 찾을 수 없습니다.
              </p>
              <div className="mt-4 flex justify-center">
                <Button onClick={() => router.push("/portfolio")} variant="outline">
                  목록으로 돌아가기
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const timestamp = portfolio.timestamp || portfolio.created_at;
  const dateStr = timestamp
    ? format(new Date(timestamp), "yyyy년 MM월 dd일 HH:mm", { locale: ko })
    : "날짜 정보 없음";

  const recommendations = portfolio.recommendations || [];
  const totalWeight = recommendations.reduce((sum: number, item: PortfolioItem) => {
    return sum + (item.weight || 0);
  }, 0);

  return (
    <div className="flex h-full flex-col p-8 overflow-scroll">
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/portfolio")}
          className="mb-2"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          목록으로
        </Button>
      </div>
      <PageHeader
        title="포트폴리오 추천 상세"
        description={`${dateStr} 시점의 포트폴리오 추천`}
      />
      <div className="mt-6 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>추천 정보</CardTitle>
            <CardDescription>{dateStr}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">추천 종목 수</span>
                <span className="text-sm font-medium">{recommendations.length}개</span>
              </div>
              {totalWeight > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">총 비중</span>
                  <span className="text-sm font-medium">{totalWeight.toFixed(2)}%</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>추천 종목</CardTitle>
            <CardDescription>포트폴리오 구성 종목</CardDescription>
          </CardHeader>
          <CardContent>
            {recommendations.length === 0 ? (
              <p className="text-zinc-500 dark:text-zinc-400 text-center py-4">
                추천 종목이 없습니다.
              </p>
            ) : (
              <div className="space-y-3">
                {recommendations.map((item: PortfolioItem, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-700"
                  >
                    <div className="flex-1">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">
                        {item.stock_name || item.stock_code || `종목 ${index + 1}`}
                      </div>
                      {item.stock_code && (
                        <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                          {item.stock_code}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      {item.weight !== undefined && (
                        <div className="text-right">
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">비중</div>
                          <div className="font-medium">{item.weight.toFixed(2)}%</div>
                        </div>
                      )}
                      {item.price !== undefined && (
                        <div className="text-right">
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">가격</div>
                          <div className="font-medium">{item.price.toLocaleString()}원</div>
                        </div>
                      )}
                      {item.quantity !== undefined && (
                        <div className="text-right">
                          <div className="text-sm text-zinc-500 dark:text-zinc-400">수량</div>
                          <div className="font-medium">{item.quantity.toLocaleString()}</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

