"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { convertSurveyToApiFormat } from "@/app/(no-layout)/sign-up/components/survey";
import {
  SurveyAnswers,
  SurveyStep,
} from "@/app/(no-layout)/sign-up/components/survey-step";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "../../components/page-header";

export default function ResetSurveyPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [initialValues, setInitialValues] = useState<SurveyAnswers | null>(
    null
  );

  useEffect(() => {
    const fetchSurveyData = async () => {
      setIsFetching(true);
      try {
        const response = await fetch("/api/survey");
        if (response.ok) {
          const data = await response.json();
          // API 응답 형식에 따라 initialValues를 설정해야 합니다.
          // 예를 들어, data.answer가 설문 답변 객체일 경우:
          setInitialValues(data.answer);
        }
        // 404 Not Found의 경우, initialValues는 null로 유지되어 빈 폼으로 시작합니다.
      } catch {
        toast.error("기존 설문 정보를 불러오는 데 실패했습니다.");
      } finally {
        setIsFetching(false);
      }
    };

    fetchSurveyData();
  }, []);

  const handleSubmit = async (values: SurveyAnswers) => {
    setIsLoading(true);
    try {
      const surveyApiData = convertSurveyToApiFormat(values);
      const response = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surveyApiData.answer),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "설문 업데이트에 실패했습니다.");
      }
      toast.success("투자 성향이 성공적으로 업데이트되었습니다.");
      router.push("/settings/account");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 h-full">
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
          ) : (
            <SurveyStep
              onSubmit={handleSubmit}
              isLoading={isLoading}
              defaultValues={initialValues}
            />
          )}
        </div>
      </div>
    </div>
  );
}
