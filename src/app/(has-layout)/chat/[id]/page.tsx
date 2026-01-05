import PageHeader from "@/app/(has-layout)/components/page-header";
import ChatWindow from "@/components/chat/chat-window";
import { getMessages } from "@/lib/chat-service";
import { ReactFlowProvider } from "@xyflow/react";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // 서버 사이드에서 최신 메시지 10개 미리 불러오기 (page=1)
  // API와 동일한 방식으로 페이지네이션
  const allMessages = await getMessages(id);
  
  // 최신 메시지가 먼저 오도록 정렬 (내림차순)
  const sortedMessages = [...allMessages].sort((a, b) => {
    const dateA = new Date(a.timestamp);
    const dateB = new Date(b.timestamp);
    return dateB.getTime() - dateA.getTime(); // 최신 메시지가 먼저
  });
  
  // page=1: 최신 메시지 10개
  const limit = 10;
  const page = 1;
  const startIndex = (page - 1) * limit;
  const latestMessages = sortedMessages.slice(startIndex, startIndex + limit);
  
  // 반환할 때는 오름차순으로 정렬 (오래된 메시지가 먼저)
  // 이렇게 하면 클라이언트에서 위로 스크롤할 때 더 오래된 메시지를 위에 추가할 수 있음
  const reversedMessages = [...latestMessages].reverse();
  
  const hasMore = startIndex + limit < sortedMessages.length;
  const totalCount = sortedMessages.length;
  
  const messages = reversedMessages;

  return (
    <div className="flex h-full flex-col p-8 overflow-scroll">
      <PageHeader
        title="AI 어시스턴트"
        description={
          <div>
            <div className="text-sm text-zinc-700 dark:text-zinc-400">
              💬 주식 투자에 관한 질문에 답변해 드립니다. LLM은 단순 데이터 가공
              결과만 제공합니다.
            </div>
            <div className="text-xs text-red-500 dark:text-red-400">
              ⚠️ 주의: 투자 결정에 대한 책임은 전적으로 사용자에게 있습니다.
            </div>
          </div>
        }
      />
      <div className="rounded-xl border-zinc-100 dark:border-zinc-700/50 h-full overflow-auto">
        <ReactFlowProvider>
          <ChatWindow 
            conversationId={id} 
            showChatList={false}
            initialMessages={messages}
            initialHasMore={hasMore}
            initialTotalCount={totalCount}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
