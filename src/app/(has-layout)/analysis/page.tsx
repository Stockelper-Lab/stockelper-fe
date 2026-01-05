import { BarChart3, Construction, LineChart, PieChart, TrendingUp } from "lucide-react";
import Link from "next/link";

const comingSoonFeatures = [
  {
    title: "시장 동향",
    description: "실시간 시장 지표와 트렌드 분석",
    icon: TrendingUp,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
  {
    title: "종목 스크리닝",
    description: "조건에 맞는 종목 필터링",
    icon: LineChart,
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    title: "섹터 분석",
    description: "업종별 시장 흐름 파악",
    icon: PieChart,
    iconBg: "bg-purple-100 dark:bg-purple-900/50",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
];

export default function AnalysisPage() {
  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <BarChart3 className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            투자 분석
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            데이터를 기반으로 한 투자 분석 정보
          </p>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/50 p-6 pb-12">
        {/* 준비 중 메시지 */}
        <div className="flex flex-col items-center justify-center py-12">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center mb-6 shadow-lg">
            <Construction className="w-10 h-10 text-amber-600 dark:text-amber-400" />
          </div>
          <h2 className="text-xl font-bold text-zinc-800 dark:text-zinc-200 mb-2">
            곧 출시됩니다
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center max-w-md mb-8">
            현재 더 나은 분석 도구를 개발하고 있어요.
            <br />
            조금만 기다려주세요!
          </p>

          {/* 예정 기능 */}
          <div className="w-full max-w-2xl">
            <h3 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-4 text-center">
              예정된 기능
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {comingSoonFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="p-4 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 opacity-75"
                >
                  <div
                    className={`w-10 h-10 ${feature.iconBg} rounded-lg flex items-center justify-center mb-3`}
                  >
                    <feature.icon
                      className={`w-5 h-5 ${feature.iconColor}`}
                    />
                  </div>
                  <h4 className="font-medium text-zinc-700 dark:text-zinc-300 text-sm">
                    {feature.title}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-8">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-3">
              지금은 AI 어시스턴트에게 직접 물어보세요!
            </p>
            <Link
              href="/chat"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium text-sm shadow-md shadow-indigo-500/20 transition-colors"
            >
              AI에게 분석 요청하기
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
