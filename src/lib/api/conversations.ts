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

// 새 대화 생성 (지정된 ID로 생성 - 첫 메시지 전송 시)
export async function createConversation(
  userId: number,
  conversationId: string,
  title?: string
): Promise<{
  id: string;
  title: string | null;
}> {
  const response = await fetch("/api/conversations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userId, conversationId, title }),
  });

  if (!response.ok) {
    throw new Error(`대화 생성 실패: ${response.status}`);
  }

  return await response.json();
}

// 대화 제목 생성 (AI 스트리밍)
export async function generateConversationTitle(
  conversationId: string,
  firstMessage: string,
  onToken?: (token: string) => void,
  onComplete?: (title: string) => void
): Promise<string> {
  const response = await fetch(
    `/api/conversations/${conversationId}/generate-title`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ firstMessage }),
    }
  );

  if (!response.ok) {
    throw new Error(`제목 생성 실패: ${response.status}`);
  }

  // 스트리밍 응답 처리
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("text/event-stream") && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let fullTitle = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split("\n");

      for (const line of lines) {
        if (!line.trim() || line.trim() === "[DONE]") continue;

        let jsonStr = line.trim();
        if (jsonStr.startsWith("data: ")) {
          jsonStr = jsonStr.substring(6);
        }

        if (jsonStr === "[DONE]") continue;

        try {
          const event = JSON.parse(jsonStr);

          if (event.type === "delta" && event.token) {
            fullTitle += event.token;
            if (onToken) {
              onToken(event.token);
            }
          }

          if (event.type === "final" && event.title) {
            fullTitle = event.title;
            if (onComplete) {
              onComplete(event.title);
            }
          }
        } catch {
          // JSON 파싱 실패 무시
        }
      }
    }

    if (onComplete && fullTitle) {
      onComplete(fullTitle);
    }

    return fullTitle;
  }

  // 일반 JSON 응답
  const result = await response.json();
  if (onComplete && result.title) {
    onComplete(result.title);
  }
  return result.title;
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

