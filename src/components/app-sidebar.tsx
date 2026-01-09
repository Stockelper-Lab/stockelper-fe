"use client";

import { ComputerIcon, LayoutDashboard, LogOut, MessageSquare, Settings, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar
} from "@/components/ui/sidebar";
import { useUser } from "@/hooks/use-user";
import { cn } from "@/lib/utils";

// 메뉴 아이템 정의
const navItems = [
  {
    name: "대시보드",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "AI 어시스턴트",
    href: "/chat",
    icon: MessageSquare,
  },
  {
    name: "포트폴리오 추천",
    href: "/portfolio",
    icon: TrendingUp,
  },
  {
    name: "백테스팅",
    href: "/backtesting",
    icon: ComputerIcon,
  },
  {
    name: "설정",
    href: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open } = useSidebar();
  const { logout } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
    } catch (error) {
      console.error("로그아웃 중 오류가 발생했습니다:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="w-[240px] h-full border-none">
      <SidebarHeader className="h-16 px-6 flex items-center">
        {open && (
          <h2 className="font-extrabold text-md pt-8 text-zinc-800 dark:text-zinc-200">
            STOCKELPER
          </h2>
        )}
      </SidebarHeader>
      <SidebarContent className={cn("px-2", !open && "px-0")}>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs text-zinc-500 dark:text-zinc-400 font-medium px-4 py-2 mt-2">
            메뉴
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                // 현재 경로가 메뉴 항목의 href와 일치하거나 하위 경로인지 확인
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`my-1 rounded-xl ${
                        isActive
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-700/30"
                      }`}
                    >
                      <Link href={item.href} className="px-4 py-2.5">
                        <item.icon className="w-[18px] h-[18px]" />
                        <span className="ml-3 text-sm">{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="my-1 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <button className="px-4 py-2.5">
                    <LogOut className="w-[18px] h-[18px]" />
                    <span className="ml-3 text-sm">
                      {isLoggingOut ? "로그아웃 중..." : "로그아웃"}
                    </span>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
