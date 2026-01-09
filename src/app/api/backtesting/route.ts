import { validateSession } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

import { loadBacktestingFromFile } from "./backtesting-data";

// 백테스팅 이력 조회
export async function GET(req: NextRequest) {
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
    const items = await loadBacktestingFromFile();

    const history = items
      .filter((item) => item.userId === userIdNum)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 50);

    return NextResponse.json(history);
  } catch (error) {
    console.error("백테스팅 이력 조회 오류:", error);
    return NextResponse.json(
      {
        error: "서버 오류가 발생했습니다.",
        details: error instanceof Error ? error.message : "알 수 없는 오류",
      },
      { status: 500 }
    );
  }
}

