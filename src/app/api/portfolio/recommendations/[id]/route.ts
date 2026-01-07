import { validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

const FORCE_ID_MODE = false;
const FORCE_ID = 4;

// 특정 포트폴리오 추천 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const recommendationId = (await params).id;

    // 데이터베이스에서 조회
    const recommendation = await prisma.portfolioRecommendation.findUnique({
      where: {
        id: recommendationId,
      },
    });

    if (!recommendation) {
      return NextResponse.json(
        { error: "포트폴리오 추천을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    // 본인의 추천인지 확인
    if (!FORCE_ID_MODE && recommendation.userId !== userIdNum) {
      return NextResponse.json(
        { error: "권한이 없습니다." },
        { status: 403 }
      );
    }

    return NextResponse.json({
      id: recommendation.id,
      userId: recommendation.userId,
      jobId: recommendation.jobId,
      investorType: recommendation.investorType,
      result: recommendation.result,
      createdAt: recommendation.createdAt,
    });
  } catch (error) {
    console.error("포트폴리오 추천 조회 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}

