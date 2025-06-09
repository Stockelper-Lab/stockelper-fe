import { createConversation, getConversations } from "@/lib/chat-service";
import { NextResponse } from "next/server";

// 새 대화 생성 API
export async function POST() {
  try {
    const conversation = await createConversation();
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
export async function GET() {
  try {
    const conversations = await getConversations();
    return NextResponse.json(conversations);
  } catch (error) {
    console.error("API 라우트에서 대화 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "대화 목록을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
