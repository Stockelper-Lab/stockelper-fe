"use client";

import PageHeader from "@/app/(has-layout)/components/page-header";
import { useUser } from "@/hooks/use-user";
import { fetchPortfolioRecommendations, PortfolioRecommendation } from "@/lib/api/portfolio";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortfolioPage() {
  const { user, loading: userLoading } = useUser();

  const {
    data: recommendations,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["portfolio-recommendations", user?.id],
    queryFn: () => fetchPortfolioRecommendations(user!.id),
    enabled: !!user && !userLoading,
  });

  if (userLoading) {
    return (
      <div className="flex h-full flex-col p-8 overflow-scroll">
        <PageHeader title="포트폴리오 추천" description="누적된 포트폴리오 추천 목록을 확인하세요." />
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-full flex-col p-8 overflow-scroll">
        <PageHeader title="포트폴리오 추천" description="로그인이 필요합니다." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full flex-col p-8 overflow-scroll">
        <PageHeader title="포트폴리오 추천" description="누적된 포트폴리오 추천 목록을 확인하세요." />
        <div className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-red-500 dark:text-red-400">
                포트폴리오 추천 목록을 불러오는 중 오류가 발생했습니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex h-full flex-col p-8 overflow-scroll">
        <PageHeader title="포트폴리오 추천" description="누적된 포트폴리오 추천 목록을 확인하세요." />
        <div className="mt-6 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    );
  }

  const portfolioList = Array.isArray(recommendations) ? recommendations : [];

  return (
    <div className="flex h-full flex-col p-8 overflow-scroll">
      <PageHeader
        title="포트폴리오 추천"
        description="누적된 포트폴리오 추천 목록을 확인하세요."
      />
      <div className="mt-6 space-y-4">
        {portfolioList.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-zinc-500 dark:text-zinc-400 text-center">
                아직 포트폴리오 추천이 없습니다.
              </p>
            </CardContent>
          </Card>
        ) : (
          portfolioList.map((portfolio, index) => {
            const timestamp = portfolio.timestamp || portfolio.created_at;
            const dateStr = timestamp
              ? format(new Date(timestamp), "yyyy년 MM월 dd일 HH:mm", { locale: ko })
              : `추천 #${index + 1}`;
            const portfolioId = portfolio.id || index;

            return (
              <Link key={portfolioId} href={`/portfolio/${portfolioId}`}>
                <Card className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">포트폴리오 추천</CardTitle>
                    <CardDescription>{dateStr}</CardDescription>
                  </CardHeader>
                  {portfolio.recommendations && Array.isArray(portfolio.recommendations) && (
                    <CardContent>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        {portfolio.recommendations.length}개의 종목 추천
                      </p>
                    </CardContent>
                  )}
                </Card>
              </Link>
            );
          })
        )}
      </div>
    </div>
  );
}

