// 각 질문에 대한 데이터
export const ageOptions = [
  { id: "q1-1", value: 1, label: "미성년자" },
  { id: "q1-2", value: 2, label: "20대" },
  { id: "q1-3", value: 3, label: "30대" },
  { id: "q1-4", value: 4, label: "40대" },
  { id: "q1-5", value: 5, label: "50대" },
  { id: "q1-6", value: 6, label: "60대 이상" },
];

export const incomeOptions = [
  { id: "q2-1", value: 1, label: "30백만원 이하" },
  { id: "q2-2", value: 2, label: "50백만원 이하" },
  { id: "q2-3", value: 3, label: "70백만원 이하" },
  { id: "q2-4", value: 4, label: "90백만원 이하" },
  { id: "q2-5", value: 5, label: "90백만원 초과" },
];

export const assetRatioOptions = [
  { id: "q3-1", value: 1, label: "5% 이하" },
  { id: "q3-2", value: 2, label: "10% 이하" },
  { id: "q3-3", value: 3, label: "15% 이하" },
  { id: "q3-4", value: 4, label: "20% 이하" },
  { id: "q3-5", value: 5, label: "20% 초과" },
];

export const incomeExpectationOptions = [
  {
    id: "q4-1",
    value: 1,
    label: "현재 일정한 수입이 있고, 앞으로 유지되거나 늘어날 것 같아요",
  },
  {
    id: "q4-2",
    value: 2,
    label: "현재 일정한 수입이 있지만, 앞으로 줄어들거나 불안정해질 것 같아요",
  },
  {
    id: "q4-3",
    value: 3,
    label: "일정한 수입이 없거나, 주로 연금으로 생활하고 있어요",
  },
];

export const investmentExperienceOptions = [
  {
    id: "q5-1",
    value: 1,
    label: "예금, 적금, 국채, 지방채, MMF 등 (안전한 상품)",
  },
  {
    id: "q5-2",
    value: 2,
    label:
      "금융채, 우량 회사채, 채권형 펀드, 원금보장형 ELS 등 (비교적 안전한 상품)",
  },
  {
    id: "q5-3",
    value: 3,
    label:
      "중간 등급 회사채, 부분 원금보장 ELS, 혼합형펀드 등 (중간 위험 상품)",
  },
  {
    id: "q5-4",
    value: 4,
    label: "저신용 회사채, 주식, 원금 비보장 ELS, 주식형 펀드 등 (위험 상품)",
  },
  {
    id: "q5-5",
    value: 5,
    label:
      "ELW, 선물옵션, 고수익 주식형펀드, 파생상품펀드, 신용거래 등 (고위험 상품)",
  },
];

export const financialKnowledgeOptions = [
  {
    id: "q6-1",
    value: 1,
    label:
      "파생상품을 포함한 대부분의 금융상품 구조와 위험을 잘 이해하고 있어요",
  },
  {
    id: "q6-2",
    value: 2,
    label:
      "주식, 채권, 펀드 등 대중적인 금융상품의 구조와 위험을 깊이 이해하고 있어요",
  },
  {
    id: "q6-3",
    value: 3,
    label:
      "주식, 채권, 펀드 등 대중적인 금융상품의 기본적인 특징을 알고 있어요",
  },
  {
    id: "q6-4",
    value: 4,
    label: "금융상품에 투자해본 경험이 없어요",
  },
];

export const riskToleranceOptions = [
  {
    id: "q7-1",
    value: 1,
    label: "높은 수익을 위해 원금 손실 위험이 크더라도 괜찮아요",
  },
  {
    id: "q7-2",
    value: 2,
    label: "원금의 20% 미만까지는 손실을 감수할 수 있어요",
  },
  {
    id: "q7-3",
    value: 3,
    label: "원금의 10% 미만까지는 손실을 감수할 수 있어요",
  },
  {
    id: "q7-4",
    value: 4,
    label: "원금은 반드시 보전되어야 해요",
  },
];

export const investmentPeriodOptions = [
  { id: "q8-1", value: 1, label: "3년 이상" },
  { id: "q8-2", value: 2, label: "2~3년" },
  { id: "q8-3", value: 3, label: "1~2년" },
  { id: "q8-4", value: 4, label: "6개월~1년" },
  { id: "q8-5", value: 5, label: "6개월 미만" },
];

// 테마 색상
export const themeColors = {
  age: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    ring: "ring-blue-200",
  },
  income: {
    bg: "bg-green-50",
    text: "text-green-700",
    ring: "ring-green-200",
  },
  assetRatio: {
    bg: "bg-purple-50",
    text: "text-purple-700",
    ring: "ring-purple-200",
  },
  incomeExpectation: {
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    ring: "ring-indigo-200",
  },
  investmentExperience: {
    bg: "bg-pink-50",
    text: "text-pink-700",
    ring: "ring-pink-200",
    accent: "accent-pink-500",
  },
  financialKnowledge: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    ring: "ring-amber-200",
  },
  riskTolerance: {
    bg: "bg-red-50",
    text: "text-red-700",
    ring: "ring-red-200",
  },
  investmentPeriod: {
    bg: "bg-cyan-50",
    text: "text-cyan-700",
    ring: "ring-cyan-200",
  },
};
