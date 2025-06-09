"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useState } from "react";

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSendMessage, isLoading }: ChatInputProps) {
  const [input, setInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);

  const handleSendMessage = () => {
    // 조합 중이거나 입력이 없으면 리턴
    if (isComposing || !input.trim()) return;

    // 입력값을 변수에 저장
    const messageContent = input.trim();

    // 입력창 초기화
    setInput("");

    // 메시지 전송 콜백 호출
    onSendMessage(messageContent);
  };

  return (
    <div className="border-t border-zinc-200 dark:border-zinc-800 p-4">
      <div className="flex items-end relative rounded-xl bg-white dark:bg-zinc-800/70 border border-zinc-200 dark:border-zinc-700 shadow-sm px-4 py-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="min-h-[48px] resize-none border-none bg-transparent focus-visible:ring-0 focus-visible:outline-none shadow-none p-0 py-3 text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => {
            setIsComposing(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              // 약간의 지연 후 메시지 전송 (한글 입력 완료를 보장)
              setTimeout(() => {
                if (!isComposing && input.trim()) {
                  handleSendMessage();
                }
              }, 10);
            }
          }}
        />
        <Button
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()}
          className="rounded-full h-[38px] w-[38px] p-0 bg-primary hover:bg-primary/90 flex items-center justify-center shrink-0"
        >
          <Send size={16} className="text-primary-foreground" />
        </Button>
      </div>
    </div>
  );
}
