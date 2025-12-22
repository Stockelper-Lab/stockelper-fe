import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

// JWT 시크릿 키 검증 - 프로덕션에서 반드시 환경변수 설정 필요
function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "JWT_SECRET 환경변수가 설정되지 않았습니다. 프로덕션 환경에서는 반드시 설정해야 합니다."
      );
    }
    // 개발 환경에서만 경고 출력 후 폴백 사용
    console.warn(
      "⚠️ JWT_SECRET 환경변수가 설정되지 않았습니다. 개발용 키를 사용합니다."
    );
    return "dev-only-secret-do-not-use-in-production";
  }
  return secret;
}

// 비밀번호 해싱
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

// 비밀번호 검증
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// JWT 토큰 생성
export function generateToken(userId: string): string {
  return jwt.sign({ userId }, getJwtSecret(), {
    expiresIn: "7d",
  });
}

// JWT 토큰 검증
export function verifyToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as { userId: string };
    return decoded;
  } catch (error) {
    console.error("토큰 검증 오류:", error);
    return null;
  }
}

// 인증 쿠키 설정
export async function setAuthCookie(token: string) {
  const cookieName = process.env.COOKIE_NAME || "auth-token";
  const cookieStore = await cookies();

  // 보안 쿠키 설정 (HTTPS Only)
  cookieStore.set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7, // 7일
    path: "/",
  });
}

// 인증 쿠키 제거
export async function removeAuthCookie() {
  const cookieName = process.env.COOKIE_NAME || "auth-token";
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

// 세션 생성 및 저장
export async function createSession(userId: string): Promise<string> {
  const token = generateToken(userId);

  // 세션 만료일 계산 (JWT 만료와 동일하게 7일)
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  // 세션 저장
  await prisma.sessions.create({
    data: {
      user_id: parseInt(userId),
      token,
      expires_at: expiresAt,
    },
  });

  return token;
}

// 세션 검증
export async function validateSession(token: string): Promise<string | null> {
  try {
    // 토큰 검증
    const decoded = verifyToken(token);
    if (!decoded) return null;

    // 데이터베이스에서 세션 확인
    const session = await prisma.sessions.findFirst({
      where: {
        token,
        expires_at: {
          gt: new Date(),
        },
      },
    });

    return session ? session.user_id.toString() : null;
  } catch (error) {
    console.error("세션 검증 오류:", error);
    return null;
  }
}

// 현재 로그인한 사용자 가져오기
export async function getCurrentUser() {
  const cookieName = process.env.COOKIE_NAME || "auth-token";
  const cookieStore = await cookies();
  const token = cookieStore.get(cookieName)?.value;

  if (!token) return null;

  const userId = await validateSession(token);
  if (!userId) return null;

  const user = await prisma.users.findUnique({
    where: { id: parseInt(userId) },
    select: {
      id: true,
      email: true,
      name: true,
      nickname: true,
      kis_app_key: true,
      kis_app_secret: true,
      account_no: true,
      investor_type: true,
      created_at: true,
      updated_at: true,
    },
  });

  return user;
}
