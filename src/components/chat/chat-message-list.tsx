"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChatMessage } from "./chat-message";
import { StreamingMessage } from "./streaming-message";
import { Message } from "./types";

interface ChatMessageListProps {
  messages: Message[];
  streamingMessage: Message | null;
  onFeedback?: (messageId: string, feedback: boolean) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
}

export function ChatEmptyState() {
  return (
    <div className="flex h-full items-center justify-center text-center">
      <div className="max-w-md p-6">
        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
          STOCKELPER AI 어시스턴트
        </p>
        <p className="text-xs mt-1.5 text-zinc-500 dark:text-zinc-400">
          주식 투자에 관한 질문을 해보세요. 최신 투자 정보를 LLM을 통해 빠르게
          받아보세요.
        </p>
      </div>
    </div>
  );
}

export function ChatMessageList({
  messages,
  streamingMessage,
  onFeedback,
  onLoadMore,
  hasMore = false,
  isLoadingMore = false,
}: ChatMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const loadMoreTriggerRef = useRef<HTMLDivElement>(null);
  const previousMessagesLengthRef = useRef<number>(0);
  const previousFirstMessageIdRef = useRef<string | null>(null);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const firstMessageRef = useRef<HTMLDivElement | null>(null);
  const hasScrolledToBottomRef = useRef<boolean>(false);
  const [isInitialScrollComplete, setIsInitialScrollComplete] = useState(false);
  
  // 스크롤 위치 복원을 위한 상태
  const scrollHeightBeforeLoadRef = useRef<number>(0);
  const scrollTopBeforeLoadRef = useRef<number>(0);
  const wasLoadingMoreRef = useRef<boolean>(false);
  const isLoadingMoreRef = useRef<boolean>(false);
  const isLoadMoreTriggeredRef = useRef<boolean>(false);
  const hasMoreRef = useRef<boolean>(false);
  const onLoadMoreRef = useRef<typeof onLoadMore | undefined>(undefined);

  // 초기 마운트 시 메시지가 있으면 맨 아래로 스크롤
  useEffect(() => {
    if (messages.length > 0 && !hasScrolledToBottomRef.current) {
      const container = containerRef.current?.parentElement;
      if (container) {
        const scrollToBottom = () => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                container.scrollTop = container.scrollHeight;
                hasScrolledToBottomRef.current = true;
                setIsInitialScrollComplete(true);
              });
            });
          });
        };
        
        setTimeout(scrollToBottom, 100);
      }
    }
  }, [messages.length]);

  // 스크롤 이벤트 감지 및 무한 스크롤 트리거
  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;
    
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldScrollToBottom(isNearBottom);

      // 스크롤이 전체의 20% 이하일 때 이전 메시지 로드 (초기 스크롤 완료 후에만)
      const maxScroll = scrollHeight - clientHeight;
      
      // 안전성 체크: maxScroll이 0보다 큰 경우에만 계산
      if (maxScroll <= 0) return;
      
      const scrollPercentage = scrollTop / maxScroll;
      
      // 중복 호출 방지 및 로딩 중 체크 (ref를 사용하여 최신 값 참조)
      if (
        isInitialScrollComplete &&
        scrollPercentage < 0.2 &&
        hasMoreRef.current &&
        !isLoadingMoreRef.current &&
        !isLoadMoreTriggeredRef.current &&
        onLoadMoreRef.current
      ) {
        // 트리거 플래그 설정 (중복 호출 방지)
        isLoadMoreTriggeredRef.current = true;
        
        // 로드 전 스크롤 상태 저장
        scrollHeightBeforeLoadRef.current = scrollHeight;
        scrollTopBeforeLoadRef.current = scrollTop;
        onLoadMoreRef.current();
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [isInitialScrollComplete]); // ref를 사용하므로 의존성 배열에서 제거

  // 상태를 ref에 동기화
  useEffect(() => {
    isLoadingMoreRef.current = isLoadingMore;
    wasLoadingMoreRef.current = isLoadingMore;
    hasMoreRef.current = hasMore;
    onLoadMoreRef.current = onLoadMore;
    
    // 로딩이 완료되면 트리거 플래그 리셋 (하지만 메시지가 렌더링될 때까지 기다림)
    if (!isLoadingMore && wasLoadingMoreRef.current) {
      // 메시지가 DOM에 렌더링될 때까지 기다린 후 플래그 리셋
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          isLoadMoreTriggeredRef.current = false;
        });
      });
    }
  }, [isLoadingMore, hasMore, onLoadMore]);

  // 메시지가 위에 추가된 후 스크롤 위치 복원 (useLayoutEffect 사용)
  useLayoutEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;

    // 로딩이 완료되고, 이전 스크롤 높이가 저장되어 있으면 복원
    if (!isLoadingMore && scrollHeightBeforeLoadRef.current > 0) {
      const previousScrollHeight = scrollHeightBeforeLoadRef.current;
      const previousScrollTop = scrollTopBeforeLoadRef.current;
      const currentScrollHeight = container.scrollHeight;
      const scrollHeightDiff = currentScrollHeight - previousScrollHeight;
      
      // 스크롤 위치를 새로 추가된 메시지 높이만큼 조정
      container.scrollTop = previousScrollTop + scrollHeightDiff;
      
      // 초기화
      scrollHeightBeforeLoadRef.current = 0;
      scrollTopBeforeLoadRef.current = 0;
      
      // 스크롤 위치 복원 후 메시지가 완전히 렌더링될 때까지 기다린 후 트리거 가능하도록 설정
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            isLoadMoreTriggeredRef.current = false;
          });
        });
      });
    }
  }, [messages, isLoadingMore]);

  // 새 메시지 추가 시 스크롤 처리
  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;

    // 초기 로딩이거나 메시지가 추가된 경우
    const isInitialLoad = previousMessagesLengthRef.current === 0;
    const isNewMessageAdded = messages.length > previousMessagesLengthRef.current;
    
    // 첫 번째 메시지 ID 확인 (위에 메시지가 추가되었는지 체크)
    const currentFirstMessageId = messages.length > 0 ? messages[0].id : null;
    const isMessageAddedAtTop = 
      previousFirstMessageIdRef.current !== null &&
      currentFirstMessageId !== previousFirstMessageIdRef.current &&
      currentFirstMessageId !== null;

    // 위에 메시지가 추가된 경우 스크롤하지 않음 (useLayoutEffect에서 처리)
    if (isMessageAddedAtTop) {
      previousFirstMessageIdRef.current = currentFirstMessageId;
      previousMessagesLengthRef.current = messages.length;
      return;
    }

    // 새 메시지가 추가됐고 사용자가 아래쪽을 보고 있거나, 스트리밍 메시지가 있는 경우에만 스크롤
    if (
      (!isInitialLoad && isNewMessageAdded && shouldScrollToBottom) ||
      streamingMessage
    ) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        });
      });
    }

    // 현재 메시지 수 및 첫 번째 메시지 ID 저장
    previousMessagesLengthRef.current = messages.length;
    previousFirstMessageIdRef.current = currentFirstMessageId;
  }, [messages, streamingMessage, shouldScrollToBottom]);

  if (messages.length === 0 && !streamingMessage) {
    return <ChatEmptyState />;
  }

  // 메시지 중복 제거를 위해 Set 사용하여 고유 ID 추적
  const uniqueMessageIds = new Set<string>();
  const uniqueMessages = messages.filter((message) => {
    if (uniqueMessageIds.has(message.id)) {
      return false;
    }
    uniqueMessageIds.add(message.id);
    return true;
  });

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* 로딩 인디케이터 및 트리거 영역 */}
      {hasMore && (
        <div ref={loadMoreTriggerRef} className="py-1.5 text-center">
          {isLoadingMore ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600 mx-auto"></div>
          ) : (
            <div className="text-[10px] text-zinc-400">
              위로 스크롤하면 이전 메시지를 불러옵니다
            </div>
          )}
        </div>
      )}

      {/* 메시지 목록 - 중복 제거된 메시지 사용 */}
      {uniqueMessages.map((message, index) => (
        <div
          key={`${message.id}-${index}`}
          ref={index === 0 ? firstMessageRef : null}
        >
          <ChatMessage
            message={message}
            onFeedback={onFeedback}
          />
        </div>
      ))}

      {/* 스트리밍 메시지가 있을 경우 표시 - 진행 상태 UI 포함 */}
      {streamingMessage && (
        <StreamingMessage
          key={`streaming-${streamingMessage.id}`}
          message={streamingMessage}
        />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
