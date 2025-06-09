import React from "react";

export type QuestionCardProps = {
  children: React.ReactNode;
};

export const QuestionCard = ({ children }: QuestionCardProps) => (
  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
    {children}
  </div>
);
