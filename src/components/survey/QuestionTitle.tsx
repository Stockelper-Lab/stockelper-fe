export type QuestionTitleProps = {
  emoji: string;
  emojiColor: string;
  emojiBackground: string;
  title: string;
  subtitle?: string;
};

export const QuestionTitle = ({
  emoji,
  emojiColor,
  emojiBackground,
  title,
  subtitle,
}: QuestionTitleProps) => (
  <label className="flex items-center gap-2 text-lg font-medium text-gray-800 mb-4">
    <span className={`${emojiBackground} ${emojiColor} p-1.5 rounded-full`}>
      {emoji}
    </span>
    <span>{title}</span>
    {subtitle && <span className="ml-1 text-sm text-gray-500">{subtitle}</span>}
  </label>
);
