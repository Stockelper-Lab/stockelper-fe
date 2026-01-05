import ChatWindow from "@/components/chat/chat-window";
import { ReactFlowProvider } from "@xyflow/react";

export default function ChatPage() {
  return (
    <div className="h-full overflow-hidden">
      <ReactFlowProvider>
        <ChatWindow showChatList={true} />
      </ReactFlowProvider>
    </div>
  );
}
