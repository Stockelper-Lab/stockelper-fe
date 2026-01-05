import { verifyToken } from "@/lib/auth";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

// 세션에서 user_id 가져오기
async function getUserIdFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(process.env.COOKIE_NAME || "auth-token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  return decoded ? parseInt(decoded.userId, 10) : null;
}

// 포트폴리오 추천 API 호출 (Next.js 중계)
export async function POST(req: NextRequest) {
  try {
    // TODO: 테스트용 고정값 - 나중에 세션에서 가져오도록 변경
    // const userId = await getUserIdFromSession();
    // if (!userId) {
    //   return NextResponse.json(
    //     { error: "인증이 필요합니다." },
    //     { status: 401 }
    //   );
    // }
    const userId = 4; // 고정값

    // 환경 변수에서 포트폴리오 서버 엔드포인트 가져오기
    const PORTFOLIO_ENDPOINT = process.env.PORTFOLIO_ENDPOINT || "http://220.86.116.160:21008";
    
    // 포트폴리오 추천 API 호출
    const portfolioResponse = await fetch(`${PORTFOLIO_ENDPOINT}/portfolio/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userId,
      }),
    });

    if (!portfolioResponse.ok) {
      const errorText = await portfolioResponse.text();
      console.error("포트폴리오 API 호출 실패:", portfolioResponse.status, errorText);
      return NextResponse.json(
        { error: `포트폴리오 API 호출 실패: ${portfolioResponse.status}` },
        { status: portfolioResponse.status }
      );
    }

    const data = await portfolioResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("포트폴리오 추천 API 라우트 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}

