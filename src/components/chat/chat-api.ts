import process from "process";
import { v4 as uuidv4 } from "uuid";
import { Message, Subgraph, TradingAction } from "./types";

// 현재 활성화된 대화 ID를 저장하는 변수
let currentConversationId: string | null = null;

// WebSocket 응답 타입 정의
interface WebSocketResponse {
  message: string;
  subgraph?: Subgraph;
  trading_action?: TradingAction | null;
  error?: string | null;
}

// WebSocket 연결을 관리하는 클래스
class WebSocketManager {
  private static instance: WebSocketManager | null = null;
  private socket: WebSocket | null = null;
  private messageCallbacks: Map<string, (message: WebSocketResponse) => void> =
    new Map();
  private connectionPromise: Promise<WebSocket> | null = null;
  private resolveConnection: ((socket: WebSocket) => void) | null = null;
  private connectUrl: string;

  private constructor() {
    const API_ENDPOINT = process.env.NEXT_PUBLIC_LLM_ENDPOINT as string;
    // HTTP 프로토콜에 따라 WebSocket 프로토콜 결정 (http -> ws, https -> wss)
    const wsProtocol = API_ENDPOINT.startsWith("https") ? "wss" : "ws";
    const apiUrl = API_ENDPOINT.replace(/^https?:\/\//, "");
    this.connectUrl = `${wsProtocol}://${apiUrl}/ws/stock/chat`;
  }

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public async getSocket(): Promise<WebSocket> {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      return this.socket;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve) => {
      this.resolveConnection = resolve;
      this.connect();
    });

    return this.connectionPromise;
  }

  private connect() {
    if (this.socket) {
      this.socket.close();
    }

    this.socket = new WebSocket(this.connectUrl);

    this.socket.onopen = () => {
      console.log("WebSocket 연결 성공");
      if (this.resolveConnection) {
        this.resolveConnection(this.socket!);
        this.connectionPromise = null;
        this.resolveConnection = null;
      }
    };

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as WebSocketResponse;
        // 등록된 모든 콜백에 메시지 전달
        this.messageCallbacks.forEach((callback) => {
          callback(data);
        });
      } catch (error) {
        console.error("WebSocket 메시지 파싱 오류:", error);
      }
    };

    this.socket.onerror = (error) => {
      console.error("WebSocket 오류:", error);
    };

    this.socket.onclose = () => {
      console.log("WebSocket 연결 종료");
      // 연결이 끊어지면 재연결 시도 (3초 후)
      setTimeout(() => this.connect(), 3000);
    };
  }

  public registerCallback(
    id: string,
    callback: (message: WebSocketResponse) => void
  ) {
    this.messageCallbacks.set(id, callback);
  }

  public unregisterCallback(id: string) {
    this.messageCallbacks.delete(id);
  }

  public async sendMessage(message: Record<string, unknown>): Promise<void> {
    const socket = await this.getSocket();
    socket.send(JSON.stringify(message));
  }
}

// 대화 ID 초기화 함수
async function ensureConversationId(): Promise<string> {
  if (!currentConversationId) {
    // 브라우저 로컬 스토리지에서 대화 ID 가져오기 시도
    if (typeof window !== "undefined") {
      const storedId = localStorage.getItem("currentConversationId");
      if (storedId) {
        currentConversationId = storedId;
        return storedId;
      }
    }

    // 없으면 새 대화 생성 (API 호출)
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

      // 브라우저 로컬 스토리지에 저장
      if (typeof window !== "undefined") {
        localStorage.setItem("currentConversationId", newConversation.id);
      }
    } catch (error) {
      console.error("새 대화 생성 중 오류 발생:", error);
      throw error;
    }
  }

  // 이 시점에서 currentConversationId는 반드시 string이어야 함
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
function isValidTradingAction(action: TradingAction): boolean {
  // 필수 필드 검증
  if (!action.stock_code || !action.order_side) {
    return false;
  }

  // 주문 타입 검증 (buy 또는 sell만 허용)
  if (action.order_side !== "buy" && action.order_side !== "sell") {
    return false;
  }

  // 주문 수량 및 가격 검증 (숫자여야 함)
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

  // 종목 코드 형식 검증 (숫자로만 구성)
  const stockCodeRegex = /^\d+$/;
  if (!stockCodeRegex.test(action.stock_code)) {
    return false;
  }

  return true;
}

