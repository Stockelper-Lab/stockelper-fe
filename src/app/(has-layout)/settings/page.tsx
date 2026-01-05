import { FileText, KeyRound, Settings, User } from "lucide-react";
import Link from "next/link";

const settingsNav = [
  {
    name: "계정",
    description: "개인 정보를 수정하고, 계정을 관리합니다.",
    href: "/settings/account",
    icon: User,
    iconBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    name: "KIS API",
    description: "한국투자증권 API 연동 키를 관리합니다.",
    href: "/settings/kis",
    icon: KeyRound,
    iconBg: "bg-amber-100 dark:bg-amber-900/50",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
  {
    name: "투자 성향",
    description: "투자 성향 설문을 다시 진행합니다.",
    href: "/settings/survey",
    icon: FileText,
    iconBg: "bg-emerald-100 dark:bg-emerald-900/50",
    iconColor: "text-emerald-600 dark:text-emerald-400",
  },
];

export default function SettingsPage() {
  return (
    <div className="h-full flex flex-col">
      {/* 헤더 */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 flex-shrink-0">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-500 to-zinc-700 flex items-center justify-center shadow-lg shadow-zinc-500/20">
          <Settings className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            설정
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            계정 및 애플리케이션 설정을 관리합니다
          </p>
        </div>
      </div>

      {/* 설정 목록 */}
      <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/50 p-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {settingsNav.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="group p-5 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-lg transition-all cursor-pointer h-full">
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 ${item.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}
                  >
                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <div>
                    <h2 className="font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.name}
                    </h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
