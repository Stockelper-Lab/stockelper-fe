"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/hooks/use-user";
import { fetchConversations } from "@/lib/api/conversations";
import { ConversationInfo } from "@/lib/chat-service";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  ArrowRight,
  Bot,
  MessageSquare,
  Plus,
  Settings,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

// 빠른 액션 카드
const quickActions = [
  {
    title: "새 대화 시작",
    description: "AI 어시스턴트와 대화하기",
    icon: Plus,
    href: "/chat",
    iconBg: "bg-indigo-100 dark:bg-indigo-900/50",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    title: "포트폴리오",
    description: "추천 포트폴리오 보기",
    icon: TrendingUp,
    href: "/portfolio",
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    title: "설정",
    description: "계정 및 API 설정",
    icon: Settings,
    href: "/settings",
    iconBg: "bg-zinc-100 dark:bg-zinc-800",
    iconColor: "text-zinc-600 dark:text-zinc-400",
  },
];

// 스켈레톤 컴포넌트
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();

  // 최근 대화 가져오기
  const { data: conversations, isLoading: conversationsLoading } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: () => fetchConversations(user!.id),
    enabled: !!user,
  });

  const recentConversations = (conversations || []).slice(0, 5);
  const totalConversations = conversations?.length || 0;

  if (userLoading) {
    return (
      <div className="h-full overflow-auto p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  // 인사말 생성
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "좋은 아침이에요";
    if (hour < 18) return "좋은 오후에요";
    return "좋은 저녁이에요";
  };

  return (
    <div className="h-full overflow-auto">
      {/* 환영 헤더 */}
      <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 px-6 py-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-white text-2xl font-bold shadow-lg">
            {user?.name?.charAt(0).toUpperCase() ||
              user?.email?.charAt(0).toUpperCase() ||
              "U"}
          </div>
          <div>
            <p className="text-white/80 text-sm">{getGreeting()}</p>
            <h1 className="text-2xl font-bold text-white">
              {user?.nickname || user?.name || "사용자"}님
            </h1>
          </div>
        </div>

        {/* 간단한 통계 */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <MessageSquare size={14} />
              <span>총 대화</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">
              {conversationsLoading ? "-" : totalConversations}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 text-white/80 text-xs">
              <Bot size={14} />
              <span>AI 분석</span>
            </div>
            <p className="text-2xl font-bold text-white mt-1">무제한</p>
          </div>
        </div>
      </div>

      <div className="p-6 pb-12 space-y-6">
        {/* 빠른 액션 */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-4">
            빠른 액션
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href}>
                <div className="group p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all cursor-pointer h-full">
                  <div
                    className={`w-10 h-10 rounded-lg ${action.iconBg} flex items-center justify-center mb-3`}
                  >
                    <action.icon className={`w-5 h-5 ${action.iconColor}`} />
                  </div>
                  <h3 className="font-medium text-zinc-900 dark:text-zinc-100 text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 최근 대화 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              최근 대화
            </h2>
            <Link href="/chat">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
              >
                전체 보기
                <ArrowRight size={14} className="ml-1" />
              </Button>
            </Link>
          </div>

          <div className="bg-white dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden">
            {conversationsLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="w-10 h-10 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentConversations.length === 0 ? (
              <div className="p-8 text-center">
                <div className="w-14 h-14 rounded-2xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-7 h-7 text-indigo-500" />
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  아직 대화 내역이 없어요
                </p>
                <Link href="/chat">
                  <Button
                    size="sm"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Plus size={16} className="mr-1" />
                    첫 대화 시작하기
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-zinc-100 dark:divide-zinc-700/50">
                {recentConversations.map((conversation: ConversationInfo) => (
                  <Link
                    key={conversation.id}
                    href={`/chat/${conversation.id}`}
                    className="flex items-center gap-3 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-700/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center flex-shrink-0">
                      <MessageSquare
                        size={18}
                        className="text-indigo-600 dark:text-indigo-400"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate text-sm">
                        {conversation.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {formatDistanceToNow(
                          new Date(conversation.lastActive),
                          {
                            addSuffix: true,
                            locale: ko,
                          }
                        )}
                      </p>
                    </div>
                    <ArrowRight
                      size={16}
                      className="text-zinc-400 group-hover:text-indigo-500"
                    />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 팁 카드 */}
        <section className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 rounded-xl p-5 border border-indigo-100 dark:border-indigo-900/50">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="font-medium text-indigo-900 dark:text-indigo-100 text-sm">
                💡 오늘의 팁
              </h3>
              <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                AI 어시스턴트에게 &ldquo;삼성전자 차트 분석해줘&rdquo;라고
                물어보면 기술적 분석 결과를 받아볼 수 있어요!
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
