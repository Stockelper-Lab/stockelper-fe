import { MarkdownRenderer } from "./markdown-renderer";
import { Message } from "./types";

interface ChatMessageProps {
  message: Message;
  onFeedback?: (messageId: string, feedback: boolean) => void;
}

export function ChatMessage({ message, onFeedback }: ChatMessageProps) {
  let containerStyle = "";
  let textStyle = "";
  let alignment = "";

  switch (message.role) {
    case "user":
      containerStyle = "bg-blue-500 text-white shadow-md";
      textStyle = "text-[15px] leading-relaxed";
      alignment = "justify-end";
      break;
    case "question": // This is for active questions awaiting feedback
      containerStyle =
        "bg-amber-50 border border-amber-200 text-amber-800 shadow-md dark:bg-amber-900 dark:border-amber-700 dark:text-amber-100";
      textStyle = "text-[15px] leading-relaxed font-medium"; // Questions have a medium font weight
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
      textStyle = "text-[15px] leading-relaxed";
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

  return (
    <div className={`flex ${alignment}`}>
      <div className={`max-w-[80%] rounded-2xl p-4 ${containerStyle}`}>
        {message.role === "user" || message.role === "question" ? (
          // User messages and active Question messages are rendered as plain text <p>
          <p className={textStyle}>{message.content}</p>
        ) : (
          // Assistant messages (including former questions now role: "assistant") use MarkdownRenderer
          <MarkdownRenderer content={message.content} />
        )}

        {showButtons && onFeedback && (
          <div className="mt-5 pt-3 border-t border-amber-200 dark:border-amber-700 flex justify-end gap-3">
            <button
              onClick={() => handleFeedbackClick(true)}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-opacity-50 
                         bg-green-500/30 hover:bg-green-500/50 active:bg-green-500/70 text-green-800 dark:text-green-100 border border-green-500/50 dark:border-green-400/70 backdrop-blur-md focus:ring-green-500`}
            >
              예, 진행합니다
            </button>
            <button
              onClick={() => handleFeedbackClick(false)}
              className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ease-in-out shadow-md hover:shadow-lg transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-opacity-50 
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

        <p className="mt-1.5 text-right text-xs opacity-70">
          {new Date(message.timestamp).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
