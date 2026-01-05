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
    <div className="h-full flex flex-col">
      {/* 헤더 영역 - 간결하게 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800/50 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              AI 어시스턴트
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {isLoading ? "불러오는 중..." : `${conversations.length}개의 대화`}
            </p>
          </div>
        </div>
        <Button
          onClick={onNewChat}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/20"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">새 대화</span>
        </Button>
      </div>

      {/* 대화 목록 - 전체 너비 사용 */}
      <div className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900/50">
        {isLoading ? (
          <div className="p-4">
            <ConversationSkeleton />
          </div>
        ) : conversations.length === 0 ? (
          // 빈 상태 화면
          <div className="flex flex-col items-center justify-center h-full py-16 px-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-950/50 dark:to-purple-950/50 flex items-center justify-center mb-6 shadow-lg">
              <MessageSquarePlus className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              대화 내역이 없습니다
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 text-center max-w-sm">
              AI 어시스턴트와 주식 투자에 대해 이야기해 보세요.
              <br />
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                💡 종목 분석, 시장 동향, 투자 전략 등을 물어보세요
              </span>
            </p>
            <Button
              onClick={onNewChat}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 shadow-md shadow-indigo-500/20"
            >
              <Plus size={18} />
              <span>첫 대화 시작하기</span>
            </Button>
          </div>
        ) : (
          // 그리드 형태로 대화 표시
          <div className="p-4 grid gap-2 sm:grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
            {conversations.map((conversation) => (
              <div
                key={conversation.id}
                className="group relative"
              >
                {editingId === conversation.id ? (
                  // 이름 편집 모드
                  <div className="flex items-center gap-2 p-4 rounded-xl bg-white dark:bg-zinc-800 border border-indigo-200 dark:border-indigo-800 shadow-sm">
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="flex-1 px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-zinc-50 dark:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
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
                      className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs h-9 px-3"
                    >
                      저장
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingId(null)}
                      className="text-xs h-9"
                    >
                      취소
                    </Button>
                  </div>
                ) : (
                  <Link
                    href={`/chat/${conversation.id}`}
                    className="flex items-start gap-3 p-4 rounded-xl bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 border border-zinc-200 dark:border-zinc-700 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm hover:shadow-md"
                  >
                    {/* 아이콘 */}
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center flex-shrink-0">
                      <MessageSquare size={18} className="text-indigo-600 dark:text-indigo-400" />
                    </div>

                    {/* 내용 */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-zinc-900 dark:text-zinc-100 truncate text-sm">
                        {conversation.title}
                      </h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
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
                        className="h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-lg"
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
                        className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-950/50 text-red-500 hover:text-red-600 rounded-lg"
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

      {/* 하단 경고 메시지 - 간결하게 */}
      <div className="px-6 py-3 border-t border-zinc-200 dark:border-zinc-700 bg-amber-50 dark:bg-amber-950/30 flex-shrink-0">
        <p className="text-xs text-amber-700 dark:text-amber-400 text-center">
          ⚠️ 투자 결정에 대한 책임은 전적으로 사용자에게 있습니다. AI 분석 결과는 참고용입니다.
        </p>
      </div>
    </div>
  );
}
