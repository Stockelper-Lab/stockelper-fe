import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const kisSettingsSchema = z.object({
  kis_app_key: z.string().min(1, "KIS APP Key를 입력해주세요."),
  kis_app_secret: z.string().min(1, "KIS APP Secret을 입력해주세요."),
  account_no: z.string().min(1, "계좌번호를 입력해주세요."),
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
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        kis_app_key: true,
        kis_app_secret: true,
        account_no: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch KIS settings" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const userId = await getUserIdFromSession();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();

  const validation = kisSettingsSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  try {
    const updatedUser = await prisma.users.update({
      where: { id: userId },
      data: {
        kis_app_key: validation.data.kis_app_key,
        kis_app_secret: validation.data.kis_app_secret,
        account_no: validation.data.account_no,
      },
    });

    return NextResponse.json({
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      nickname: updatedUser.nickname,
      kis_app_key: updatedUser.kis_app_key,
      kis_app_secret: updatedUser.kis_app_secret,
      account_no: updatedUser.account_no,
      investor_type: updatedUser.investor_type,
      created_at: updatedUser.created_at,
      updated_at: updatedUser.updated_at,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to update KIS settings" },
      { status: 500 }
    );
  }
}
