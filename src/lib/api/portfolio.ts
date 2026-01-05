// 포트폴리오 추천 목록 가져오기
export async function fetchPortfolioRecommendations(
  userId: number
): Promise<PortfolioRecommendation[]> {
  const response = await fetch("/api/portfolio/recommendations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    throw new Error(`포트폴리오 추천 목록 로드 실패: ${response.status}`);
  }

  return await response.json();
}

// 포트폴리오 추천 타입 정의
export interface PortfolioRecommendation {
  id?: number;
  user_id: number;
  timestamp?: string;
  created_at?: string;
  recommendations?: PortfolioItem[];
  [key: string]: unknown;
}

export interface PortfolioItem {
  stock_code?: string;
  stock_name?: string;
  weight?: number;
  price?: number;
  quantity?: number;
  [key: string]: unknown;
}

