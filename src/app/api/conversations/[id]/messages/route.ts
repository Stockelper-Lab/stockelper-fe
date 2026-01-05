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

    // 메시지 정렬: 최신 메시지가 먼저 오도록 정렬 (날짜 내림차순)
    const sortedMessages = [...messages].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime(); // 최신 메시지가 먼저 오도록 정렬
    });

    // 페이지에 따라 메시지 가져오기 (최신 메시지부터)
    // page=1: 최신 메시지 10개
    // page=2: 그 다음 10개 (더 오래된 메시지)
    const startIndex = (page - 1) * limit;
    const limitedMessages = sortedMessages.slice(
      startIndex,
      startIndex + limit
    );

    // 반환할 때는 오름차순으로 정렬 (오래된 메시지가 먼저 오도록)
    // 이렇게 하면 클라이언트에서 위로 스크롤할 때 더 오래된 메시지를 위에 추가할 수 있음
    const reversedMessages = [...limitedMessages].reverse();

    // 더 가져올 메시지가 있는지 확인
    // startIndex + limit이 전체 메시지 개수보다 작으면 더 가져올 메시지가 있음
    const hasMore = startIndex + limit < sortedMessages.length;

    return NextResponse.json({
      messages: reversedMessages, // 오름차순으로 반환 (오래된 메시지가 먼저)
      hasMore,
      totalCount: sortedMessages.length,
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
