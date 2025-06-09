"use client";

import { LayoutDashboard, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

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
  useSidebar,
} from "@/components/ui/sidebar";
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
    name: "설정",
    href: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();

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
                // 현재 경로가 메뉴 항목의 href와 일치하는지 확인
                const isActive = pathname === item.href;
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
