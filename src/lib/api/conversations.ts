import { ConversationInfo } from "@/lib/chat-service";
import { Message } from "@/components/chat/types";

// 대화 목록 가져오기
export async function fetchConversations(
  userId: number
): Promise<ConversationInfo[]> {
  const response = await fetch(`/api/conversations?userId=${userId}`);

  if (!response.ok) {
    throw new Error(`대화 목록 로드 실패: ${response.status}`);
  }

  return await response.json();
}

// 대화 메시지 가져오기
export async function fetchConversationMessages(
  conversationId: string,
  limit: number = 10,
  page: number = 1
): Promise<{
  messages: Message[];
  hasMore: boolean;
  totalCount: number;
}> {
  const response = await fetch(
    `/api/conversations/${conversationId}/messages?limit=${limit}&page=${page}`
  );

  if (!response.ok) {
    throw new Error(`대화 메시지 로드 실패: ${response.status}`);
  }

  return await response.json();
}

// 새 대화 생성
export async function createConversation(userId: number): Promise<{
  id: string;
  title: string | null;
}> {
  const response = await fetch("/api/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    throw new Error(`대화 생성 실패: ${response.status}`);
  }

  return await response.json();
}

// 대화 제목 변경
export async function updateConversationTitle(
  conversationId: string,
  title: string
): Promise<{ id: string; title: string }> {
  const response = await fetch(`/api/conversations/${conversationId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    throw new Error(`대화방 이름 변경 실패: ${response.status}`);
  }

  return await response.json();
}

// 대화 삭제
export async function deleteConversation(
  conversationId: string
): Promise<void> {
  const response = await fetch(`/api/conversations/${conversationId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`대화방 삭제 실패: ${response.status}`);
  }
}

