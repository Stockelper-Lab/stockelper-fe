import evalInvestorProfile from "@/app/api/auth/register/eval_investor_profile";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const surveySchema = z.object({
  q1: z.number().min(1),
  q2: z.number().min(1),
  q3: z.number().min(1),
  q4: z.number().min(1),
  q5: z.array(z.number()).min(1),
  q6: z.number().min(1),
  q7: z.number().min(1),
  q8: z.number().min(1),
});

async function getUserIdFromSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(process.env.COOKIE_NAME || "auth-token")?.value;
  if (!token) return null;

  const decoded = verifyToken(token);
  return decoded ? parseInt(decoded.userId, 10) : null;
}

export async function GET() {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const survey = await prisma.survey.findFirst({
      where: { user_id: userId },
    });

    if (!survey) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    return NextResponse.json(survey);
  } catch (error) {
    console.error("설문 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "설문 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const userId = await getUserIdFromSession();
  if (!userId) {
    // 비로그인 사용자는 이 API를 사용할 수 없습니다.
    // 회원가입 플로우의 일부로 설문을 제출하는 경우는 register API를 사용해야 합니다.
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const validation = surveySchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const investorType = evalInvestorProfile(validation.data);

    // 트랜잭션을 사용하여 사용자 정보와 설문 정보를 함께 업데이트합니다.
    await prisma.$transaction(async (tx) => {
      // 1. 사용자 테이블의 investor_type 업데이트
      await tx.users.update({
        where: { id: userId },
        data: { investor_type: investorType },
      });

      // 2. 설문 테이블 업데이트 (없으면 생성)
      await tx.survey.upsert({
        where: { user_id: userId },
        update: { answer: validation.data },
        create: { user_id: userId, answer: validation.data },
      });
    });

    return NextResponse.json({
      message: "설문이 성공적으로 업데이트되었습니다.",
    });
  } catch (error) {
    console.error("설문 업데이트 중 오류 발생:", error);
    return NextResponse.json(
      { error: "설문 업데이트에 실패했습니다." },
      { status: 500 }
    );
  }
}
