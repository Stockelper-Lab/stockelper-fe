"use client";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConversationInfo } from "@/lib/chat-service";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Edit2, MessageSquare, MessageSquarePlus, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface ConversationListProps {
  conversations: ConversationInfo[];
  isLoading: boolean;
  onNewChat: () => void;
  onRename: (id: string, title: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

// 스켈레톤 로딩 컴포넌트
function ConversationSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/30"
        >
          <Skeleton className="w-9 h-9 rounded-lg flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ConversationList({
  conversations,
  isLoading,
  onNewChat,
  onRename,
  onDelete,
}: ConversationListProps) {
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
    <div className="h-full flex flex-col max-w-3xl mx-auto">
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-zinc-200 dark:border-zinc-700">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            대화 목록
          </h2>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            {isLoading ? "불러오는 중..." : `${conversations.length}개의 대화`}
          </p>
        </div>
        <Button
          onClick={onNewChat}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <Plus size={16} />
          <span>새 대화</span>
        </Button>
      </div>

      {/* 대화 목록 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ConversationSkeleton />
        ) : conversations.length === 0 ? (
          // 빈 상태 화면
          <div className="flex flex-col items-center justify-center h-full py-16">
            <div className="w-16 h-16 rounded-full bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center mb-4">
              <MessageSquarePlus className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-base font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              대화 내역이 없습니다
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 text-center">
              AI 어시스턴트와 주식 투자에 대해 이야기해 보세요.
            </p>
            <Button
              onClick={onNewChat}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              <span>첫 대화 시작하기</span>
            </Button>
          </div>
        ) : (
          // 리스트 형태로 대화 표시
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="group relative"
              >
                {editingId === conversation.id ? (
                  // 이름 편집 모드
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="flex-1 px-3 py-1.5 rounded-md border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-8"
                    >
                      저장
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(null)}
                      className="text-xs h-8"
                    >
                      취소
                    </Button>
                  </div>
                ) : (
                  <Link
                    href={`/chat/${conversation.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    {/* 아이콘 */}
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center flex-shrink-0">
                      <MessageSquare size={18} className="text-indigo-500" />
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate text-sm">
                        {conversation.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                        {formatDistanceToNow(new Date(conversation.lastActive), {
                          addSuffix: true,
                          locale: ko,
                        })}
                      </p>
                    </div>

                    {/* 호버 시 액션 버튼 */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          startEditing(conversation.id, conversation.title);
                        }}
                        title="이름 변경"
                      >
                        <Edit2 size={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-500 hover:text-red-600"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          confirmDelete(conversation.id);
                        }}
                        title="삭제"
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
