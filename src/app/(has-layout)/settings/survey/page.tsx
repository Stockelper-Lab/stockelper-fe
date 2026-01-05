"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { convertSurveyToApiFormat } from "@/app/(no-layout)/sign-up/components/survey";
import {
  SurveyAnswers,
  SurveyStep,
} from "@/app/(no-layout)/sign-up/components/survey-step";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchSurvey, updateSurvey } from "@/lib/api/settings";
import { useMutation, useQuery } from "@tanstack/react-query";
import PageHeader from "../../components/page-header";

export default function ResetSurveyPage() {
  const router = useRouter();

  // 설문 데이터 가져오기 - React Query 사용
  const {
    data: surveyData,
    isLoading: isFetching,
    error: fetchError,
  } = useQuery({
    queryKey: ["survey"],
    queryFn: fetchSurvey,
    staleTime: 1000 * 60 * 5, // 5분간 fresh 상태 유지
    gcTime: 1000 * 60 * 30, // 30분간 캐시 유지
    retry: 1,
  });

  // 설문 업데이트 mutation
  const updateSurveyMutation = useMutation({
    mutationFn: (answer: unknown) => updateSurvey(answer),
    onSuccess: () => {
      toast.success("투자 성향이 성공적으로 업데이트되었습니다.");
      router.push("/settings/account");
    },
    onError: (err: Error) => {
      toast.error(err.message || "알 수 없는 오류가 발생했습니다.");
    },
  });

  const handleSubmit = async (values: SurveyAnswers) => {
    const surveyApiData = convertSurveyToApiFormat(values);
    updateSurveyMutation.mutate(surveyApiData.answer);
  };

  const initialValues =
    surveyData && "answer" in surveyData
      ? (surveyData.answer as SurveyAnswers)
      : null;

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <PageHeader
          title="투자 성향 재설정"
          description="투자 성향 설문을 다시 진행하여 프로필을 업데이트할 수 있습니다."
        />
        <div className="mt-8">
          {isFetching ? (
            <div className="space-y-8">
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
          ) : fetchError ? (
            <div className="text-red-500">
              기존 설문 정보를 불러오는 데 실패했습니다.
            </div>
          ) : (
            <SurveyStep
              onSubmit={handleSubmit}
              isLoading={updateSurveyMutation.isPending}
              defaultValues={initialValues}
            />
          )}
        </div>
      </div>
    </div>
  );
}
