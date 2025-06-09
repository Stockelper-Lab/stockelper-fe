import { Dispatch, SetStateAction } from "react";
import { QuestionCard, QuestionTitle, RadioGroupComponent } from "../ui";
import {
  investmentPeriodOptions,
  riskToleranceOptions,
  themeColors,
} from "./survey-data";

type RiskQuestionsProps = {
  q7: number;
  setQ7: Dispatch<SetStateAction<number>>;
  q8: number;
  setQ8: Dispatch<SetStateAction<number>>;
};

export const RiskQuestions = ({ q7, setQ7, q8, setQ8 }: RiskQuestionsProps) => {
  return (
    <>
      {/* 손실 감수 수준 */}
      <QuestionCard>
        <QuestionTitle
          emoji="📉"
          emojiColor="text-red-500"
          emojiBackground="bg-red-50"
          title="투자 시 어느 정도의 손실까지 감수할 수 있으신가요?"
        />
        <RadioGroupComponent
          value={q7.toString()}
          onValueChange={(v) => setQ7(Number(v))}
          options={riskToleranceOptions.map((option) => ({
            id: option.id,
            value: option.value.toString(),
            label: option.label,
          }))}
          themeColor={themeColors.riskTolerance}
          columns={1}
          centerItems={false}
        />
      </QuestionCard>

      {/* 투자 기간 */}
      <QuestionCard>
        <QuestionTitle
          emoji="⏳"
          emojiColor="text-cyan-500"
          emojiBackground="bg-cyan-50"
          title="자금을 얼마나 오래 투자하실 계획인가요?"
        />
        <RadioGroupComponent
          value={q8.toString()}
          onValueChange={(v) => setQ8(Number(v))}
          options={investmentPeriodOptions.map((option) => ({
            id: option.id,
            value: option.value.toString(),
            label: option.label,
          }))}
          themeColor={themeColors.investmentPeriod}
          columns={2}
        />
      </QuestionCard>
    </>
  );
};
