"use client";

import { UserProfile } from "@/components/user-profile";

export default function DashboardPage() {
  return (
    <div className="flex flex-col w-full h-full p-8 gap-6">
      <UserProfile />

      <div className="flex flex-col items-center justify-center flex-1">
        <h1 className="text-3xl font-bold text-zinc-800 dark:text-zinc-200 mb-4">
          준비중입니다
        </h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 mb-2">
          해당 페이지는 현재 준비 중입니다.
        </p>
        <p className="text-zinc-400 dark:text-zinc-500">
          빠른 시일 내에 찾아뵙겠습니다.
        </p>
      </div>
    </div>
  );
}
