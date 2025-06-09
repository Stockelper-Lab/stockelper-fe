import { ConversationInfo } from "@/lib/chat-service";
import { useCallback, useEffect, useState } from "react";
import {
  sendFeedback as apiSendFeedback,
  sendMessage as apiSendMessage,
} from "./chat-api";
import { Message, Subgraph, TradingAction } from "./types";

// 기본 타입 - 필요에 따라 확장할 수 있음
export interface GraphData {
  // 필요한 그래프 데이터 속성 추가
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
  }[];
}

export interface StockInfo {
  name: string;
  code: string;
  price: number;
  change: number;
  changePercent: number;
  // 필요한 추가 정보
}

// 더미 데이터 (실제 API 연동 전까지 사용)
export const DUMMY_GRAPH_DATA: GraphData = {
  labels: ["1월", "2월", "3월", "4월", "5월", "6월"],
  datasets: [
    {
      label: "주가",
      data: [12, 19, 3, 5, 2, 3],
      borderColor: "rgb(75, 192, 192)",
      backgroundColor: "rgba(75, 192, 192, 0.2)",
    },
  ],
};

export const DUMMY_STOCK_INFO: StockInfo = {
  name: "삼성전자",
  code: "005930",
  price: 82400,
  change: 1200,
  changePercent: 1.48,
};

interface ChatBotOptions {
  conversationId?: string;
  showChatList?: boolean;
}

