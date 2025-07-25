import { CreditCard, KeyRound, User } from "lucide-react";
import Link from "next/link";
import PageHeader from "../components/page-header";

const settingsNav = [
  {
    name: "계정",
    description: "개인 정보를 수정하고, 계정을 관리합니다.",
    href: "/settings/account",
    icon: User,
  },
  {
    name: "KIS",
    description: "한국투자증권 API 연동 키를 관리합니다.",
    href: "/settings/kis",
    icon: KeyRound,
  },
  {
    name: "결제",
    description: "요금제를 변경하고, 결제 정보를 확인합니다.",
    href: "/settings/billing",
    icon: CreditCard,
  },
];

export default function SettingsPage() {
  return (
    <div className="p-8 h-full overflow-auto">
      <PageHeader
        title="설정"
        description="계정 및 애플리케이션 설정을 관리합니다."
      />

      <div className="space-y-8 mt-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {settingsNav.map((item) => (
            <Link href={item.href} key={item.name}>
              <div className="p-6 rounded-xl bg-white dark:bg-zinc-800/60 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-sm">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-zinc-100 dark:bg-zinc-700 rounded-lg">
                    <item.icon className="w-6 h-6 text-zinc-600 dark:text-zinc-300" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-zinc-800 dark:text-zinc-200">
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
