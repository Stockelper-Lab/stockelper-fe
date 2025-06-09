import * as z from "zod";
import { SurveyAnswers } from "../survey-step";

// 설문조사 Zod 스키마
export const surveySchema = z.object({
  q1: z.number().min(0, "이 질문에 답해주세요"),
  q2: z.number().min(0, "이 질문에 답해주세요"),
  q3: z.number().min(0, "이 질문에 답해주세요"),
  q4: z.number().min(0, "이 질문에 답해주세요"),
  q5: z.array(z.number()).min(1, "최소 하나 이상 선택해주세요"),
  q6: z.number().min(0, "이 질문에 답해주세요"),
  q7: z.number().min(0, "이 질문에 답해주세요"),
  q8: z.number().min(0, "이 질문에 답해주세요"),
});

// 설문 데이터를 API 포맷으로 변환하는 함수
export const convertSurveyToApiFormat = (survey: SurveyAnswers) => {
  // 모든 설문 답변을 JSON 형태로 저장
  return {
    answer: {
      q1: survey.q1 || 0,
      q2: survey.q2 || 0,
      q3: survey.q3 || 0,
      q4: survey.q4 || 0,
      q5: survey.q5,
      q6: survey.q6 || 0,
      q7: survey.q7 || 0,
      q8: survey.q8 || 0,
    },
  };
};
