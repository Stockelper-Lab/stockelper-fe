import { ReactNode } from "react";

// 질문 제목 컴포넌트
type QuestionTitleProps = {
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
    <div className="flex flex-col">
      <span>{title}</span>
      {subtitle && (
        <span className="ml-1 text-xs text-gray-500">{subtitle}</span>
      )}
    </div>
  </label>
);

// 질문 카드 컴포넌트
type QuestionCardProps = {
  children: ReactNode;
};

export const QuestionCard = ({ children }: QuestionCardProps) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    {children}
  </div>
);

// 설문 헤더 컴포넌트
type SurveyHeaderProps = {
  title: string;
  description: string;
};

export const SurveyHeader = ({ title, description }: SurveyHeaderProps) => (
  <div className="text-center mb-8">
    <h2 className="text-2xl font-semibold text-gray-800 mb-2">{title}</h2>
    <p className="text-gray-500 text-sm">{description}</p>
  </div>
);
