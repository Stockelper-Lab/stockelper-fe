// 포트폴리오 추천 API 응답 타입
export interface PortfolioRecommendationResponse {
  investor_type: string;
  result: string; // 마크다운 형식의 결과
}

// 저장된 포트폴리오 추천 이력 타입
export interface PortfolioRecommendationHistory {
  id: string;
  userId: number;
  investorType: string;
  result: string;
  createdAt: string;
}

// 포트폴리오 추천 요청
export async function requestPortfolioRecommendation(
  userId: number
): Promise<PortfolioRecommendationResponse> {
  const response = await fetch("/api/portfolio/recommendations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ user_id: userId }),
  });

  if (!response.ok) {
    throw new Error(`포트폴리오 추천 요청 실패: ${response.status}`);
  }

  return await response.json();
}

// 로컬 스토리지 키
const PORTFOLIO_HISTORY_KEY = "portfolio-recommendations-history";

// 포트폴리오 추천 이력 저장
export function savePortfolioRecommendation(
  userId: number,
  recommendation: PortfolioRecommendationResponse
): PortfolioRecommendationHistory {
  const history = getPortfolioRecommendationHistory(userId);

  const newEntry: PortfolioRecommendationHistory = {
    id: `portfolio-${Date.now()}`,
    userId,
    investorType: recommendation.investor_type,
    result: recommendation.result,
    createdAt: new Date().toISOString(),
  };

  history.unshift(newEntry); // 최신 순으로 정렬

  // 최대 50개까지만 저장
  const limitedHistory = history.slice(0, 50);

  if (typeof window !== "undefined") {
    localStorage.setItem(PORTFOLIO_HISTORY_KEY, JSON.stringify(limitedHistory));
  }

  return newEntry;
}

// 포트폴리오 추천 이력 가져오기
export function getPortfolioRecommendationHistory(
  userId: number
): PortfolioRecommendationHistory[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(PORTFOLIO_HISTORY_KEY);
    if (!stored) return [];

    const allHistory: PortfolioRecommendationHistory[] = JSON.parse(stored);
    return allHistory.filter((item) => item.userId === userId);
  } catch {
    return [];
  }
}

// 특정 포트폴리오 추천 가져오기
export function getPortfolioRecommendationById(
  id: string
): PortfolioRecommendationHistory | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(PORTFOLIO_HISTORY_KEY);
    if (!stored) return null;

    const allHistory: PortfolioRecommendationHistory[] = JSON.parse(stored);
    return allHistory.find((item) => item.id === id) || null;
  } catch {
    return null;
  }
}
