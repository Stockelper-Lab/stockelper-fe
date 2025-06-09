import PageHeader from "@/app/(has-layout)/components/page-header";
import ChatWindow from "@/components/chat/chat-window";
import { ReactFlowProvider } from "@xyflow/react";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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
          <ChatWindow conversationId={id} showChatList={false} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
