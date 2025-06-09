"use client";

import { StockChart } from "@/components/chat/stock-chart";
import { Button } from "@/components/ui/button";
import { ConversationInfo } from "@/lib/chat-service";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { ArrowLeft, Edit2, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { ChatInput } from "./chat-input";
import { ChatMessageList } from "./chat-message-list";
import { useChatBot } from "./use-chat";

// 대화 목록 컴포넌트
const ConversationList = ({
  conversations,
  isLoading,
  onNewChat,
  onRename,
  onDelete,
}: {
  conversations: ConversationInfo[];
  isLoading: boolean;
  onNewChat: () => void;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState<string>("");

  // 이름 변경 모드 시작
  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setNewTitle(currentTitle);
  };

  // 이름 변경 저장
  const saveTitle = async (id: string) => {
    if (newTitle.trim()) {
      await onRename(id, newTitle.trim());
    }
    setEditingId(null);
  };

  // 삭제 확인
  const confirmDelete = async (id: string) => {
    if (window.confirm("정말 이 대화를 삭제하시겠습니까?")) {
      await onDelete(id);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-50 dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-xl font-semibold">대화 목록</h1>
      </div>

      <div className="p-4">
        <Button
          onClick={onNewChat}
          className="w-full mb-4 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus size={18} />
          <span>새로운 대화</span>
        </Button>
      </div>

      <div className="overflow-y-auto flex-grow p-4 pt-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
            <p>대화 내역이 없습니다.</p>
            <p className="text-sm mt-2">새로운 대화를 시작해보세요.</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {conversations.map((conversation) => (
              <li key={conversation.id} className="group">
                {editingId === conversation.id ? (
                  // 이름 편집 모드
                  <div className="w-full p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="flex-grow bg-transparent border-none focus:outline-none focus:ring-0 text-sm"
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          saveTitle(conversation.id);
                        }
                        if (e.key === "Escape") {
                          setEditingId(null);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      onClick={() => saveTitle(conversation.id)}
                      className="ml-2 px-2 h-7 bg-indigo-600 hover:bg-indigo-700"
                    >
                      저장
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setEditingId(null)}
                      className="ml-1 px-2 h-7"
                    >
                      취소
                    </Button>
                  </div>
                ) : (
                  // 일반 표시 모드
                  <div className="flex w-full items-center">
                    <a
                      href={`/chat/${conversation.id}`}
                      className="flex-grow text-left p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors block"
                    >
                      <div className="font-medium truncate">
                        {conversation.title}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                        {formatDistanceToNow(
                          new Date(conversation.lastActive),
                          {
                            addSuffix: true,
                            locale: ko,
                          }
                        )}
                      </div>
                    </a>
                    <div className="flex opacity-0 group-hover:opacity-100 transition-opacity pr-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => {
                          e.preventDefault();
                          startEditing(conversation.id, conversation.title);
                        }}
                        title="이름 변경"
                      >
                        <Edit2 size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                        onClick={(e) => {
                          e.preventDefault();
                          confirmDelete(conversation.id);
                        }}
                        title="삭제"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

interface ChatWindowProps {
  conversationId?: string;
  showChatList?: boolean;
}

export default function ChatWindow({
  conversationId,
  showChatList: initialShowChatList,
}: ChatWindowProps) {
  const {
    messages,
    streamingMessage,
    sendMessage,
    handleFeedback,
    isLoading,
    subgraphData,
    showChatList,
    conversations,
    currentChatTitle,
    startNewConversation,
    hasMore,
    isLoadingMore,
    loadMore,
    renameConversation,
    deleteConversation,
  } = useChatBot({ conversationId, showChatList: initialShowChatList });

  // 주식 정보나 메시지가 있는지 확인
  const hasStockInfo = messages.length > 0;

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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 grow overflow-y-hidden h-full">
      {showChatList ? (
        // 대화 목록 화면
        <div className="h-full lg:col-span-5 flex flex-col">
          <ConversationList
            conversations={conversations}
            isLoading={isLoading}
            onNewChat={handleNewChat}
            onRename={handleRename}
            onDelete={handleDelete}
          />
        </div>
      ) : (
        // 채팅 화면
        <>
          {/* 채팅 영역 - 모바일에서는 전체 너비, 데스크탑에서는 2/3 */}
          <div className="h-full lg:col-span-2 flex flex-col bg-zinc-50 dark:bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800">
            {/* 채팅 헤더 */}
            <div className="flex items-center p-4 border-b border-zinc-200 dark:border-zinc-800">
              <a
                href="/chat"
                className="p-1 mr-2 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                <ArrowLeft size={20} />
              </a>
              <h1
                className="text-lg font-semibold truncate flex-grow cursor-pointer hover:text-indigo-600 transition-colors"
                onClick={() => {
                  if (conversationId) {
                    const newTitle = window.prompt(
                      "대화 이름 변경",
                      currentChatTitle
                    );
                    if (newTitle && newTitle.trim()) {
                      handleRename(conversationId, newTitle.trim());
                    }
                  }
                }}
                title="클릭하여 대화 이름 변경"
              >
                {currentChatTitle}
              </h1>
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

            {/* 채팅 히스토리 */}
            <div className="p-6 overflow-y-auto grow">
              <ChatMessageList
                messages={messages}
                streamingMessage={streamingMessage}
                onFeedback={handleFeedback}
                onLoadMore={loadMore}
                hasMore={hasMore}
                isLoadingMore={isLoadingMore}
              />
            </div>

            {/* 입력 영역 */}
            <ChatInput onSendMessage={sendMessage} isLoading={isLoading} />
          </div>

          {/* 주식 정보 영역 - 모바일에서는 숨김, 데스크탑에서는 1/3 */}
          <div className="hidden lg:flex lg:flex-col gap-4 lg:col-span-3 h-full overflow-y-hidden">
            {hasStockInfo ? (
              <>
                {/* <StockInfoDisplay stockInfo={stockInfo} /> */}
                <StockChart subgraphData={subgraphData} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 p-6">
                <div className="text-center">
                  <p className="text-zinc-500 dark:text-zinc-400">
                    주식 관련 질문을 하시면
                    <br />
                    상세 정보가 여기에 표시됩니다.
                  </p>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
