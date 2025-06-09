import { SurveyAnswers } from "@/app/(no-layout)/sign-up/components/survey-step";

interface ScoreMap {
  [key: string]: {
    [key: number]: number;
  };
}

// 각 문항별 점수 매핑
const scoreMap: ScoreMap = {
  q1: { 1: 2.5, 2: 2.5, 3: 2.0, 4: 1.5, 5: 1.0, 6: 0.5 },
  q2: { 1: 1.0, 2: 2.0, 3: 3.0, 4: 3.5, 5: 4.0 },
  q3: { 1: 1.0, 2: 2.0, 3: 2.5, 4: 3.0, 5: 3.5 },
  q4: { 1: 5.5, 2: 3.5, 3: 1.0 },
  q5: { 1: 1.0, 2: 2.5, 3: 3.5, 4: 4.5, 5: 5.5 },
  q6: { 1: 5.5, 2: 4.0, 3: 2.5, 4: 1.0 },
  q7: { 1: 10.0, 2: 7.5, 3: 5.0, 4: 2.0 },
  q8: { 1: 2.5, 2: 2.0, 3: 1.5, 4: 1.0, 5: 0.5 },
};

const MAX_SCORE = 39.0;

// 모든 필수 질문에 답변했는지 확인
const validateCompleteness = (survey: SurveyAnswers): void => {
  const { q1, q2, q3, q4, q5, q6, q7, q8 } = survey;

  if (
    q1 === null ||
    q2 === null ||
    q3 === null ||
    q4 === null ||
    q5.length === 0 ||
    q6 === null ||
    q7 === null ||
    q8 === null
  ) {
    throw new Error("모든 질문에 답변해야 합니다.");
  }
};

// 단일 선택 문항 유효성 검사 및 점수 반환
const validateAndScoreSingleChoice = (
  questionKey: "q1" | "q2" | "q3" | "q4" | "q6" | "q7" | "q8",
  value: number | null
): number => {
  // null 체크 (이미 validateCompleteness에서 검사했지만 타입 안전성을 위해 추가)
  if (value === null) {
    throw new Error(`${questionKey}에 대한 답변이 없습니다.`);
  }

  if (!scoreMap[questionKey][value]) {
    throw new Error(`${questionKey}에 대해 유효한 선택지가 아닙니다: ${value}`);
  }
  return scoreMap[questionKey][value];
};

// 다중 선택 문항(q5) 유효성 검사 및 점수 반환
const validateAndScoreMultiChoice = (choices: number[]): number => {
  if (choices.length === 0) {
    throw new Error("q5에 대한 선택지가 없습니다.");
  }

  // 첫 번째 선택지만 사용 (필요에 따라 로직 변경 가능)
  const firstChoice = choices[0];
  if (!scoreMap.q5[firstChoice]) {
    throw new Error(`q5에 대해 유효한 선택지가 아닙니다: ${firstChoice}`);
  }

  return scoreMap.q5[firstChoice];
};

// 투자 성향 분류
const classifyInvestorProfile = (percentScore: number): string => {
  if (percentScore < 43) {
    return "안정형";
  } else if (percentScore < 55) {
    return "안정추구형";
  } else if (percentScore < 68) {
    return "위험중립형";
  } else if (percentScore < 81) {
    return "적극투자형";
  } else {
    return "공격투자형";
  }
};

const evalInvestorProfile = (survey: SurveyAnswers): string => {
  // 유효성 검사
  validateCompleteness(survey);

  const { q1, q2, q3, q4, q5, q6, q7, q8 } = survey;

  // 7번 문항: 선택지 4인 경우 안정형 고정
  if (q7 === 4) {
    return "안정형";
  }

  // 점수 계산
  let totalScore = 0.0;

  totalScore += validateAndScoreSingleChoice("q1", q1);
  totalScore += validateAndScoreSingleChoice("q2", q2);
  totalScore += validateAndScoreSingleChoice("q3", q3);
  totalScore += validateAndScoreSingleChoice("q4", q4);
  totalScore += validateAndScoreMultiChoice(q5);
  totalScore += validateAndScoreSingleChoice("q6", q6);
  totalScore += validateAndScoreSingleChoice("q7", q7);
  totalScore += validateAndScoreSingleChoice("q8", q8);

  // 백분율 환산
  const percent = (totalScore / MAX_SCORE) * 100;

  // 투자성향 분류
  return classifyInvestorProfile(percent);
};

export default evalInvestorProfile;
