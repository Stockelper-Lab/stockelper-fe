import { BacktestingHistoryItem } from "@/lib/types/backtesting";

// 백테스팅 이력 가져오기
export async function getBacktestingHistory(): Promise<BacktestingHistoryItem[]> {
  const response = await fetch("/api/backtesting", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { error?: string })?.error ||
        `백테스팅 이력 조회 실패: ${response.status}`
    );
  }

  return (await response.json()) as BacktestingHistoryItem[];
}

// 특정 백테스팅 결과 가져오기
export async function getBacktestingById(
  id: string
): Promise<BacktestingHistoryItem | null> {
  const response = await fetch(`/api/backtesting/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) return null;
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      (errorData as { error?: string })?.error ||
        `백테스팅 결과 조회 실패: ${response.status}`
    );
  }

  return (await response.json()) as BacktestingHistoryItem;
}

