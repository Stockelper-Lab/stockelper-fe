"use client";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";

export function UserProfile() {
  const { user, loading, logout } = useUser();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

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

  if (loading) {
    return (
      <div className="flex items-center space-x-2 p-4 border rounded-md animate-pulse">
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-between p-4 border rounded-md">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <User className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <p className="text-sm font-medium">로그인이 필요합니다</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push("/sign-in")}
        >
          로그인
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 border rounded-md bg-white dark:bg-zinc-900">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
          {user.name
            ? user.name.charAt(0).toUpperCase()
            : user.email.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium">{user.name || "사용자"}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {user.email}
          </p>
        </div>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? (
          <span className="animate-pulse">로그아웃 중...</span>
        ) : (
          <>
            <LogOut className="h-4 w-4 mr-1" />
            로그아웃
          </>
        )}
      </Button>
    </div>
  );
}