export function useChatBot(options?: ChatBotOptions) {
  const {
    conversationId: initialConversationId,
    showChatList: initialShowChatList,
  } = options || {};

  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingMessage, setStreamingMessage] = useState<Message | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [graphData] = useState<GraphData>(DUMMY_GRAPH_DATA);
  const [subgraphData, setSubgraphData] = useState<Subgraph | null>(null);
  const [stockInfo, setStockInfo] = useState<StockInfo>(DUMMY_STOCK_INFO);
  const [tradingAction, setTradingAction] = useState<TradingAction | null>(
    null
  );
  const [currentConversationId, setCurrentConversationId] = useState<
    string | null
  >(initialConversationId || null);
  const [lastQuestionSentToAPI, setLastQuestionSentToAPI] =
    useState<string>("");
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [showChatList] = useState<boolean>(
    initialShowChatList !== undefined ? initialShowChatList : true
  );
  const [currentChatTitle, setCurrentChatTitle] = useState<string>("새 대화");

  // 페이지네이션 관련 상태
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // 전체 메시지 카운트 (현재는 사용되지 않지만, 향후 UI에 표시할 수 있음)
  const [totalMessageCount, setTotalMessageCount] = useState(0); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [page, setPage] = useState(1);
  const limit = 10; // 한 번에 로드할 메시지 수

  // 대화 ID 가져오기
  const getConversationId = useCallback(() => {
    // 브라우저에서만 실행
    if (typeof window !== "undefined" && !currentConversationId) {
      const storedId = localStorage.getItem("currentConversationId");
      if (storedId) {
        setCurrentConversationId(storedId);
        return storedId;
      }
    }
    return currentConversationId;
  }, [currentConversationId]);

  // 대화 목록 가져오기
  const loadConversations = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/conversations");

      if (!response.ok) {
        throw new Error(`대화 목록 로드 실패: ${response.status}`);
      }

      const result = await response.json();
      setConversations(result);
    } catch (error) {
      console.error("대화 목록 로드 중 오류 발생:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 대화 내용 로드 함수 - 페이지네이션 적용
  const loadMessages = useCallback(
    async (conversationId: string, loadMore = false) => {
      try {
        if (loadMore) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        const pageToLoad = loadMore ? page + 1 : 1;
        const response = await fetch(
          `/api/conversations/${conversationId}/messages?limit=${limit}&page=${pageToLoad}`
        );

        if (!response.ok) {
          throw new Error(`대화 메시지 로드 실패: ${response.status}`);
        }

        const data = await response.json();
        const newMessages = data.messages;

        if (loadMore) {
          // 무한 스크롤시 새로 로드한 메시지를 기존 메시지 앞에 추가 (중복 방지)
          setMessages((prevMessages) => {
            // 이미 로드된 메시지 ID를 Set으로 추적
            const existingIds = new Set(
              prevMessages.map((msg: Message) => msg.id)
            );

            // 중복되지 않은 새 메시지만 필터링
            const uniqueNewMessages = newMessages.filter(
              (msg: Message) => !existingIds.has(msg.id)
            );

            // 새 과거 메시지를 기존 메시지의 앞쪽에 추가
            // API가 오래된 메시지부터 최신 메시지 순으로 정렬하여 반환하므로 그대로 앞에 추가
            return [...uniqueNewMessages, ...prevMessages];
          });
          setPage(pageToLoad);
        } else {
          // 첫 번째 페이지인 경우 메시지 교체
          setMessages(newMessages);
          setPage(1);
        }

        // 더 불러올 메시지가 있는지 체크
        setHasMore(data.hasMore);
        setTotalMessageCount(data.totalCount);

        // 서브그래프 및 거래 액션 데이터 설정 (첫 로드 시에만)
        if (!loadMore) {
          const allMessages = newMessages;

          // 마지막 서브그래프 데이터가 있으면 설정
          const lastSubgraphMsg = [...allMessages].find((msg) => msg.subgraph);
          if (lastSubgraphMsg?.subgraph) {
            setSubgraphData(lastSubgraphMsg.subgraph);
          }

          // 마지막 거래 액션 데이터가 있으면 설정
          const lastTradingActionMsg = [...allMessages].find(
            (msg) => msg.trading_action
          );
          if (lastTradingActionMsg?.trading_action) {
            setTradingAction(lastTradingActionMsg.trading_action);
          }
        }

        return newMessages;
      } catch (error) {
        console.error("메시지 로드 중 오류 발생:", error);
        return [];
      } finally {
        if (loadMore) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [page, limit]
  );

  // 더 많은 메시지 로드 핸들러
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && currentConversationId) {
      loadMessages(currentConversationId, true);
    }
  }, [isLoadingMore, hasMore, currentConversationId, loadMessages]);

  // 초기 채팅 기록 로드
  useEffect(() => {
    const fetchInitialChat = async () => {
      try {
        setIsLoading(true);

        // conversationId 설정
        if (initialConversationId) {
          // 외부에서 전달받은 conversationId가 있는 경우 우선 사용
          setCurrentConversationId(initialConversationId);

          // 초기 메시지 로드
          await loadMessages(initialConversationId);

          // 대화 제목 가져오기
          const conversationResponse = await fetch(`/api/conversations`);
          if (conversationResponse.ok) {
            const allConversations = await conversationResponse.json();
            const currentConversation = allConversations.find(
              (conv: ConversationInfo) => conv.id === initialConversationId
            );
            if (currentConversation) {
              setCurrentChatTitle(currentConversation.title || "대화");
            }
          }
        } else if (typeof window !== "undefined") {
          // 외부에서 전달받은 conversationId가 없는 경우 localStorage 확인
          const storedId = localStorage.getItem("currentConversationId");
          if (storedId) {
            setCurrentConversationId(storedId);

            // 직접적으로 대화 목록 페이지에 접근했다면 대화 내용은 로드하지 않음
            if (initialShowChatList === false) {
              // 초기 메시지 로드
              await loadMessages(storedId);

              // 대화 제목 가져오기
              const conversationResponse = await fetch(`/api/conversations`);
              if (conversationResponse.ok) {
                const allConversations = await conversationResponse.json();
                const currentConversation = allConversations.find(
                  (conv: ConversationInfo) => conv.id === storedId
                );
                if (currentConversation) {
                  setCurrentChatTitle(currentConversation.title || "대화");
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("채팅 기록 로드 중 오류 발생:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialChat();
    loadConversations();
  }, [initialConversationId, initialShowChatList, loadMessages]);

  // 피드백 처리 함수
  const handleFeedback = useCallback(
    async (messageId: string, feedback: boolean) => {
      // 피드백을 받은 질문 메시지 업데이트 (UI에서만)
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.id === messageId && msg.role === "question"
            ? { ...msg, feedbackResponse: feedback, role: "assistant" } // Update feedback and role to prevent re-triggering buttons
            : msg
        )
      );

      if (!lastQuestionSentToAPI) {
        console.error("피드백을 위한 이전 질문을 찾을 수 없습니다.");
        // 사용자에게 오류 메시지 표시
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content:
            "죄송합니다, 피드백을 처리하는 중 이전 질문 정보를 찾지 못했습니다.",
          timestamp: new Date(),
          error: "Original question context for feedback not found",
        };
        setMessages((prev) => [...prev, errorMessage]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        // conversationId 가져오기
        const conversationId = getConversationId();
        if (!conversationId) {
          throw new Error("대화 ID를 찾을 수 없습니다.");
        }

        // DB에 피드백 저장 (API 호출로 변경)
        await fetch(`/api/conversations/${conversationId}/feedback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ messageId, feedback }),
        });

        // API 호출을 위한 대기 메시지
        const waitingMessage: Message = {
          id: `waiting-feedback-${Date.now().toString()}`,
          role: "assistant",
          content: "피드백 처리 중...",
          timestamp: new Date(),
        };
        setStreamingMessage(waitingMessage);

        await apiSendFeedback(
          lastQuestionSentToAPI, // API에는 원래 질문의 컨텐츠를 보내야 할 수 있음
          feedback,
          (chunkText: string) => {
            setStreamingMessage((prev) => {
              if (!prev) return null;
              return { ...prev, content: chunkText };
            });
          },
          (finalMessage: Message) => {
            setMessages((prev) => [...prev, finalMessage]);
            setStreamingMessage(null);
            if (finalMessage.subgraph) {
              setSubgraphData(finalMessage.subgraph);
            }
            if (finalMessage.trading_action) {
              setTradingAction(finalMessage.trading_action);
            }
          }
        );
      } catch (error) {
        console.error("피드백 전송 중 오류 발생:", error);
        setStreamingMessage(null);
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "죄송합니다, 피드백을 처리하는 중에 오류가 발생했습니다.",
          timestamp: new Date(),
          error:
            error instanceof Error
              ? error.message
              : "Unknown error during feedback",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [lastQuestionSentToAPI, getConversationId]
  );

  // 메시지 전송 처리
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;

      // 사용자 메시지는 API에서 저장하므로 여기서는 UI에만 추가
      const userMessage: Message = {
        id: Date.now().toString(), // 임시 ID (실제 메시지는 API에서 UUID로 저장)
        role: "user",
        content,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      setLastQuestionSentToAPI(content); // Store the original user question for feedback context

      const waitingMessage: Message = {
        id: `waiting-${Date.now().toString()}`,
        role: "assistant",
        content: "응답 생성 중...",
        timestamp: new Date(),
      };
      setStreamingMessage(waitingMessage);

      try {
        await apiSendMessage(
          content,
          (chunkText: string) => {
            setStreamingMessage((prev) => {
              if (!prev) return null;
              return { ...prev, content: chunkText };
            });
          },
          (finalMessage: Message) => {
            setMessages((prev) => [...prev, finalMessage]);
            setStreamingMessage(null);

            if (finalMessage.subgraph) {
              setSubgraphData(finalMessage.subgraph);
            }

            // trading_action 유효성 검증 강화
            if (
              finalMessage.trading_action &&
              isValidTradingAction(finalMessage.trading_action)
            ) {
              setTradingAction(finalMessage.trading_action);

              if (finalMessage.trading_action.stock_code) {
                setStockInfo({
                  name: "종목명",
                  code: finalMessage.trading_action.stock_code,
                  price: finalMessage.trading_action.order_price || 0,
                  change: 0,
                  changePercent: 0,
                });
              }
            } else if (finalMessage.trading_action) {
              console.warn(
                "유효하지 않은 trading_action이 감지되었습니다:",
                finalMessage.trading_action
              );
            }
          }
        );
      } catch (error) {
        console.error("메시지 전송 중 오류 발생:", error);
        setStreamingMessage(null);
        const errorMessage: Message = {
          id: Date.now().toString(),
          role: "assistant",
          content: "죄송합니다, 응답을 처리하는 중에 오류가 발생했습니다.",
          timestamp: new Date(),
          error:
            error instanceof Error
              ? error.message
              : "Unknown error during send",
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [] // messages는 디펜던시로 필요하지 않음
  );

  // trading_action의 유효성 검증 함수
  const isValidTradingAction = (action: TradingAction): boolean => {
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
  };

  // 새 대화 시작하기
  const startNewConversation = useCallback(async () => {
    try {
      setIsLoading(true);
      // 새 대화 생성 (API 호출로 변경)
      const response = await fetch("/api/conversations", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`대화 생성 실패: ${response.status}`);
      }

      const newConversation = await response.json();

      // 상태 업데이트
      setCurrentConversationId(newConversation.id);
      setCurrentChatTitle(newConversation.title || "새 대화");
      setMessages([]);
      setSubgraphData(null);
      setTradingAction(null);

      // 로컬 스토리지에 대화 ID 저장
      if (typeof window !== "undefined") {
        localStorage.setItem("currentConversationId", newConversation.id);
      }

      // 페이지 이동
      window.location.href = `/chat/${newConversation.id}`;

      return newConversation.id;
    } catch (error) {
      console.error("새 대화 생성 중 오류 발생:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 특정 대화 선택하기 (이제는 직접 이동만 처리)
  const selectConversation = useCallback((conversationId: string) => {
    // 특정 대화 선택 시 해당 URL로 이동
    window.location.href = `/chat/${conversationId}`;
  }, []);

  // 대화 목록으로 돌아가기
  const backToConversationList = useCallback(() => {
    // 대화 목록 페이지로 이동
    window.location.href = "/chat";
  }, []);

  // 대화방 이름 변경
  const renameConversation = useCallback(
    async (conversationId: string, newTitle: string) => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/conversations/${conversationId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title: newTitle }),
        });

        if (!response.ok) {
          throw new Error(`대화방 이름 변경 실패: ${response.status}`);
        }

        const updatedConversation = await response.json();

        // 대화 목록 새로고침
        await loadConversations();

        // 현재 대화방인 경우 제목도 업데이트
        if (conversationId === currentConversationId) {
          setCurrentChatTitle(updatedConversation.title);
        }

        return updatedConversation;
      } catch (error) {
        console.error("대화방 이름 변경 중 오류 발생:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [currentConversationId, loadConversations]
  );

  // 대화방 삭제
  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/conversations/${conversationId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error(`대화방 삭제 실패: ${response.status}`);
        }

        // 대화 목록 새로고침
        await loadConversations();

        // 삭제된 대화방이 현재 보고 있는 대화방인 경우 목록으로 돌아가기
        if (conversationId === currentConversationId) {
          backToConversationList();
        }

        return true;
      } catch (error) {
        console.error("대화방 삭제 중 오류 발생:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [currentConversationId, loadConversations, backToConversationList]
  );

  return {
    messages,
    streamingMessage,
    sendMessage,
    handleFeedback,
    isLoading,
    graphData,
    subgraphData,
    stockInfo,
    tradingAction,
    showChatList,
    conversations,
    currentChatTitle,
    startNewConversation,
    selectConversation,
    backToConversationList,
    renameConversation,
    deleteConversation,
    // 무한 스크롤 관련 속성 추가
    hasMore,
    isLoadingMore,
    loadMore: handleLoadMore,
  };
}
