// 포트폴리오 추천 API 응답 타입
export interface PortfolioRecommendationResponse {
  id: string;
  job_id?: string | null;
  investor_type: string;
  result: string; // 마크다운 형식의 결과
  created_at: string;
}

// 저장된 포트폴리오 추천 이력 타입
export interface PortfolioRecommendationHistory {
  id: string;
  userId: number;
  jobId?: string | null;
  investorType: string;
  result: string; // 빈 문자열이면 동작 중 상태
  createdAt: string;
}

// 포트폴리오 추천 요청 (데이터베이스에 저장됨)
export async function requestPortfolioRecommendation(): Promise<PortfolioRecommendationResponse> {
  const response = await fetch("/api/portfolio/recommendations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `포트폴리오 추천 요청 실패: ${response.status}`
    );
  }

  return await response.json();
}

// 포트폴리오 추천 이력 가져오기 (데이터베이스에서)
export async function getPortfolioRecommendationHistory(): Promise<PortfolioRecommendationHistory[]> {
  const response = await fetch("/api/portfolio/recommendations", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    console.error("포트폴리오 추천 이력 조회 실패:", response.status);
    return [];
  }

  const data = (await response.json()) as PortfolioRecommendationHistory[];
  return data.map((item) => ({
    id: item.id,
    userId: item.userId,
    jobId: item.jobId || null,
    investorType: item.investorType,
    result: item.result,
    createdAt: item.createdAt,
  }));
}

// 특정 포트폴리오 추천 가져오기 (데이터베이스에서)
export async function getPortfolioRecommendationById(
  id: string
): Promise<PortfolioRecommendationHistory | null> {
  const response = await fetch(`/api/portfolio/recommendations/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    console.error("포트폴리오 추천 조회 실패:", response.status);
    return null;
  }

  const data = await response.json();
  return {
    id: data.id,
    userId: data.userId,
    jobId: data.jobId || null,
    investorType: data.investorType,
    result: data.result,
    createdAt: data.createdAt,
  };
}
