import { PrismaClient } from "../generated/prisma";

// PrismaClient는 전역 환경에서 단일 인스턴스만 유지하기 위한 코드
// https://www.prisma.io/docs/guides/performance-and-optimization/connection-management

// 전역 객체 타입 확장을 위한 interface 선언
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// 개발 환경에서는 전역 객체에 저장하고 프로덕션에서는 매번 새 인스턴스 생성
export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

// 개발 환경에서만 전역 객체에 클라이언트 캐싱
if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}
