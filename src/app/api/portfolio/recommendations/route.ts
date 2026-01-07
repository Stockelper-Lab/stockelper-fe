import { validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const FORCE_ID_MODE = false;
const FORCE_ID = 4;

// 포트폴리오 추천 API 호출 (백엔드 서버가 DB row를 생성함)
export async function POST(req: NextRequest) {
  try {
    // 세션에서 userId 가져오기
    const cookieName = process.env.COOKIE_NAME || "auth-token";
    const token = req.cookies.get(cookieName)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const userId = await validateSession(token);
    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const userIdNum = FORCE_ID_MODE ? FORCE_ID : parseInt(userId, 10);

    // 환경 변수에서 포트폴리오 서버 엔드포인트 가져오기
    const PORTFOLIO_ENDPOINT = process.env.PORTFOLIO_ENDPOINT || "http://220.86.116.160:21008";
    
    // 포트폴리오 추천 API 호출 (백엔드 서버가 DB row를 생성함)
    const portfolioResponse = await fetch(`${PORTFOLIO_ENDPOINT}/portfolio/recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        user_id: userIdNum,
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

    // 백엔드 서버가 DB row를 생성하고 반환한 데이터를 그대로 반환
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

// 포트폴리오 추천 이력 조회
export async function GET(req: NextRequest) {
  try {
    // 세션에서 userId 가져오기
    const cookieName = process.env.COOKIE_NAME || "auth-token";
    const token = req.cookies.get(cookieName)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const userId = await validateSession(token);
    if (!userId) {
      return NextResponse.json(
        { error: "인증이 필요합니다." },
        { status: 401 }
      );
    }

    const userIdNum = FORCE_ID_MODE ? FORCE_ID : parseInt(userId, 10);

    // 데이터베이스에서 조회
    const recommendations = await prisma.portfolioRecommendation.findMany({
      where: {
        userId: userIdNum,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50, // 최대 50개까지만
    });

    return NextResponse.json(
      recommendations.map((rec) => ({
        id: rec.id,
        userId: rec.userId,
        jobId: rec.jobId,
        investorType: rec.investorType,
        result: rec.result,
        createdAt: rec.createdAt,
      }))
    );
  } catch (error) {
    console.error("포트폴리오 추천 이력 조회 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}

