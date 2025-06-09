import { useState } from "react";

import {
  DemographicQuestions,
  FinancialQuestions,
  RiskQuestions,
} from "./survey";
import { MotionFormWrapper, SubmitButton, SurveyHeader } from "./ui";

export type SurveyAnswers = {
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  q5: number[];
  q6: number;
  q7: number;
  q8: number | null;
};

export const SurveyStep = ({
  onSubmit,
  isLoading,
}: {
  onSubmit: (values: SurveyAnswers) => void;
  isLoading: boolean;
}) => {
  // 1~4, 6~8번 단일 선택, 5번 다중 선택
  const [q1, setQ1] = useState<number>(0);
  const [q2, setQ2] = useState<number>(0);
  const [q3, setQ3] = useState<number>(0);
  const [q4, setQ4] = useState<number>(0);
  const [q5, setQ5] = useState<number[]>([]);
  const [q6, setQ6] = useState<number>(0);
  const [q7, setQ7] = useState<number>(0);
  const [q8, setQ8] = useState<number>(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleQ5Change = (value: number) => {
    setQ5((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 모든 필수 필드가 채워졌는지 확인
    if (
      q1 === 0 ||
      q2 === 0 ||
      q3 === 0 ||
      q4 === 0 ||
      q5.length === 0 ||
      q6 === 0 ||
      q7 === 0 ||
      q8 === 0
    ) {
      setValidationError("모든 질문에 답변해주세요");
      return;
    }

    setValidationError(null);
    onSubmit({ q1, q2, q3, q4, q5, q6, q7, q8 });
  };

  return (
    <MotionFormWrapper formKey="survey-step">
      <div className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-12">
          <SurveyHeader
            title="투자 성향 진단"
            description="회원님의 투자 성향을 파악하여 최적의 투자 전략을 제안해 드립니다"
          />

          {validationError && (
            <div className="bg-red-50 p-3 rounded-md text-red-600 text-sm mb-4">
              {validationError}
            </div>
          )}

          {/* 인구통계 질문 */}
          <DemographicQuestions q1={q1} setQ1={setQ1} q2={q2} setQ2={setQ2} />

          {/* 재정 관련 질문 */}
          <FinancialQuestions
            q3={q3}
            setQ3={setQ3}
            q4={q4}
            setQ4={setQ4}
            q5={q5}
            handleQ5Change={handleQ5Change}
            q6={q6}
            setQ6={setQ6}
          />

          {/* 위험 감수 및 투자 기간 질문 */}
          <RiskQuestions q7={q7} setQ7={setQ7} q8={q8} setQ8={setQ8} />

          <SubmitButton
            isLoading={isLoading}
            text="나의 맞춤형 투자 여정 시작하기 ✨"
            loadingText="설문 제출 중..."
            className="py-6 text-base font-medium rounded-xl shadow-sm transition-all duration-300 hover:scale-[1.02] hover:shadow-md bg-gradient-to-r from-blue-600 to-indigo-600"
          />
        </form>
      </div>
    </MotionFormWrapper>
  );
};
