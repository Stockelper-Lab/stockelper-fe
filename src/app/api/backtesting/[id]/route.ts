import { validateSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

import { loadBacktestingFromFile } from "../backtesting-data";

// 특정 백테스팅 결과 조회
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
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

    const userIdNum = parseInt(userId, 10);
    const backtestingId = (await params).id;

    const items = await loadBacktestingFromFile();
    const found = items.find((item) => item.id === backtestingId);

    if (!found) {
      return NextResponse.json(
        { error: "백테스팅 결과를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    if (found.userId !== userIdNum) {
      return NextResponse.json({ error: "권한이 없습니다." }, { status: 403 });
    }

    return NextResponse.json(found);
  } catch (error) {
    console.error("백테스팅 결과 조회 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}

