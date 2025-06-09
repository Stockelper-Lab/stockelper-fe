"use client";

import SidebarToggleButton from "@/app/(has-layout)/components/sidebar-toggle-button";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function HasLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900 w-full p-5 gap-5">
        {/* 사이드바 영역 */}
        <div className="h-full rounded-2xl shadow-sm bg-white dark:bg-zinc-800 overflow-hidden relative flex-shrink-0">
          <AppSidebar />
          <SidebarToggleButton />
        </div>

        {/* 중앙 콘텐츠 영역 (LLM 채팅 등) */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full rounded-2xl shadow-sm bg-white dark:bg-zinc-800 overflow-hidden">
            <div className="h-full overflow-auto">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
