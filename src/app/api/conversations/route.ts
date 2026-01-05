import {
  createConversationWithId,
  getConversations,
} from "@/lib/chat-service";
import { NextRequest, NextResponse } from "next/server";

// 새 대화 생성 API (첫 메시지 전송 시에만 호출됨)
export async function POST(req: NextRequest) {
  try {
    const { userId, conversationId, title } = await req.json();

    if (typeof userId !== "number") {
      return NextResponse.json(
        { error: "유효하지 않은 userId입니다." },
        { status: 400 }
      );
    }

    if (!conversationId || typeof conversationId !== "string") {
      return NextResponse.json(
        { error: "대화 ID가 필요합니다." },
        { status: 400 }
      );
    }

    // 전달받은 ID로 대화방 생성 (중복 시도 방지 - DB에서 unique constraint)
    const conversation = await createConversationWithId(
      userId,
      conversationId,
      title || "새 대화"
    );

    return NextResponse.json(conversation);
  } catch (error) {
    console.error("API 라우트에서 대화 생성 오류:", error);

    // Prisma unique constraint 에러 처리
    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "이미 존재하는 대화방입니다." },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: "대화 생성 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 대화 목록 조회 API
export async function GET(req: NextRequest) {
  try {
    const userIdStr = req.nextUrl.searchParams.get("userId");
    if (!userIdStr) {
      return NextResponse.json(
        { error: "userId가 필요합니다." },
        { status: 400 }
      );
    }

    const userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) {
      return NextResponse.json(
        { error: "유효하지 않은 userId입니다." },
        { status: 400 }
      );
    }

    const conversations = await getConversations(userId);
    return NextResponse.json(conversations);
  } catch (error) {
    console.error("API 라우트에서 대화 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "대화 목록을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
