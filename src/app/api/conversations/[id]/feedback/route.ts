import { saveFeedback } from "@/lib/chat-service";
import { NextRequest, NextResponse } from "next/server";

// 피드백 저장 API
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const conversationId = (await params).id;
    if (!conversationId) {
      return NextResponse.json(
        { error: "대화 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const { messageId, feedback } = await request.json();

    if (!messageId || feedback === undefined) {
      return NextResponse.json(
        { error: "메시지 ID와 피드백 값이 필요합니다." },
        { status: 400 }
      );
    }

    const result = await saveFeedback(conversationId, messageId, feedback);
    return NextResponse.json(result);
  } catch (error) {
    console.error("API 라우트에서 피드백 저장 오류:", error);
    return NextResponse.json(
      { error: "피드백을 저장하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
