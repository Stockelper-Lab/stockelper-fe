import ChatWindow from "@/components/chat/chat-window";
import { getMessages } from "@/lib/chat-service";
import { prisma } from "@/lib/db";
import { ReactFlowProvider } from "@xyflow/react";

export default async function ChatRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 대화방 존재 여부 확인
  const conversation = await prisma.conversation.findUnique({
    where: { id },
  });

  // 대화방이 아직 없으면 (새 대화 - 임시 ID로 접근) 빈 메시지로 시작
  let messages: Awaited<ReturnType<typeof getMessages>> = [];
  let hasMore = false;
  let totalCount = 0;

  if (conversation) {
    // 서버 사이드에서 최신 메시지 10개 미리 불러오기 (page=1)
    const allMessages = await getMessages(id);

    // 최신 메시지가 먼저 오도록 정렬 (내림차순)
    const sortedMessages = [...allMessages].sort((a, b) => {
      const dateA = new Date(a.timestamp);
      const dateB = new Date(b.timestamp);
      return dateB.getTime() - dateA.getTime();
    });

    // page=1: 최신 메시지 10개
    const limit = 10;
    const page = 1;
    const startIndex = (page - 1) * limit;
    const latestMessages = sortedMessages.slice(startIndex, startIndex + limit);

    // 반환할 때는 오름차순으로 정렬 (오래된 메시지가 먼저)
    messages = [...latestMessages].reverse();

    hasMore = startIndex + limit < sortedMessages.length;
    totalCount = sortedMessages.length;
  }

  return (
    <div className="h-full overflow-hidden">
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
  );
}
