import { Message } from "@/components/chat/types";
import { getMessages, saveMessage } from "@/lib/chat-service";
import { NextRequest, NextResponse } from "next/server";

// 특정 대화의 메시지 목록 조회 API
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // params가 Promise인 경우 await로 처리
    const resolvedParams = await Promise.resolve(params);
    const conversationId = resolvedParams.id;

    if (!conversationId) {
      return NextResponse.json(
        { error: "대화 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = searchParams.get("limit")
      ? parseInt(searchParams.get("limit")!)
      : 10;
    const page = searchParams.get("page")
      ? parseInt(searchParams.get("page")!)
      : 1;

    // 기존 getMessages 함수 호출
    const messages = await getMessages(conversationId);

    // 메시지 정렬: 최신 메시지가 아래에 오도록 정렬 (날짜 오름차순)
    // 이렇게 하면 인피니티 스크롤로 과거 메시지를 로드할 때 위쪽에 메시지가 추가됨
    const sortedMessages = [...messages].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateA.getTime() - dateB.getTime(); // 오래된 메시지가 먼저 오도록 정렬
    });

    // 페이지에 따라 메시지 가져오기 (오래된 메시지가 먼저 오도록)
    const startIndex = (page - 1) * limit;
    const limitedMessages = sortedMessages.slice(
      startIndex,
      startIndex + limit
    );

    return NextResponse.json({
      messages: limitedMessages,
      // 더 가져올 메시지가 있는지 확인
      hasMore: startIndex + limit < messages.length,
      totalCount: messages.length,
    });
  } catch (error) {
    console.error("API 라우트에서 메시지 목록 조회 오류:", error);
    return NextResponse.json(
      { error: "메시지 목록을 가져오는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}

// 특정 대화에 메시지 저장 API
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // params가 Promise인 경우 await로 처리
    const resolvedParams = await Promise.resolve(params);
    const conversationId = resolvedParams.id;

    if (!conversationId) {
      return NextResponse.json(
        { error: "대화 ID가 필요합니다." },
        { status: 400 }
      );
    }

    const messageData = await request.json();
    const savedMessage = await saveMessage(
      conversationId,
      messageData as Message
    );
    return NextResponse.json(savedMessage);
  } catch (error) {
    console.error("API 라우트에서 메시지 저장 오류:", error);
    return NextResponse.json(
      { error: "메시지를 저장하는 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
