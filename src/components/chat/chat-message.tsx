import { MarkdownRenderer } from "./markdown-renderer";
import { Message } from "./types";
import { cn } from "@/lib/utils";
import { Network } from "lucide-react";

interface ChatMessageProps {
  message: Message;
  onFeedback?: (messageId: string, feedback: boolean) => void;
  onOpenSubgraph?: (messageId: string) => void;
  isSubgraphSelected?: boolean;
}

export function ChatMessage({
  message,
  onFeedback,
  onOpenSubgraph,
  isSubgraphSelected,
}: ChatMessageProps) {
  let containerStyle = "";
  let textStyle = "";
  let alignment = "";

  switch (message.role) {
    case "user":
      containerStyle = "bg-blue-500 text-white shadow-md";
      textStyle = "text-xs leading-relaxed";
      alignment = "justify-end";
      break;
    case "question": // This is for active questions awaiting feedback
      containerStyle =
        "bg-amber-50 border border-amber-200 text-amber-800 shadow-md dark:bg-amber-900 dark:border-amber-700 dark:text-amber-100";
      textStyle = "text-xs leading-relaxed font-medium"; // Questions have a medium font weight
      alignment = "justify-start";
      break;
    case "assistant": // This is for normal assistant messages AND questions that have received feedback
      containerStyle =
        "bg-zinc-100 dark:bg-zinc-700/60 text-zinc-800 dark:text-zinc-200 shadow-sm";
      textStyle = ""; // Assistant messages use MarkdownRenderer, so no specific textStyle here
      alignment = "justify-start";
      break;
    default:
      // Fallback for any other roles, though not expected currently
      containerStyle = "bg-gray-200 dark:bg-gray-600 shadow-sm";
      textStyle = "text-xs leading-relaxed";
      alignment = "justify-start";
      break;
  }

  const handleFeedbackClick = (feedback: boolean) => {
    // Feedback is only allowed if the message is a 'question' and feedback hasn't been given yet.
    // useChatBot changes role to 'assistant' after feedback, so message.role === 'question' implies feedbackResponse is null.
    if (message.role === "question" && onFeedback) {
      onFeedback(message.id, feedback);
    }
  };

  // Buttons are shown only for active 'question' role messages.
  const showButtons = message.role === "question";

  const hasSubgraph = !!(message.subgraph && message.subgraph.node?.length > 0);
  const showSubgraphButton =
    message.role === "assistant" && hasSubgraph && !!onOpenSubgraph;
  const showSelectedRing = message.role === "assistant" && !!isSubgraphSelected;

  return (
    <div className={`flex ${alignment}`}>
      <div
        className={cn(
          "max-w-[85%] rounded-xl p-3",
          containerStyle,
          showSelectedRing &&
            "ring-2 ring-indigo-500 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900"
        )}
      >
        {message.role === "user" || message.role === "question" ? (
          // User messages and active Question messages are rendered as plain text <p>
          <p className={textStyle}>{message.content}</p>
        ) : (
          // Assistant messages (including former questions now role: "assistant") use MarkdownRenderer
          <MarkdownRenderer content={message.content} />
        )}

        {showButtons && onFeedback && (
          <div className="mt-3 pt-2 border-t border-amber-200 dark:border-amber-700 flex justify-end gap-2">
            <button
              onClick={() => handleFeedbackClick(true)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ease-in-out shadow-sm hover:shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-opacity-50 
                         bg-green-500/30 hover:bg-green-500/50 active:bg-green-500/70 text-green-800 dark:text-green-100 border border-green-500/50 dark:border-green-400/70 backdrop-blur-md focus:ring-green-500`}
            >
              예, 진행합니다
            </button>
            <button
              onClick={() => handleFeedbackClick(false)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all duration-150 ease-in-out shadow-sm hover:shadow-md transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-opacity-50 
                         bg-red-500/30 hover:bg-red-500/50 active:bg-red-500/70 text-red-800 dark:text-red-100 border border-red-500/50 dark:border-red-400/70 backdrop-blur-md focus:ring-red-500`}
            >
              아니오
            </button>
          </div>
        )}

        {/* Show feedback confirmation only on 'assistant' messages that have a feedbackResponse (i.e., were former questions) */}
        {message.role === "assistant" &&
          message.feedbackResponse !== null &&
          message.feedbackResponse !== undefined && (
            <div className="mt-3 pt-2 text-xs text-right">
              <p className="italic text-zinc-500 dark:text-zinc-400">
                (선택: {message.feedbackResponse ? "예" : "아니오"})
              </p>
            </div>
          )}

        {showSubgraphButton ? (
          <div className="mt-2 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => onOpenSubgraph?.(message.id)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                isSubgraphSelected
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200"
                  : "border-zinc-200 bg-white/70 text-zinc-700 hover:bg-white dark:border-zinc-600 dark:bg-zinc-800/60 dark:text-zinc-200 dark:hover:bg-zinc-800"
              )}
              title="이 응답의 서브그래프를 관계 네트워크 패널에서 보기"
            >
              <Network size={12} />
              {isSubgraphSelected ? "서브그래프 표시중" : "서브그래프 보기"}
            </button>

            <p className="text-right text-[10px] opacity-60">
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ) : (
          <p className="mt-1 text-right text-[10px] opacity-60">
            {new Date(message.timestamp).toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
