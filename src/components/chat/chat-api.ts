import process from "process";
import { v4 as uuidv4 } from "uuid";
import { Message, Subgraph, TradingAction } from "./types";

// 현재 활성화된 대화 ID를 저장하는 변수
let currentConversationId: string | null = null;

// API 응답 타입 정의
interface ApiResponse {
  message: string;
  subgraph?: Subgraph;
  trading_action?: TradingAction | null;
  error?: string | null;
}

// 대화 ID 초기화 함수
async function ensureConversationId(): Promise<string> {
  if (!currentConversationId) {
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("currentConversationId");
      if (storedId) {
        currentConversationId = storedId;
        return storedId;
      }
    }

    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`대화 생성 실패: ${response.status}`);
      }

      const newConversation = await response.json();
      if (!newConversation.id) {
        throw new Error("서버에서 유효한 대화 ID를 반환하지 않았습니다.");
      }

      currentConversationId = newConversation.id;

      if (typeof window !== "undefined") {
        localStorage.setItem("currentConversationId", newConversation.id);
      }
    } catch (error) {
      console.error("새 대화 생성 중 오류 발생:", error);
      throw error;
    }
  }

  if (!currentConversationId) {
    throw new Error("대화 ID를 생성할 수 없습니다.");
  }

  return currentConversationId;
}

