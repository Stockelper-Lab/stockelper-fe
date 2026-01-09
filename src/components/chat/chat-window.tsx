"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ArrowLeft, Edit2, Network, PanelRightClose, PanelRightOpen, Trash2 } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChatInput } from "./chat-input";
import { ChatMessageList } from "./chat-message-list";
import { ConversationList } from "./conversation-list";
import dynamic from "next/dynamic";

// react-force-graph-2d가 window 객체를 참조하므로 SSR 비활성화
const StockForceGraph = dynamic(
  () => import("./stock-force-graph").then((mod) => mod.StockForceGraph),
  { ssr: false }
);
import { Message } from "./types";
import { TypingTitle } from "./typing-title";
import { useChatBot } from "./use-chat";

const NETWORK_PANEL_WIDTH_STORAGE_KEY = "stockelper.chat.networkPanelWidth";

function clampNumber(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getNetworkPanelMinWidth(viewportWidth: number): number {
  // 기존 디자인( lg: 480px, xl: 560px )을 최소 폭으로 사용
  return viewportWidth >= 1280 ? 560 : 480;
}

function getNetworkPanelMaxWidth(viewportWidth: number, minWidth: number): number {
  // 너무 넓어져서 채팅 영역이 사라지는 것을 방지
  const max = Math.min(960, viewportWidth - 360);
  return Math.max(minWidth, max);
}

interface ChatWindowProps {
  conversationId?: string;
  showChatList?: boolean;
  initialMessages?: Message[];
  initialHasMore?: boolean;
  initialTotalCount?: number;
}

// 채팅 메시지 스켈레톤
function ChatMessageSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* 사용자 메시지 스켈레톤 */}
      <div className="flex justify-end">
        <div className="max-w-[70%] space-y-2">
          <Skeleton className="h-4 w-48 ml-auto" />
          <Skeleton className="h-10 w-64 rounded-2xl" />
        </div>
      </div>
      {/* AI 메시지 스켈레톤 */}
      <div className="flex justify-start">
        <div className="max-w-[70%] space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-24 w-80 rounded-2xl" />
        </div>
      </div>
      {/* 사용자 메시지 스켈레톤 */}
      <div className="flex justify-end">
        <div className="max-w-[70%] space-y-2">
          <Skeleton className="h-4 w-40 ml-auto" />
          <Skeleton className="h-10 w-56 rounded-2xl" />
        </div>
      </div>
      {/* AI 메시지 스켈레톤 */}
      <div className="flex justify-start">
        <div className="max-w-[70%] space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-32 w-96 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export default function ChatWindow({
  conversationId,
  showChatList: initialShowChatList,
  initialMessages,
  initialHasMore,
  initialTotalCount,
}: ChatWindowProps) {
  const {
    messages,
    streamingMessage,
    sendMessage,
    handleFeedback,
    isLoading,
    subgraphData: latestSubgraphData,
    showChatList,
    conversations,
    currentChatTitle,
    isTitleTyping,
    startNewConversation,
    hasMore,
    isLoadingMore,
    loadMore,
    renameConversation,
    deleteConversation,
  } = useChatBot({
    conversationId,
    showChatList: initialShowChatList,
    initialMessages,
    initialHasMore,
    initialTotalCount,
  });

  // 네트워크 패널 토글 상태
  const [isNetworkOpen, setIsNetworkOpen] = useState(false);

  // 메시지 단위 서브그래프 선택(과거 응답 다시 보기)
  const [selectedSubgraphMessageId, setSelectedSubgraphMessageId] = useState<
    string | null
  >(null);

  const selectedSubgraphData = useMemo(() => {
    if (!selectedSubgraphMessageId) return null;
    const msg = messages.find((m) => m.id === selectedSubgraphMessageId);
    return msg?.subgraph ?? null;
  }, [messages, selectedSubgraphMessageId]);

  // 기본은 최신 서브그래프, 선택이 있으면 선택된 메시지의 서브그래프를 표시
  const displayedSubgraphData = selectedSubgraphData ?? latestSubgraphData;

  // 선택된 메시지가 사라졌거나(subgraph가 없거나) 유효하지 않으면 선택 해제
  useEffect(() => {
    if (!selectedSubgraphMessageId) return;
    const msg = messages.find((m) => m.id === selectedSubgraphMessageId);
    if (!msg?.subgraph || msg.subgraph.node?.length === 0) {
      setSelectedSubgraphMessageId(null);
    }
  }, [messages, selectedSubgraphMessageId]);

  const handleOpenSubgraph = useCallback((messageId: string) => {
    setSelectedSubgraphMessageId(messageId);
    setIsNetworkOpen(true);
  }, []);

  // 네트워크 패널 폭(드래그로 조절 + localStorage 저장)
  const [networkPanelMinWidth, setNetworkPanelMinWidth] = useState(480);
  const [networkPanelMaxWidth, setNetworkPanelMaxWidth] = useState(960);
  const [networkPanelWidth, setNetworkPanelWidth] = useState(480);
  const [isResizingNetworkPanel, setIsResizingNetworkPanel] = useState(false);
  const resizeStateRef = useRef<{ startX: number; startWidth: number } | null>(
    null
  );
  const hasLoadedNetworkPanelWidthRef = useRef(false);

  useEffect(() => {
    const init = () => {
      const min = getNetworkPanelMinWidth(window.innerWidth);
      const max = getNetworkPanelMaxWidth(window.innerWidth, min);
      setNetworkPanelMinWidth(min);
      setNetworkPanelMaxWidth(max);

      let initialWidth = min;
      try {
        const saved = Number(localStorage.getItem(NETWORK_PANEL_WIDTH_STORAGE_KEY));
        if (Number.isFinite(saved)) {
          initialWidth = clampNumber(saved, min, max);
        }
      } catch {
        // localStorage 접근 실패 시 기본값 사용
      }

      setNetworkPanelWidth(initialWidth);
      hasLoadedNetworkPanelWidthRef.current = true;
    };

    const handleResize = () => {
      const min = getNetworkPanelMinWidth(window.innerWidth);
      const max = getNetworkPanelMaxWidth(window.innerWidth, min);
      setNetworkPanelMinWidth(min);
      setNetworkPanelMaxWidth(max);
      setNetworkPanelWidth((prev) => clampNumber(prev, min, max));
    };

    init();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!hasLoadedNetworkPanelWidthRef.current) return;
    if (isResizingNetworkPanel) return;
    try {
      localStorage.setItem(
        NETWORK_PANEL_WIDTH_STORAGE_KEY,
        String(networkPanelWidth)
      );
    } catch {
      // localStorage 저장 실패는 무시
    }
  }, [isResizingNetworkPanel, networkPanelWidth]);

  const stopNetworkPanelResize = () => {
    resizeStateRef.current = null;
    setIsResizingNetworkPanel(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  const handleNetworkPanelResizeStart = (
    e: React.PointerEvent<HTMLDivElement>
  ) => {
    if (!isNetworkOpen) return;
    e.preventDefault();
    setIsResizingNetworkPanel(true);
    resizeStateRef.current = { startX: e.clientX, startWidth: networkPanelWidth };
    e.currentTarget.setPointerCapture(e.pointerId);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handleNetworkPanelResizeMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!resizeStateRef.current) return;
    const deltaX = e.clientX - resizeStateRef.current.startX;
    const nextWidth = clampNumber(
      resizeStateRef.current.startWidth - deltaX,
      networkPanelMinWidth,
      networkPanelMaxWidth
    );
    setNetworkPanelWidth(nextWidth);
  };

  const handleNetworkPanelResizeEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    stopNetworkPanelResize();
  };

  // 네트워크 데이터 유무 확인
  const hasNetworkData =
    displayedSubgraphData &&
    displayedSubgraphData.node &&
    displayedSubgraphData.node.length > 0;

  // 새 대화 시작 핸들러
  const handleNewChat = () => {
    startNewConversation();
  };

  // 대화방 이름 변경 핸들러
  const handleRename = async (id: string, title: string) => {
    await renameConversation(id, title);
  };

  // 대화방 삭제 핸들러
  const handleDelete = async (id: string) => {
    await deleteConversation(id);
  };

  // 초기 로딩 상태 확인 (메시지가 아직 없고 로딩 중일 때)
  const isInitialLoading = isLoading && messages.length === 0 && !streamingMessage;

  if (showChatList) {
    // 대화 목록 화면 - 전체 높이 사용
    return (
      <div className="h-full flex flex-col">
        <ConversationList
          conversations={conversations}
          isLoading={isLoading}
          onNewChat={handleNewChat}
          onRename={handleRename}
          onDelete={handleDelete}
        />
      </div>
    );
  }

  // 채팅 화면 - 네트워크 패널 토글 가능
  return (
    <div className="h-full flex">
      {/* 채팅 영역 */}
      <div className={cn(
        "flex-1 min-w-0 flex flex-col bg-zinc-50 dark:bg-zinc-900 overflow-hidden transition-all duration-300"
      )}>
        {/* 채팅 헤더 */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/50">
          <div className="flex items-center flex-1 min-w-0">
            <Link
              href="/chat"
              className="p-2 mr-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
            >
              <ArrowLeft size={18} />
            </Link>
            <h1
              className="text-sm font-semibold truncate flex-grow cursor-pointer hover:text-indigo-600 transition-colors group flex items-center gap-2"
              onClick={() => {
                if (conversationId && !isTitleTyping) {
                  const newTitle = window.prompt(
                    "대화 이름 변경",
                    currentChatTitle
                  );
                  if (newTitle && newTitle.trim()) {
                    handleRename(conversationId, newTitle.trim());
                  }
                }
              }}
              title={isTitleTyping ? "제목 생성 중..." : "클릭하여 대화 이름 변경"}
            >
              <TypingTitle
                title={currentChatTitle}
                isTyping={isTitleTyping}
              />
              {!isTitleTyping && (
                <Edit2
                  size={12}
                  className="opacity-0 group-hover:opacity-50 transition-opacity"
                />
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* 관계 네트워크 토글 버튼 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNetworkOpen(!isNetworkOpen)}
              className={cn(
                "flex items-center gap-2 transition-all",
                hasNetworkData
                  ? "bg-indigo-50 dark:bg-indigo-950/50 border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50"
                  : "text-zinc-500 dark:text-zinc-400",
                isNetworkOpen && "ring-2 ring-indigo-500 ring-offset-1"
              )}
              title={isNetworkOpen ? "관계 네트워크 닫기" : "관계 네트워크 열기"}
            >
              <Network size={16} />
              <span className="hidden sm:inline">관계 네트워크</span>
              {hasNetworkData && !isNetworkOpen && (
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
              )}
              {isNetworkOpen ? (
                <PanelRightClose size={14} className="hidden sm:inline" />
              ) : (
                <PanelRightOpen size={14} className="hidden sm:inline" />
              )}
            </Button>

            {/* 삭제 버튼 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
              onClick={() => {
                if (
                  conversationId &&
                  window.confirm("정말 이 대화를 삭제하시겠습니까?")
                ) {
                  handleDelete(conversationId);
                }
              }}
              title="대화 삭제"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>

        {/* 채팅 메시지 영역 */}
        <div className="flex-1 overflow-y-auto px-4 py-4 lg:px-6">
          {isInitialLoading ? (
            <ChatMessageSkeleton />
          ) : (
            <ChatMessageList
              messages={messages}
              streamingMessage={streamingMessage}
              onFeedback={handleFeedback}
              onOpenSubgraph={handleOpenSubgraph}
              selectedSubgraphMessageId={selectedSubgraphMessageId}
              onLoadMore={loadMore}
              hasMore={hasMore}
              isLoadingMore={isLoadingMore}
            />
          )}
        </div>

        {/* 입력 영역 */}
        <div className="border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50">
          <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
        </div>
      </div>

      {/* 패널 리사이즈 핸들 */}
      {isNetworkOpen ? (
        <div
          className={cn(
            "hidden lg:flex items-center justify-center w-3 cursor-col-resize select-none touch-none",
            isResizingNetworkPanel ? "bg-indigo-500/10" : "bg-transparent"
          )}
          role="separator"
          aria-orientation="vertical"
          aria-label="관계 네트워크 패널 크기 조절"
          onPointerDown={handleNetworkPanelResizeStart}
          onPointerMove={handleNetworkPanelResizeMove}
          onPointerUp={handleNetworkPanelResizeEnd}
          onPointerCancel={handleNetworkPanelResizeEnd}
          onLostPointerCapture={stopNetworkPanelResize}
        >
          <div
            className={cn(
              "h-full w-px bg-zinc-200 dark:bg-zinc-800",
              isResizingNetworkPanel && "bg-indigo-500"
            )}
          />
        </div>
      ) : null}

      {/* 관계 네트워크 사이드 패널 */}
      <div
        className={cn(
          "hidden lg:block h-full overflow-hidden",
          isResizingNetworkPanel
            ? "transition-none"
            : "transition-[width,opacity] duration-300",
          isNetworkOpen ? "opacity-100" : "opacity-0"
        )}
        style={{ width: isNetworkOpen ? networkPanelWidth : 0 }}
      >
        <div className="h-full w-full">
          <StockForceGraph subgraphData={displayedSubgraphData} />
        </div>
      </div>
    </div>
  );
}
