"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function ReactQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // 캐시된 데이터를 먼저 보여주고 백그라운드에서 리프레시
            staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
            gcTime: 1000 * 60 * 30, // 30분간 캐시 유지 (이전 cacheTime)
            refetchOnWindowFocus: true, // 윈도우 포커스 시 리프레시
            refetchOnReconnect: true, // 네트워크 재연결 시 리프레시
            retry: 1, // 실패 시 1번 재시도
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
}

