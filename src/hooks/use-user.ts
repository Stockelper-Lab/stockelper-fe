import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

interface User {
  id: number;
  email: string;
  name: string;
  nickname: string;
  kis_app_key: string;
  kis_app_secret: string;
  kis_access_token: string | null;
  account_no: string;
  investor_type: string;
  created_at: string | null;
  updated_at: string | null;
}

// 사용자 정보 가져오기
async function fetchUser(): Promise<User | null> {
  const response = await fetch("/api/auth/me");

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error("사용자 정보를 불러오는데 실패했습니다.");
  }

  return await response.json();
}

// 로그아웃
async function logoutUser(): Promise<void> {
  const response = await fetch("/api/auth/logout", {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("로그아웃에 실패했습니다.");
  }
}

export function useUser() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // 사용자 정보 쿼리 - 캐싱 및 백그라운드 리프레시 지원
  const {
    data: user,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["user"],
    queryFn: fetchUser,
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    gcTime: 1000 * 60 * 30, // 30분간 캐시 유지
    retry: 1,
  });

  // 로그아웃 뮤테이션
  const logoutMutation = useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      // 캐시 무효화
      queryClient.setQueryData(["user"], null);
      router.push("/sign-in");
      router.refresh();
    },
  });

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (err) {
      // 에러는 mutation에서 처리됨
      throw err;
    }
  };

  return {
    user: user ?? null,
    loading,
    error: error
      ? error instanceof Error
        ? error.message
        : "알 수 없는 오류가 발생했습니다."
      : null,
    logout,
    refetch,
  };
}
