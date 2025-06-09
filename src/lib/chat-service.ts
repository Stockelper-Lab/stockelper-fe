import { Message, Subgraph, TradingAction } from "@/components/chat/types";
import { Chat } from "../generated/prisma";
import { prisma } from "./db";

// 프론트엔드에서 사용할 대화 정보 타입
export interface ConversationInfo {
  id: string;
  title: string;
  lastActive: Date;
  messageCount?: number;
  firstMessage?: string;
}

// 채팅방(Conversation) 생성
export async function createConversation(userId?: string) {
  const conversation = await prisma.conversation.create({
    data: {
      userId,
      // 임시 제목 설정 (나중에 첫 번째 메시지 내용 등으로 업데이트 가능)
      title: "새 대화",
    },
  });
  return conversation;
}

// 채팅방 목록 조회
export async function getConversations(
  userId?: string,
  limit = 10
): Promise<ConversationInfo[]> {
  const whereClause = userId ? { userId } : {};

  const conversations = await prisma.conversation.findMany({
    where: whereClause,
    orderBy: {
      lastActive: "desc",
    },
    take: limit,
    include: {
      // 각 대화의 첫 번째 메시지를 포함하여 제목으로 사용 가능
      messages: {
        take: 1,
        orderBy: {
          createdAt: "asc",
        },
      },
      _count: {
        select: { messages: true },
      },
    },
  });

  // 프론트엔드에서 사용할 형태로 변환
  return conversations.map((conv) => ({
    id: conv.id,
    title: conv.title || "새 대화",
    lastActive: conv.lastActive,
    messageCount: conv._count.messages,
    firstMessage: conv.messages[0]?.content.substring(0, 50) || "",
  }));
}

// 특정 채팅방의 메시지 목록 조회
export async function getMessages(conversationId: string) {
  const messages = await prisma.chat.findMany({
    where: {
      conversationId,
    },
    orderBy: {
      timestamp: "asc",
    },
  });

  // DB에서 가져온 메시지를 프론트엔드 타입으로 변환
  const formattedMessages: Message[] = messages.map((message: Chat) => {
    let subgraph: Subgraph | undefined = undefined;
    let tradingAction: TradingAction | null = null;

    if (message.subgraphData) {
      subgraph = message.subgraphData as unknown as Subgraph;
    }

    if (message.tradingActionData) {
      tradingAction = message.tradingActionData as unknown as TradingAction;
    }

    return {
      id: message.messageId,
      role: message.role as "user" | "assistant" | "question",
      content: message.content,
      timestamp: message.timestamp,
      subgraph,
      trading_action: tradingAction,
      error: message.errorMessage || null,
      feedbackResponse: message.humanFeedbackResponse,
    };
  });

  return formattedMessages;
}

// 메시지 저장
export async function saveMessage(conversationId: string, message: Message) {
  // 채팅방 활성 시간 업데이트
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastActive: new Date() },
  });

  // 메시지 저장
  const savedMessage = await prisma.chat.create({
    data: {
      conversationId,
      messageId: message.id,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
      subgraphData: message.subgraph
        ? (message.subgraph as unknown as object)
        : undefined,
      tradingActionData: message.trading_action
        ? (message.trading_action as unknown as object)
        : undefined,
      errorMessage: message.error || undefined,
      humanFeedbackResponse: message.feedbackResponse,
    },
  });

  return savedMessage;
}

// 피드백 응답 저장 (기존 메시지 업데이트)
export async function saveFeedback(
  conversationId: string,
  messageId: string,
  feedback: boolean
) {
  const updatedMessage = await prisma.chat.updateMany({
    where: {
      conversationId,
      messageId,
    },
    data: {
      humanFeedbackResponse: feedback,
      role: "assistant", // role을 question에서 assistant로 변경
    },
  });

  return updatedMessage;
}

// 채팅방 삭제
export async function deleteConversation(conversationId: string) {
  await prisma.conversation.delete({
    where: {
      id: conversationId,
    },
  });

  return { success: true };
}
