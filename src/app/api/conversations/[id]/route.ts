import { deleteConversation, getMessages } from "@/lib/chat-service";
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// 대화 정보 가져오기
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    const messages = await getMessages(conversationId);

    return NextResponse.json(messages);
  } catch (error) {
    console.error("대화 정보 조회 중 오류 발생:", error);
    return NextResponse.json(
      { error: "대화 정보를 가져오는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// 대화방 이름 변경
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    const { title } = await request.json();

    // 대화방 이름 업데이트
    const updatedConversation = await prisma.conversation.update({
      where: { id: conversationId },
      data: { title },
    });

    return NextResponse.json(updatedConversation);
  } catch (error) {
    console.error("대화방 이름 변경 중 오류 발생:", error);
    return NextResponse.json(
      { error: "대화방 이름을 변경하는데 실패했습니다." },
      { status: 500 }
    );
  }
}

// 대화방 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const conversationId = params.id;
    await deleteConversation(conversationId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("대화방 삭제 중 오류 발생:", error);
    return NextResponse.json(
      { error: "대화방을 삭제하는데 실패했습니다." },
      { status: 500 }
    );
  }
}