// 메시지 저장 함수
async function saveMessageToAPI(
  conversationId: string,
  message: Message
): Promise<Record<string, unknown>> {
  try {
    const response = await fetch(
      `/api/conversations/${conversationId}/messages`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      }
    );

    if (!response.ok) {
      throw new Error(`메시지 저장 실패: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("메시지 저장 중 오류 발생:", error);
    throw error;
  }
}

// trading_action의 유효성 검증 함수
export function isValidTradingAction(action: TradingAction): boolean {
  if (!action.stock_code || !action.order_side) {
    return false;
  }
  if (action.order_side !== "buy" && action.order_side !== "sell") {
    return false;
  }
  if (action.order_quantity !== undefined) {
    const quantity = Number(action.order_quantity);
    if (isNaN(quantity) || quantity <= 0) {
      return false;
    }
  }
  if (action.order_price !== undefined) {
    const price = Number(action.order_price);
    if (isNaN(price) || price <= 0) {
      return false;
    }
  }
  const stockCodeRegex = /^\d+$/;
  if (!stockCodeRegex.test(action.stock_code)) {
    return false;
  }
  return true;
}

// 스트림 처리 헬퍼 함수
async function processStream(
  response: Response,
  conversationId: string,
  onChunkReceived?: (chunkText: string) => void,
  onResponseComplete?: (message: Message) => void
): Promise<Message> {
  if (!response.body) {
    throw new Error("응답 본문이 없습니다.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let lastMessage: Message | null = null;
  let responseText = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      if (buffer.trim()) {
        try {
          const data = JSON.parse(buffer) as ApiResponse;
          responseText = data.message;
          lastMessage = {
            id: uuidv4(),
            role: "assistant",
            content: data.message,
            timestamp: new Date(),
            ...(data.subgraph && { subgraph: data.subgraph }),
            ...(data.trading_action && {
              trading_action: data.trading_action,
            }),
            ...(data.error && { error: data.error }),
          };
          if (onChunkReceived) {
            onChunkReceived(responseText);
          }
        } catch (error) {
          console.error("스트림 마지막 청크 파싱 오류:", buffer, error);
        }
      }
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.trim() === "") continue;
      try {
        const data = JSON.parse(line) as ApiResponse;
        const newChunk = data.message.slice(responseText.length);
        if (onChunkReceived && newChunk) {
          onChunkReceived(newChunk);
        }
        responseText = data.message;

        lastMessage = {
          id: uuidv4(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
          ...(data.subgraph && { subgraph: data.subgraph }),
          ...(data.trading_action && { trading_action: data.trading_action }),
          ...(data.error && { error: data.error }),
        };
      } catch (error) {
        console.error("스트림 청크 파싱 오류:", line, error);
      }
    }
  }

  if (!lastMessage) {
    throw new Error("스트림에서 메시지를 수신하지 못했습니다.");
  }

  await saveMessageToAPI(conversationId, lastMessage);

  if (
    lastMessage.trading_action &&
    isValidTradingAction(lastMessage.trading_action)
  ) {
    const questionMessage: Message = {
      id: uuidv4(),
      role: "question",
      content: `이 분석 결과에 따라 ${
        lastMessage.trading_action.stock_code || "해당 종목"
      } ${lastMessage.trading_action.order_quantity || ""}주를 ${
        lastMessage.trading_action.order_side === "buy" ? "매수" : "매도"
      }하시겠습니까?`,
      timestamp: new Date(),
      feedbackResponse: null,
    };
    await saveMessageToAPI(conversationId, questionMessage);

    if (onResponseComplete) {
      onResponseComplete(lastMessage);
      setTimeout(() => onResponseComplete(questionMessage), 100);
    }
  } else if (onResponseComplete) {
    onResponseComplete(lastMessage);
  }

  return lastMessage;
}

async function handleApiCall(
  conversationId: string,
  requestBody: Record<string, unknown>,
  onChunkReceived?: (chunkText: string) => void,
  onResponseComplete?: (message: Message) => void
): Promise<Message> {
  try {
    const API_ENDPOINT = process.env.NEXT_PUBLIC_LLM_ENDPOINT as string;
    const response = await fetch(`${API_ENDPOINT}/stock/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.status}`);
    }

    return await processStream(
      response,
      conversationId,
      onChunkReceived,
      onResponseComplete
    );
  } catch (error) {
    console.error("API 호출 중 오류 발생:", error);
    const errorMessage: Message = {
      id: uuidv4(),
      role: "assistant",
      content: "죄송합니다, 응답을 처리하는 중에 오류가 발생했습니다.",
      timestamp: new Date(),
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };
    await saveMessageToAPI(conversationId, errorMessage);
    if (onResponseComplete) {
      onResponseComplete(errorMessage);
    }
    return errorMessage;
  }
}

// HTTP 스트리밍을 통한 메시지 전송 및 응답 처리
export async function sendMessage(
  message: string,
  onChunkReceived?: (chunkText: string) => void,
  onResponseComplete?: (message: Message) => void
): Promise<Message> {
  const conversationId = await ensureConversationId();

  const userMessage: Message = {
    id: uuidv4(),
    role: "user",
    content: message,
    timestamp: new Date(),
  };
  await saveMessageToAPI(conversationId, userMessage);

  return handleApiCall(
    conversationId,
    {
      user_id: 1, // Note: This is hardcoded
      thread_id: conversationId,
      message: message,
      human_feedback: null,
    },
    onChunkReceived,
    onResponseComplete
  );
}

// HTTP 스트리밍을 통한 피드백 전송
export async function sendFeedback(
  originalMessage: string,
  humanFeedback: boolean,
  onChunkReceived?: (chunkText: string) => void,
  onResponseComplete?: (message: Message) => void
): Promise<Message> {
  const conversationId = await ensureConversationId();

  const userResponseMessage: Message = {
    id: uuidv4(),
    role: "user",
    content: humanFeedback ? "예, 진행합니다" : "아니오",
    timestamp: new Date(),
  };
  await saveMessageToAPI(conversationId, userResponseMessage);
  if (onResponseComplete) {
    onResponseComplete(userResponseMessage);
  }

  return handleApiCall(
    conversationId,
    {
      user_id: 1, // Note: This is hardcoded
      thread_id: conversationId,
      message: originalMessage,
      human_feedback: humanFeedback,
    },
    onChunkReceived,
    onResponseComplete
  );
}

// 채팅 기록 불러오기
export async function loadChatHistory(): Promise<Message[]> {
  try {
    const conversationId = await ensureConversationId();
    if (!conversationId) {
      console.error("대화 ID를 찾을 수 없습니다.");
      return [];
    }

    const response = await fetch(
      `/api/conversations/${conversationId}/messages`
    );

    if (!response.ok) {
      throw new Error(`대화 메시지 로드 실패: ${response.status}`);
    }

    const messages = await response.json();
    return messages;
  } catch (error) {
    console.error("채팅 기록 불러오기 오류:", error);
    return [];
  }
}