// WebSocket을 통한 메시지 전송 및 응답 처리
export async function sendMessageWebSocket(
  message: string,
  onChunkReceived?: (chunkText: string) => void,
  onResponseComplete?: (message: Message) => void
): Promise<Message> {
  // 대화 ID 확인
  const conversationId = await ensureConversationId();

  try {
    // 사용자 메시지 생성 및 DB 저장
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    // 사용자 메시지 저장
    await saveMessageToAPI(conversationId, userMessage);

    // WebSocket 연결 가져오기
    const wsManager = WebSocketManager.getInstance();

    // 현재 요청에 대한 고유 ID 생성
    const requestId = uuidv4();

    // 응답 처리를 위한 Promise 생성
    return new Promise<Message>((resolve) => {
      let responseText = "";
      let lastMessage: Message | null = null;

      // 응답 메시지 처리 콜백 등록
      wsManager.registerCallback(requestId, async (data) => {
        // 스트리밍 응답의 각 청크 처리
        if (onChunkReceived && data.message !== responseText) {
          const newContent = data.message.replace(responseText, "");
          if (newContent) {
            onChunkReceived(newContent);
            responseText = data.message;
          }
        } else {
          responseText = data.message;
        }

        // 현재 수신된 데이터로 임시 메시지 생성
        const currentMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
          ...(data.subgraph && { subgraph: data.subgraph }),
          ...(data.trading_action && { trading_action: data.trading_action }),
          ...(data.error && { error: data.error }),
        };

        // 최종 응답이 아니면 lastMessage 업데이트만 수행
        if (
          data.message === "요청을 처리 중입니다. 잠시만 기다려주세요..." ||
          data.message === "데이터 분석 중입니다..." ||
          data.message === "시장 동향을 파악하고 있습니다..." ||
          data.message === "투자 전략을 수립 중입니다..."
        ) {
          lastMessage = currentMessage;
          return;
        }

        // 최종 응답인 경우: DB에 저장하고 콜백 호출
        lastMessage = currentMessage;

        // 콜백 등록 해제
        wsManager.unregisterCallback(requestId);

        // 응답 메시지 DB에 저장
        await saveMessageToAPI(conversationId, lastMessage);

        // trading_action이 있으면 질문 메시지도 추가
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

          // 질문 메시지도 DB에 저장
          await saveMessageToAPI(conversationId, questionMessage);

          // 응답 완료 콜백에 추가 메시지 포함
          if (onResponseComplete) {
            onResponseComplete(lastMessage);
            setTimeout(() => {
              onResponseComplete(questionMessage);
            }, 100);
          }

          resolve(lastMessage);
        } else {
          // 응답 완료 콜백이 제공되었다면 호출
          if (onResponseComplete) {
            onResponseComplete(lastMessage);
          }

          resolve(lastMessage);
        }
      });

      // WebSocket으로 메시지 전송
      wsManager.sendMessage({
        user_id: 1,
        thread_id: conversationId,
        message: message,
        human_feedback: null,
        request_id: requestId,
      });
    });
  } catch (error) {
    console.error("WebSocket 메시지 전송 중 오류 발생:", error);

    // 오류가 발생해도 클라이언트에 메시지를 보냅니다
    const errorMessage: Message = {
      id: uuidv4(),
      role: "assistant",
      content: "죄송합니다, 응답을 처리하는 중에 오류가 발생했습니다.",
      timestamp: new Date(),
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };

    // 오류 메시지도 DB에 저장
    await saveMessageToAPI(conversationId, errorMessage);

    // 오류 발생 시에도 완료 콜백 호출
    if (onResponseComplete) {
      onResponseComplete(errorMessage);
    }

    return errorMessage;
  }
}

