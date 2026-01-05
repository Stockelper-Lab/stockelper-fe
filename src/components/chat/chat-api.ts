import { v4 as uuidv4 } from "uuid";
import { Message, Subgraph, TradingAction } from "./types";

// 현재 활성화된 대화 ID를 저장하는 변수
let currentConversationId: string | null = null;

/**
 * 스트리밍 텍스트에 포맷팅을 적용하는 함수
 * LLM API에서 delta 토큰이 공백 없이 전송될 때 가독성을 위해 포맷팅 적용
 */
function formatStreamingText(text: string): string {
  let formatted = text;
  
  // 마침표, 느낌표, 물음표 뒤에 공백이 없으면 줄바꿈 추가 (문장 끝)
  // 단, 이미 줄바꿈이 있거나 숫자/괄호가 바로 오는 경우 제외
  formatted = formatted.replace(/([.!?])(?=[가-힣a-zA-Z\-"'])/g, "$1 ");
  
  // 쉼표 뒤에 공백이 없으면 공백 추가
  formatted = formatted.replace(/,(?=[가-힣a-zA-Z])/g, ", ");
  
  // 콜론 뒤에 공백이 없으면 공백 추가 (단, 시간 표기 제외)
  formatted = formatted.replace(/:(?=[가-힣a-zA-Z"'])/g, ": ");
  
  // 하이픈으로 시작하는 목록 항목 앞에 줄바꿈 추가
  // 연속된 하이픈 목록을 인식하여 줄바꿈 처리
  formatted = formatted.replace(/([^-\n])-(?=[가-힣a-zA-Z"'])/g, "$1\n- ");
  
  // 첫 번째 하이픈 목록 항목 처리 (문장 끝 뒤에 오는 경우)
  formatted = formatted.replace(/([.!?]) - /g, "$1\n- ");
  
  // 중복 공백 제거
  formatted = formatted.replace(/  +/g, " ");
  
  // 중복 줄바꿈 정리
  formatted = formatted.replace(/\n\n\n+/g, "\n\n");
  
  return formatted;
}

// API 응답 타입 정의
interface ApiResponse {
  message: string;
  subgraph?: Subgraph;
  trading_action?: TradingAction | null;
  error?: string | null;
}

// SSE 이벤트 타입 정의
interface SSEEvent {
  type: "progress" | "delta" | "final";
  token?: string;
  message?: string;
  step?: string;
  status?: string;
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
      break;
    }
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    // 각 라인을 순차적으로 처리
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine === "" || trimmedLine === "[DONE]") continue;

      // SSE 형식 파싱: "data: {...}" 형식 처리
      let jsonStr = trimmedLine;
      if (trimmedLine.startsWith("data: ")) {
        jsonStr = trimmedLine.substring(6); // "data: " 제거
      }
      
      // [DONE] 마커 처리 (data: [DONE] 형식으로 올 수 있음)
      if (jsonStr === "[DONE]") continue;

      try {
        const event = JSON.parse(jsonStr) as SSEEvent;

        // progress 이벤트는 무시 (로깅만)
        if (event.type === "progress") {
          continue;
        }

        // delta 이벤트: 토큰을 누적하여 메시지 생성
        if (event.type === "delta" && event.token !== undefined) {
          // 토큰 값을 그대로 누적
          responseText += event.token;
          
          // 실시간으로 누적된 텍스트 전달 - 각 토큰마다 즉시 호출
          if (onChunkReceived) {
            // 스트리밍 중에도 포맷팅을 적용하여 전달
            const formattedText = formatStreamingText(responseText);
            onChunkReceived(formattedText);
            // 각 토큰마다 약간의 지연을 주어 UI가 업데이트될 시간을 확보
            await new Promise(resolve => setTimeout(resolve, 0));
          }

          // 임시 메시지 업데이트
          lastMessage = {
            id: uuidv4(),
            role: "assistant",
            content: responseText,
            timestamp: new Date(),
          };
        }

        // final 이벤트: 최종 메시지 수신
        if (event.type === "final" && event.message) {
          responseText = event.message;
          
          lastMessage = {
            id: uuidv4(),
            role: "assistant",
            content: event.message,
            timestamp: new Date(),
            ...(event.subgraph && { subgraph: event.subgraph }),
            ...(event.trading_action && {
              trading_action: event.trading_action,
            }),
            ...(event.error && { error: event.error }),
          };

          // 최종 메시지 전달
          if (onChunkReceived) {
            onChunkReceived(responseText);
          }
        }
      } catch (error) {
        // JSON 파싱 실패 시 무시 (빈 줄이나 잘못된 형식일 수 있음)
        if (trimmedLine !== "" && !trimmedLine.startsWith(":")) {
          console.warn("스트림 청크 파싱 경고:", trimmedLine, error);
        }
      }
    }
  }

  // delta 이벤트만 받고 final 이벤트를 받지 못한 경우 처리
  if (!lastMessage) {
    throw new Error("스트림에서 메시지를 수신하지 못했습니다.");
  }
  if (lastMessage.content === "" && responseText === "") {
    throw new Error("스트림에서 메시지를 수신하지 못했습니다.");
  }

  // 타입 가드: lastMessage가 null이 아님을 보장
  const finalMessage: Message = lastMessage;

  // final 이벤트를 받지 못한 경우 delta로 누적된 메시지 사용
  if (!finalMessage.subgraph && !finalMessage.trading_action) {
    finalMessage.content = responseText;
  }

  await saveMessageToAPI(conversationId, finalMessage);

  if (
    finalMessage.trading_action &&
    isValidTradingAction(finalMessage.trading_action)
  ) {
    const questionMessage: Message = {
      id: uuidv4(),
      role: "question",
      content: `이 분석 결과에 따라 ${
        finalMessage.trading_action.stock_code || "해당 종목"
      } ${finalMessage.trading_action.order_quantity || ""}주를 ${
        finalMessage.trading_action.order_side === "buy" ? "매수" : "매도"
      }하시겠습니까?`,
      timestamp: new Date(),
      feedbackResponse: null,
    };
    await saveMessageToAPI(conversationId, questionMessage);

    if (onResponseComplete) {
      onResponseComplete(finalMessage);
      setTimeout(() => onResponseComplete(questionMessage), 100);
    }
  } else if (onResponseComplete) {
    onResponseComplete(finalMessage);
  }

  return finalMessage;
}

async function handleApiCall(
  conversationId: string,
  userId: number,
  requestBody: Record<string, unknown>,
  onChunkReceived?: (chunkText: string) => void,
  onResponseComplete?: (message: Message) => void
): Promise<Message> {
  try {
    // Next 서버 API를 통해 LLM과 통신
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ...requestBody, user_id: userId }),
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
  userId: number,
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
    userId,
    {
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
  userId: number,
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
    userId,
    {
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
