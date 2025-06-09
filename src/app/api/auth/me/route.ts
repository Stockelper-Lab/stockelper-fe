import { validateSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const cookieName = process.env.COOKIE_NAME || "auth-token";
    const token = request.cookies.get(cookieName)?.value;

    if (!token) {
      return NextResponse.json(
        { error: "unauthorized", message: "인증되지 않은 요청입니다." },
        { status: 401 }
      );
    }

    // 세션 검증
    const userId = await validateSession(token);

    if (!userId) {
      // 세션이 유효하지 않으면 쿠키 삭제
      const response = NextResponse.json(
        { error: "unauthorized", message: "세션이 만료되었습니다." },
        { status: 401 }
      );

      response.cookies.delete(cookieName);
      return response;
    }

    // 사용자 정보 조회
    const user = await prisma.users.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "not_found", message: "사용자를 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    return NextResponse.json(user, { status: 200 });
  } catch (error) {
    console.error("사용자 정보 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "server_error", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
