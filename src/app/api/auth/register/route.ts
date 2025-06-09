import evalInvestorProfile from "@/app/api/auth/register/eval_investor_profile";
import { hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// 입력 유효성 검사를 위한 스키마
const registerSchema = z.object({
  email: z.string().email({
    message: "유효한 이메일 주소를 입력해주세요.",
  }),
  password: z.string().min(8, {
    message: "비밀번호는 최소 8자 이상이어야 합니다.",
  }),
  name: z.string(),
  nickname: z.string(),
  survey: z.object(
    {
      q1: z.number().min(1),
      q2: z.number().min(1),
      q3: z.number().min(1),
      q4: z.number().min(1),
      q5: z.array(z.number()).min(1),
      q6: z.number().min(1),
      q7: z.number().min(1),
      q8: z.number().min(1),
    },
    {
      required_error: "모든 질문에 답해주세요.",
    }
  ),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // 입력값 검증
    const validation = registerSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "validation_error", details: validation.error.errors },
        { status: 400 }
      );
    }

    const { email, password, name, nickname, survey } = validation.data;

    // 이메일 중복 검사
    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "email_taken", message: "이미 사용 중인 이메일입니다." },
        { status: 400 }
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password);

    const investorType = evalInvestorProfile(survey);

    // 사용자 생성
    const user = await prisma.users.create({
      data: {
        email,
        password: hashedPassword,
        name,
        nickname,
        kis_app_key: "",
        kis_app_secret: "",
        account_no: "",
        investor_type: investorType,
      },
      select: {
        id: true,
        email: true,
        name: true,
        created_at: true,
      },
    });

    await prisma.survey.create({
      data: {
        user_id: user.id,
        answer: survey,
      },
    });

    return NextResponse.json(
      { message: "회원가입이 완료되었습니다.", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("회원가입 처리 중 오류 발생:", error);
    return NextResponse.json(
      { error: "server_error", message: "서버 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
