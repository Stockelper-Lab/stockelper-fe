import { createConversation, getConversations } from "@/lib/chat-service";
import { NextRequest, NextResponse } from "next/server";

// 새 대화 생성 API
export async function POST(req: NextRequest) {
  try {
    const { userId } = await req.json();
    if (typeof userId !== "number") {
      return NextResponse.json(
        { error: "유효하지 않은 userId입니다." },
        { status: 400 }
      );
    }
    const conversation = await createConversation(userId);
    return NextResponse.json(conversation);
  } catch (error) {
    console.error("API 라우트에서 대화 생성 오류:", error);
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
