import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const cookieName = process.env.COOKIE_NAME || "auth-token";
    const token = request.cookies.get(cookieName)?.value;

    if (token) {
      // 데이터베이스에서 세션 정보 삭제
      await prisma.sessions.deleteMany({
        where: { token },
      });
    }

    // 응답 생성 및 쿠키 삭제
    const response = NextResponse.json(
      { message: "로그아웃 되었습니다." },
      { status: 200 }
    );

    response.cookies.delete(cookieName);

    return response;
  } catch (error) {
    console.error("로그아웃 처리 중 오류 발생:", error);
    return NextResponse.json(
      { error: "server_error", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
