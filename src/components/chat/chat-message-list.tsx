"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "./chat-message";
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
      <div className="max-w-md p-8">
        <p className="text-lg font-bold text-zinc-800 dark:text-zinc-200">
          STOCKELPER AI 어시스턴트
        </p>
        <p className="text-sm mt-2 text-zinc-500 dark:text-zinc-400">
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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const previousMessagesLengthRef = useRef<number>(0);
  const isLoadingMoreRef = useRef<boolean>(false);
  const [shouldScrollToBottom, setShouldScrollToBottom] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const userHasScrolledRef = useRef(false);

  // isLoadingMore 값을 ref에 저장
  useEffect(() => {
    isLoadingMoreRef.current = isLoadingMore;
  }, [isLoadingMore]);

  // 스크롤 이벤트 감지 로직 추가
  useEffect(() => {
    const container = containerRef.current?.parentElement;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      // 스크롤이 바닥에서 100px 이내인 경우 자동 스크롤 활성화
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShouldScrollToBottom(isNearBottom);

      // 사용자가 스크롤했는지 여부 추적
      if (!isNearBottom) {
        userHasScrolledRef.current = true;
      } else {
        userHasScrolledRef.current = false;
      }
    };

    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, []);

  // 무한 스크롤을 위한 Intersection Observer 설정
  useEffect(() => {
    // 기존 observer 해제
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 더 불러올 메시지가 있고, 로딩 중이 아니고, 콜백이 존재하는 경우에만 observer 설정
    if (hasMore && !isLoadingMore && onLoadMore && loadMoreRef.current) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            onLoadMore();
          }
        },
        { threshold: 0.1 }
      );

      observerRef.current.observe(loadMoreRef.current);
    }

    // 컴포넌트 언마운트 시 observer 해제
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, isLoadingMore, onLoadMore]);

  // 메시지 자동 스크롤 - 개선된 로직
  useEffect(() => {
    // 무한 스크롤 중에는 스크롤하지 않음
    if (isLoadingMoreRef.current) return;

    // 초기 로딩이거나 메시지가 추가된 경우
    const isInitialLoad = previousMessagesLengthRef.current === 0;
    const isNewMessageAdded =
      messages.length > previousMessagesLengthRef.current;

    // 초기 로딩이거나, 새 메시지가 추가됐고 사용자가 아래쪽을 보고 있거나, 스트리밍 메시지가 있는 경우에만 스크롤
    if (
      isInitialLoad ||
      (isNewMessageAdded && shouldScrollToBottom) ||
      streamingMessage
    ) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    // 현재 메시지 수 저장
    previousMessagesLengthRef.current = messages.length;
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
    <div className="space-y-6" ref={containerRef}>
      {/* "더 불러오기" 영역 */}
      {hasMore && (
        <div ref={loadMoreRef} className="py-2 text-center">
          {isLoadingMore ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 mx-auto"></div>
          ) : (
            <div className="text-xs text-zinc-400">
              이전 메시지를 불러오려면 스크롤하세요
            </div>
          )}
        </div>
      )}

      {/* 메시지 목록 - 중복 제거된 메시지 사용 */}
      {uniqueMessages.map((message, index) => (
        <ChatMessage
          key={`${message.id}-${index}`}
          message={message}
          onFeedback={onFeedback}
        />
      ))}

      {/* 스트리밍 메시지가 있을 경우 표시 */}
      {streamingMessage && (
        <ChatMessage
          key={`streaming-${streamingMessage.id}`}
          message={streamingMessage}
        />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
