import { Dispatch, SetStateAction } from "react";
import {
  CheckboxGroupComponent,
  QuestionCard,
  QuestionTitle,
  RadioGroupComponent,
} from "../ui";
import {
  assetRatioOptions,
  financialKnowledgeOptions,
  incomeExpectationOptions,
  investmentExperienceOptions,
  themeColors,
} from "./survey-data";

type FinancialQuestionsProps = {
  q3: number;
  setQ3: Dispatch<SetStateAction<number>>;
  q4: number;
  setQ4: Dispatch<SetStateAction<number>>;
  q5: number[];
  handleQ5Change: (value: number) => void;
  q6: number;
  setQ6: Dispatch<SetStateAction<number>>;
};

export const FinancialQuestions = ({
  q3,
  setQ3,
  q4,
  setQ4,
  q5,
  handleQ5Change,
  q6,
  setQ6,
}: FinancialQuestionsProps) => {
  return (
    <>
      {/* 금융자산 비중 */}
      <QuestionCard>
        <QuestionTitle
          emoji="📊"
          emojiColor="text-purple-500"
          emojiBackground="bg-purple-50"
          title="총 자산 중 금융 자산의 비중은 어느 정도인가요?"
        />
        <RadioGroupComponent
          value={q3.toString()}
          onValueChange={(v) => setQ3(Number(v))}
          options={assetRatioOptions.map((option) => ({
            id: option.id,
            value: option.value.toString(),
            label: option.label,
          }))}
          themeColor={themeColors.assetRatio}
          columns={3}
        />
      </QuestionCard>

      {/* 수입원 예상 */}
      <QuestionCard>
        <QuestionTitle
          emoji="🔮"
          emojiColor="text-indigo-500"
          emojiBackground="bg-indigo-50"
          title="앞으로의 수입에 대해 어떻게 예상하시나요?"
        />
        <RadioGroupComponent
          value={q4.toString()}
          onValueChange={(v) => setQ4(Number(v))}
          options={incomeExpectationOptions.map((option) => ({
            id: option.id,
            value: option.value.toString(),
            label: option.label,
          }))}
          themeColor={themeColors.incomeExpectation}
          columns={1}
          centerItems={false}
        />
      </QuestionCard>

      {/* 투자 경험 */}
      <QuestionCard>
        <QuestionTitle
          emoji="📈"
          emojiColor="text-pink-500"
          emojiBackground="bg-pink-50"
          title="어떤 금융 상품에 투자해 보셨나요?"
          subtitle="(여러 개 선택 가능)"
        />
        <CheckboxGroupComponent
          values={q5}
          onChange={handleQ5Change}
          options={investmentExperienceOptions}
          themeColor={themeColors.investmentExperience}
        />
      </QuestionCard>

      {/* 금융 지식 수준 */}
      <QuestionCard>
        <QuestionTitle
          emoji="🧠"
          emojiColor="text-amber-500"
          emojiBackground="bg-amber-50"
          title="금융 상품에 대한 이해도는 어느 정도인가요?"
        />
        <RadioGroupComponent
          value={q6.toString()}
          onValueChange={(v) => setQ6(Number(v))}
          options={financialKnowledgeOptions.map((option) => ({
            id: option.id,
            value: option.value.toString(),
            label: option.label,
          }))}
          themeColor={themeColors.financialKnowledge}
          columns={1}
          centerItems={false}
        />
      </QuestionCard>
    </>
  );
};
