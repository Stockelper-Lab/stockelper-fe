import { createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// 입력 유효성 검사를 위한 스키마
const loginSchema = z.object({
  email: z.string().email({
    message: "유효한 이메일 주소를 입력해주세요.",
  }),
  password: z.string().min(1, {
    message: "비밀번호를 입력해주세요.",
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 입력값 검증
    const validation = loginSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "validation_error", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, password } = validation.data;

    // 사용자 조회
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        {
          error: "invalid_credentials",
          message: "이메일 또는 비밀번호가 일치하지 않습니다.",
        },
        { status: 401 }
      );
    }

    // 비밀번호 검증
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        {
          error: "invalid_credentials",
          message: "이메일 또는 비밀번호가 일치하지 않습니다.",
        },
        { status: 401 }
      );
    }

    // 세션 생성 및 JWT 토큰 발급
    const token = await createSession(user.id.toString());

    // HTTP-Only 쿠키에 JWT 설정
    const cookieName = process.env.COOKIE_NAME || "auth-token";
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: "/",
    };

    // 응답 객체 생성
    const response = NextResponse.json(
      {
        message: "로그인 성공",
        user: { id: user.id, email: user.email, name: user.name },
      },
      { status: 200 }
    );

    // 쿠키 설정
    response.cookies.set(cookieName, token, cookieOptions);

    return response;
  } catch (error) {
    console.error("로그인 처리 중 오류 발생:", error);
    return NextResponse.json(
      { error: "server_error", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
