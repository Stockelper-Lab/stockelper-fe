import { NextRequest, NextResponse } from "next/server";

// 공개 경로 (로그인하지 않아도 접근 가능한 경로)
const publicPaths = ["/sign-in", "/sign-up", "/forgot-password"];

// 인증이 필요한 경로
const authPaths = ["/dashboard", "/profile", "/settings"];

export async function middleware(request: NextRequest) {
  const cookieName = process.env.COOKIE_NAME || "auth-token";
  const token = request.cookies.get(cookieName)?.value;
  const { pathname } = request.nextUrl;

  // 인증이 필요한 경로에 접근하려는 경우
  if (authPaths.some((path) => pathname.startsWith(path))) {
    // 토큰이 없으면 로그인 페이지로 리다이렉트
    if (!token) {
      const url = new URL("/sign-in", request.url);
      url.searchParams.set("from", pathname);
      return NextResponse.redirect(url);
    }
  }

  // 이미 로그인한 상태에서 로그인/회원가입 페이지에 접근하려는 경우
  if (publicPaths.includes(pathname) && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// 미들웨어가 적용될 경로 설정 (모든 경로에 적용)
export const config = {
  matcher: [
    /*
     * 다음 경로에 대해 미들웨어를 적용합니다:
     * - sign-in, sign-up, forgot-password (로그인/회원가입 관련 페이지)
     * - dashboard, profile, settings (인증이 필요한 페이지)
     */
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/dashboard/:path*",
    "/profile/:path*",
    "/settings/:path*",
  ],
};