// WebSocket을 통한 피드백 전송
export async function sendFeedbackWebSocket(
  originalMessage: string,
  humanFeedback: boolean,
  onChunkReceived?: (chunkText: string) => void,
  onResponseComplete?: (message: Message) => void
): Promise<Message> {
  // 대화 ID 확인
  const conversationId = await ensureConversationId();

  try {
    // 사용자 응답 메시지 생성 및 저장
    const userResponseMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: humanFeedback ? "예, 진행합니다" : "아니오",
      timestamp: new Date(),
    };

    // 사용자 피드백 응답 메시지 저장
    await saveMessageToAPI(conversationId, userResponseMessage);

    // 사용자 피드백 응답 메시지도 UI에 표시하기 위해 콜백 호출
    if (onResponseComplete) {
      onResponseComplete(userResponseMessage);
    }

    // WebSocket 연결 가져오기
    const wsManager = WebSocketManager.getInstance();

    // 현재 요청에 대한 고유 ID 생성
    const requestId = uuidv4();

    // 응답 처리를 위한 Promise 생성
    return new Promise<Message>((resolve) => {
      let responseText = "";
      let lastMessage: Message | null = null;

      // 응답 메시지 처리 콜백 등록
      wsManager.registerCallback(requestId, async (data) => {
        // 스트리밍 응답의 각 청크 처리
        if (onChunkReceived && data.message !== responseText) {
          const newContent = data.message.replace(responseText, "");
          if (newContent) {
            onChunkReceived(newContent);
            responseText = data.message;
          }
        } else {
          responseText = data.message;
        }

        // 현재 수신된 데이터로 임시 메시지 생성
        const currentMessage: Message = {
          id: uuidv4(),
          role: "assistant",
          content: data.message,
          timestamp: new Date(),
          ...(data.subgraph && { subgraph: data.subgraph }),
          ...(data.trading_action && { trading_action: data.trading_action }),
          ...(data.error && { error: data.error }),
        };

        // 최종 응답이 아니면 lastMessage 업데이트만 수행
        if (
          data.message === "요청을 처리 중입니다. 잠시만 기다려주세요..." ||
          data.message === "데이터 분석 중입니다..." ||
          data.message === "시장 동향을 파악하고 있습니다..." ||
          data.message === "투자 전략을 수립 중입니다..."
        ) {
          lastMessage = currentMessage;
          return;
        }

        // 최종 응답인 경우: DB에 저장하고 콜백 호출
        lastMessage = currentMessage;

        // 콜백 등록 해제
        wsManager.unregisterCallback(requestId);

        // 응답 메시지 DB에 저장
        await saveMessageToAPI(conversationId, lastMessage);

        // trading_action이 있으면 질문 메시지도 추가
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

          // 질문 메시지도 DB에 저장
          await saveMessageToAPI(conversationId, questionMessage);

          // 응답 완료 콜백에 추가 메시지 포함
          if (onResponseComplete) {
            onResponseComplete(lastMessage);
            setTimeout(() => {
              onResponseComplete(questionMessage);
            }, 100);
          }

          resolve(lastMessage);
        } else {
          // 응답 완료 콜백이 제공되었다면 호출
          if (onResponseComplete) {
            onResponseComplete(lastMessage);
          }

          resolve(lastMessage);
        }
      });

      // WebSocket으로 피드백 전송
      wsManager.sendMessage({
        user_id: 1,
        thread_id: conversationId,
        message: originalMessage,
        human_feedback: humanFeedback,
        request_id: requestId,
      });
    });
  } catch (error) {
    console.error("WebSocket 피드백 전송 중 오류 발생:", error);

    // 오류가 발생해도 클라이언트에 메시지를 보냅니다
    const errorMessage: Message = {
      id: uuidv4(),
      role: "assistant",
      content: "죄송합니다, 응답을 처리하는 중에 오류가 발생했습니다.",
      timestamp: new Date(),
      error: error instanceof Error ? error.message : "알 수 없는 오류",
    };

    // 오류 메시지도 DB에 저장
    await saveMessageToAPI(conversationId, errorMessage);

    // 오류 발생 시에도 완료 콜백 호출
    if (onResponseComplete) {
      onResponseComplete(errorMessage);
    }

    return errorMessage;
  }
}

// 기존 HTTP 메서드를 WebSocket 메서드로 대체(하위 호환성 위해 유지)
export async function sendMessage(
  message: string,
  onChunkReceived?: (chunkText: string) => void,
  onResponseComplete?: (message: Message) => void
): Promise<Message> {
  return sendMessageWebSocket(message, onChunkReceived, onResponseComplete);
}

// 기존 HTTP 피드백 메서드를 WebSocket 메서드로 대체(하위 호환성 위해 유지)
export async function sendFeedback(
  originalMessage: string,
  humanFeedback: boolean,
  onChunkReceived?: (chunkText: string) => void,
  onResponseComplete?: (message: Message) => void
): Promise<Message> {
  return sendFeedbackWebSocket(
    originalMessage,
    humanFeedback,
    onChunkReceived,
    onResponseComplete
  );
}

// 채팅 기록 불러오기
export async function loadChatHistory(): Promise<Message[]> {
  try {
    // 현재 대화 ID 확인
    const conversationId = await ensureConversationId();
    if (!conversationId) {
      console.error("대화 ID를 찾을 수 없습니다.");
      return [];
    }

    // API를 통해 메시지 목록 조회
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
