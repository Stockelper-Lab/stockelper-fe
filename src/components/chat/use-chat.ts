import { useUser } from "@/hooks/use-user";
import {
  createConversation,
  deleteConversation,
  fetchConversations,
  generateConversationTitle,
  updateConversationTitle,
} from "@/lib/api/conversations";
import {
  extractRealConversationId,
  generateTempConversationId,
} from "@/lib/api/temp-conversation";
import { ConversationInfo } from "@/lib/chat-service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import {
  sendFeedback as apiSendFeedback,
  sendMessage as apiSendMessage,
  isValidTradingAction,
} from "./chat-api";
import { Message, Subgraph, TradingAction, PROGRESS_STEP_LABELS } from "./types";

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
  initialMessages?: Message[];
  initialHasMore?: boolean;
  initialTotalCount?: number;
}

export function useChatBot(options?: ChatBotOptions) {
  const {
    conversationId: initialConversationId,
    showChatList: initialShowChatList,
    initialMessages = [],
    initialHasMore = false,
    initialTotalCount = 0,
  } = options || {};

  const [messages, setMessages] = useState<Message[]>(initialMessages);
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
  const [isTitleTyping, setIsTitleTyping] = useState(false); // 제목 타이핑 애니메이션 상태
  const [isFirstMessage, setIsFirstMessage] = useState(true); // 첫 메시지 여부
  const { user } = useUser();
  const queryClient = useQueryClient();

  // 페이지네이션 관련 상태
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  // 전체 메시지 카운트 (현재는 사용되지 않지만, 향후 UI에 표시할 수 있음)
  const [totalMessageCount, setTotalMessageCount] = useState(initialTotalCount); // eslint-disable-line @typescript-eslint/no-unused-vars
  const [, setPage] = useState(1); // page는 ref로 관리하므로 setter만 사용
  const pageRef = useRef(1); // ref로도 관리하여 최신 값 보장
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

  // 대화 목록 가져오기 - React Query 사용
  const {
    data: conversationsData,
    isLoading: conversationsLoading,
    refetch: refetchConversations,
  } = useQuery({
    queryKey: ["conversations", user?.id],
    queryFn: () => fetchConversations(user!.id),
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2분간 fresh 상태 유지
    gcTime: 1000 * 60 * 10, // 10분간 캐시 유지
  });

  // conversations 상태를 React Query 데이터로 동기화
  useEffect(() => {
    if (conversationsData) {
      setConversations(conversationsData);
    }
  }, [conversationsData]);

  // 대화 목록 로드 함수 - refetchConversations를 통해 React Query가 자동 처리
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const loadConversations = refetchConversations;

  // 대화 내용 로드 함수 - 페이지네이션 적용
  const loadMessages = useCallback(
    async (conversationId: string, loadMore = false) => {
      try {
        if (loadMore) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }

        // ref에서 최신 page 값 가져오기
        const currentPage = pageRef.current;
        const pageToLoad = loadMore ? currentPage + 1 : 1;
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
          pageRef.current = pageToLoad;
        } else {
          // 첫 번째 페이지인 경우 메시지 교체
          setMessages(newMessages);
          setPage(1);
          pageRef.current = 1;
        }

        // 더 불러올 메시지가 있는지 체크
        // API에서 반환한 hasMore를 그대로 사용하되, 메시지가 없으면 false
        const hasMoreMessages = newMessages.length > 0 && data.hasMore;
        setHasMore(hasMoreMessages);
        setTotalMessageCount(data.totalCount);

        // 서브그래프 및 거래 액션 데이터 설정 (첫 로드 시에만)
        if (!loadMore) {
          const allMessages = newMessages;

          // 마지막(최신) 서브그래프 데이터가 있으면 설정
          const lastSubgraphMsg = [...allMessages].reverse().find((msg) => msg.subgraph);
          if (lastSubgraphMsg?.subgraph) {
            setSubgraphData(lastSubgraphMsg.subgraph);
          }

          // 마지막 거래 액션 데이터가 있으면 설정
          const lastTradingActionMsg = [...allMessages].reverse().find(
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
    [limit]
  );

  // 더 많은 메시지 로드 핸들러
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && currentConversationId) {
      loadMessages(currentConversationId, true);
    }
  }, [isLoadingMore, hasMore, currentConversationId, loadMessages]);

  // 초기 메시지에서 서브그래프 및 거래 액션 데이터 설정
  useEffect(() => {
    if (initialMessages.length > 0) {
      // 마지막(최신) 서브그래프 데이터가 있으면 설정
      const lastSubgraphMsg = [...initialMessages].reverse().find((msg) => msg.subgraph);
      if (lastSubgraphMsg?.subgraph) {
        setSubgraphData(lastSubgraphMsg.subgraph);
      }

      // 마지막 거래 액션 데이터가 있으면 설정
      const lastTradingActionMsg = [...initialMessages].reverse().find(
        (msg) => msg.trading_action
      );
      if (lastTradingActionMsg?.trading_action) {
        setTradingAction(lastTradingActionMsg.trading_action);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 초기 마운트 시 한 번만 실행

  // 초기 채팅 기록 로드 (initialMessages가 없을 때만)
  useEffect(() => {
    // initialMessages가 있으면 서버에서 이미 불러왔으므로 건너뛰기
    if (initialMessages.length > 0) {
      setIsFirstMessage(false); // 기존 메시지가 있으면 첫 메시지가 아님
      return;
    }

    let isMounted = true; // 컴포넌트가 마운트되어 있는지 추적

    const fetchInitialChat = async () => {
      if (!user) return; // user가 없으면 실행하지 않음

      try {
        setIsLoading(true);

        // conversationId 설정
        if (initialConversationId) {
          // 외부에서 전달받은 conversationId가 있는 경우 우선 사용
          if (!isMounted) return;
          setCurrentConversationId(initialConversationId);

          // 초기 메시지 로드
          await loadMessages(initialConversationId);
          if (!isMounted) return;

          // 대화 제목 가져오기
          const conversationResponse = await fetch(
            `/api/conversations?userId=${user.id}`
          );
          if (conversationResponse.ok) {
            const allConversations = await conversationResponse.json();
            const currentConversation = allConversations.find(
              (conv: ConversationInfo) => conv.id === initialConversationId
            );
            if (currentConversation && isMounted) {
              setCurrentChatTitle(currentConversation.title || "대화");
            }
          }
        } else if (typeof window !== "undefined") {
          // 외부에서 전달받은 conversationId가 없는 경우 localStorage 확인
          const storedId = localStorage.getItem("currentConversationId");
          if (storedId) {
            if (!isMounted) return;
            setCurrentConversationId(storedId);

            // 직접적으로 대화 목록 페이지에 접근했다면 대화 내용은 로드하지 않음
            if (initialShowChatList === false) {
              // 초기 메시지 로드
              await loadMessages(storedId);
              if (!isMounted) return;

              // 대화 제목 가져오기
              const conversationResponse = await fetch(
                `/api/conversations?userId=${user.id}`
              );
              if (conversationResponse.ok) {
                const allConversations = await conversationResponse.json();
                const currentConversation = allConversations.find(
                  (conv: ConversationInfo) => conv.id === storedId
                );
                if (currentConversation && isMounted) {
                  setCurrentChatTitle(currentConversation.title || "대화");
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("채팅 기록 로드 중 오류 발생:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (user) {
      fetchInitialChat();
      // loadConversations는 React Query가 자동으로 처리
    }

    return () => {
      isMounted = false; // 컴포넌트 언마운트 시 플래그 설정
    };
  }, [initialConversationId, initialShowChatList, user, initialMessages.length, loadMessages]); // loadMessages를 의존성에 추가

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
        const feedbackStreamingMessageId = `streaming-feedback-${Date.now().toString()}`;
        const waitingMessage: Message = {
          id: feedbackStreamingMessageId,
          role: "assistant",
          content: "피드백 처리 중...",
          timestamp: new Date(),
        };
        setStreamingMessage(waitingMessage);

        await apiSendFeedback(
          lastQuestionSentToAPI, // API에는 원래 질문의 컨텐츠를 보내야 할 수 있음
          feedback,
          user!.id,
          (chunkText: string) => {
            // 실시간으로 스트리밍 메시지 업데이트 - 각 토큰마다 즉시 렌더링
            // flushSync로 React 배치 업데이트를 우회하여 즉시 화면에 반영
            flushSync(() => {
              setStreamingMessage({
                id: feedbackStreamingMessageId,
                role: "assistant",
                content: chunkText,
                timestamp: new Date(),
                progressStep: null,
              });
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
          },
          // Progress 콜백
          (step: string, status: "start" | "end") => {
            if (status === "start") {
              const progressLabel = PROGRESS_STEP_LABELS[step] || step;
              flushSync(() => {
                setStreamingMessage((prev) => ({
                  id: prev?.id || feedbackStreamingMessageId,
                  role: "assistant",
                  content: prev?.content || "",
                  timestamp: prev?.timestamp || new Date(),
                  progressStep: progressLabel,
                }));
              });
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
    [lastQuestionSentToAPI, getConversationId, user]
  );

  // 메시지 전송 처리
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      if (!user?.id) return;

      const conversationId = currentConversationId;
      if (!conversationId) return;

      // 첫 메시지인지 확인 (로컬 스토리지 또는 상태)
      const isNew =
        isFirstMessage ||
        (typeof window !== "undefined" &&
          localStorage.getItem("isNewConversation") === "true");

      // 첫 메시지일 경우: DB에 대화방 등록
      if (isNew) {
        try {
          await createConversation(user.id, conversationId, "새 대화");

          // 새 대화 플래그 제거
          if (typeof window !== "undefined") {
            localStorage.removeItem("isNewConversation");
          }
          setIsFirstMessage(false);

          // 대화 목록 캐시 무효화
          queryClient.invalidateQueries({
            queryKey: ["conversations", user.id],
          });
        } catch (error) {
          // 이미 존재하는 대화방이면 (409 Conflict) 무시
          if (
            error instanceof Error &&
            !error.message.includes("409")
          ) {
            console.error("대화방 생성 실패:", error);
          }
        }
      }

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

      // 스트리밍 메시지 ID를 고정하여 실시간 업데이트가 부드럽게 작동하도록 함
      const streamingMessageId = `streaming-${Date.now().toString()}`;
      const waitingMessage: Message = {
        id: streamingMessageId,
        role: "assistant",
        content: "응답 생성 중...",
        timestamp: new Date(),
      };
      setStreamingMessage(waitingMessage);

      // 첫 메시지인 경우 제목 생성 (비동기로 진행)
      if (isNew) {
        setIsTitleTyping(true);
        generateConversationTitle(
          conversationId,
          content,
          (token: string) => {
            // 토큰별로 제목 업데이트 (타이핑 효과)
            setCurrentChatTitle((prev) =>
              prev === "새 대화" ? token : prev + token
            );
          },
          (finalTitle: string) => {
            // 최종 제목 설정
            setCurrentChatTitle(finalTitle);
            setIsTitleTyping(false);

            // 대화 목록 캐시 무효화
            queryClient.invalidateQueries({
              queryKey: ["conversations", user.id],
            });
          }
        ).catch((error) => {
          console.error("제목 생성 실패:", error);
          setIsTitleTyping(false);
          // fallback: 첫 메시지로 제목 설정
          const fallbackTitle =
            content.length > 30 ? content.substring(0, 30) + "..." : content;
          setCurrentChatTitle(fallbackTitle);
        });
      }

      // 현재 진행 상태를 추적하는 변수
      let currentProgressStep: string | null = null;

      try {
        await apiSendMessage(
          content,
          user.id,
          (chunkText: string) => {
            // 실시간으로 스트리밍 메시지 업데이트 - 각 토큰마다 즉시 렌더링
            // flushSync로 React 배치 업데이트를 우회하여 즉시 화면에 반영
            flushSync(() => {
              setStreamingMessage({
                id: streamingMessageId,
                role: "assistant",
                content: chunkText,
                timestamp: new Date(),
                progressStep: null, // 텍스트가 오면 progress 표시 제거
              });
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
          },
          // Progress 콜백 - 분석 단계 업데이트
          (step: string, status: "start" | "end") => {
            if (status === "start") {
              currentProgressStep = step;
              // 진행 상태를 스트리밍 메시지에 반영
              const progressLabel = PROGRESS_STEP_LABELS[step] || step;
              flushSync(() => {
                setStreamingMessage((prev) => ({
                  id: prev?.id || streamingMessageId,
                  role: "assistant",
                  content: prev?.content || "",
                  timestamp: prev?.timestamp || new Date(),
                  progressStep: progressLabel,
                }));
              });
            } else if (status === "end" && currentProgressStep === step) {
              currentProgressStep = null;
              flushSync(() => {
                setStreamingMessage((prev) => {
                  if (!prev) return prev;
                  return {
                    ...prev,
                    progressStep: null,
                  };
                });
              });
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
    [user, currentConversationId, isFirstMessage, queryClient]
  );

  // 새 대화 시작하기 - DB에 저장하지 않고 임시 ID만 발급
  const startNewConversation = useCallback(
    async () => {
      // 임시 대화 ID 생성 (DB 저장 안함)
      const tempId = generateTempConversationId();
      const realId = extractRealConversationId(tempId);

      // 상태 초기화
      setCurrentConversationId(realId);
      setCurrentChatTitle("새 대화");
      setMessages([]);
      setSubgraphData(null);
      setTradingAction(null);
      setIsFirstMessage(true);

      // 로컬 스토리지에 임시 대화 ID 저장
      if (typeof window !== "undefined") {
        localStorage.setItem("currentConversationId", realId);
        localStorage.setItem("isNewConversation", "true"); // 새 대화 표시
      }

      // 페이지 이동
      window.location.href = `/chat/${realId}`;

      return realId;
    },
    []
  );

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

  // 대화방 이름 변경 mutation
  const updateConversationTitleMutation = useMutation({
    mutationFn: ({
      conversationId,
      title,
    }: {
      conversationId: string;
      title: string;
    }) => updateConversationTitle(conversationId, title),
    onSuccess: (updatedConversation, variables) => {
      // 대화 목록 캐시 무효화 및 리프레시
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });

      // 현재 대화방인 경우 제목도 업데이트
      if (variables.conversationId === currentConversationId) {
        setCurrentChatTitle(updatedConversation.title);
      }
    },
  });

  // 대화방 이름 변경
  const renameConversation = useCallback(
    async (conversationId: string, newTitle: string) => {
      try {
        setIsLoading(true);
        const updatedConversation =
          await updateConversationTitleMutation.mutateAsync({
            conversationId,
            title: newTitle,
          });
        return updatedConversation;
      } catch (error) {
        console.error("대화방 이름 변경 중 오류 발생:", error);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [updateConversationTitleMutation]
  );

  // 대화방 삭제 mutation
  const deleteConversationMutation = useMutation({
    mutationFn: (conversationId: string) => deleteConversation(conversationId),
    onSuccess: (_, conversationId) => {
      // 대화 목록 캐시 무효화 및 리프레시
      queryClient.invalidateQueries({ queryKey: ["conversations", user?.id] });

      // 삭제된 대화방이 현재 보고 있는 대화방인 경우 목록으로 돌아가기
      if (conversationId === currentConversationId) {
        backToConversationList();
      }
    },
  });

  // 대화방 삭제
  const deleteConversationHandler = useCallback(
    async (conversationId: string) => {
      try {
        setIsLoading(true);
        await deleteConversationMutation.mutateAsync(conversationId);
        return true;
      } catch (error) {
        console.error("대화방 삭제 중 오류 발생:", error);
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [deleteConversationMutation]
  );

  return {
    messages,
    streamingMessage,
    sendMessage,
    handleFeedback,
    isLoading: isLoading || conversationsLoading,
    graphData,
    subgraphData,
    stockInfo,
    tradingAction,
    showChatList,
    conversations,
    currentChatTitle,
    isTitleTyping,
    startNewConversation,
    selectConversation,
    backToConversationList,
    renameConversation,
    deleteConversation: deleteConversationHandler,
    // 무한 스크롤 관련 속성 추가
    hasMore,
    isLoadingMore,
    loadMore: handleLoadMore,
  };
}
