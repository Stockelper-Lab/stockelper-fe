import { Dispatch, SetStateAction } from "react";
import { QuestionCard, QuestionTitle, RadioGroupComponent } from "../ui";
import { ageOptions, incomeOptions, themeColors } from "./survey-data";

type DemographicQuestionsProps = {
  q1: number;
  setQ1: Dispatch<SetStateAction<number>>;
  q2: number;
  setQ2: Dispatch<SetStateAction<number>>;
};

export const DemographicQuestions = ({
  q1,
  setQ1,
  q2,
  setQ2,
}: DemographicQuestionsProps) => {
  return (
    <>
      {/* 연령대 */}
      <QuestionCard>
        <QuestionTitle
          emoji="🎂"
          emojiColor="text-blue-500"
          emojiBackground="bg-blue-50"
          title="연령대가 어떻게 되시나요?"
        />
        <RadioGroupComponent
          value={q1.toString()}
          onValueChange={(v) => setQ1(Number(v))}
          options={ageOptions.map((option) => ({
            id: option.id,
            value: option.value.toString(),
            label: option.label,
          }))}
          themeColor={themeColors.age}
          columns={3}
        />
      </QuestionCard>

      {/* 연소득 현황 */}
      <QuestionCard>
        <QuestionTitle
          emoji="💰"
          emojiColor="text-green-500"
          emojiBackground="bg-green-50"
          title="연간 소득은 어느 정도 되시나요?"
        />
        <RadioGroupComponent
          value={q2.toString()}
          onValueChange={(v) => setQ2(Number(v))}
          options={incomeOptions.map((option) => ({
            id: option.id,
            value: option.value.toString(),
            label: option.label,
          }))}
          themeColor={themeColors.income}
          columns={2}
        />
      </QuestionCard>
    </>
  );
};
