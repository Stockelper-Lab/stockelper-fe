import PageHeader from "@/app/(has-layout)/components/page-header";
import ChatWindow from "@/components/chat/chat-window";
import { ReactFlowProvider } from "@xyflow/react";

export default function ChatPage() {
  return (
    <div className="flex h-full flex-col p-6 lg:p-8 overflow-hidden">
      <PageHeader
        title="AI 어시스턴트"
        description={
          <div>
            <div className="text-sm text-zinc-700 dark:text-zinc-400">
              💬 주식 투자에 관한 질문에 답변해 드립니다. LLM은 단순 데이터 가공
              결과만 제공합니다.
            </div>
            <div className="text-xs text-red-500 dark:text-red-400 mt-1">
              ⚠️ 주의: 투자 결정에 대한 책임은 전적으로 사용자에게 있습니다.
            </div>
          </div>
        }
      />
      <div className="flex-1 min-h-0 mt-4">
        <ReactFlowProvider>
          <ChatWindow showChatList={true} />
        </ReactFlowProvider>
      </div>
    </div>
  );
}
