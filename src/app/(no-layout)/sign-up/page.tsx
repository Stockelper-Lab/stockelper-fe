"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { convertSurveyToApiFormat } from "@/app/(no-layout)/sign-up/components/survey";
import {
  SurveyAnswers,
  SurveyStep,
} from "@/app/(no-layout)/sign-up/components/survey-step";
import { userFormSchema } from "@/app/(no-layout)/sign-up/components/user-form";
import { UserFormStep } from "@/app/(no-layout)/sign-up/components/user-info-step";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, ChevronLeft } from "lucide-react";

const stepTitles = ["회원 정보 작성하기 📝", "나를 알려주세요 🌱"];

const SignUpPage = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // 유저 정보 폼
  const userForm = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      name: "",
      nickname: "",
    },
  });

  // 사용자 정보 제출
  const onUserFormSubmit = () => {
    setCurrentStep(1);
  };

  // 최종 회원가입 제출
  const onSurveySubmit = async (values: SurveyAnswers) => {
    try {
      setError(null);
      setIsLoading(true);

      // 모든 폼 데이터 수집
      const surveyApiData = convertSurveyToApiFormat(values);
      const userData = {
        email: userForm.getValues().email,
        password: userForm.getValues().password,
        name: userForm.getValues().name,
        nickname: userForm.getValues().nickname,
        ...surveyApiData,
      };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          name: userData.name,
          password: userData.password,
          nickname: userData.nickname,
          survey: userData.answer,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "회원가입 중 문제가 생겼어요! 다시 시도해볼까요?"
        );
      }

      // 회원가입 성공 시 로그인 페이지로 이동
      router.push("/sign-in?registered=true");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(
          "회원가입 중 알 수 없는 오류가 발생했어요! 잠시 후 다시 시도해주세요 🙏"
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 이전 단계로 이동
  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="relative w-full">
          {/* 뒤로가기 버튼 */}
          <div className="absolute left-4 top-4 z-10">
            {currentStep > 0 ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevStep}
                className="rounded-full h-10 w-10"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            ) : (
              <Link href="/sign-in">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-10 w-10"
                >
                  <ArrowLeft className="h-6 w-6" />
                </Button>
              </Link>
            )}
          </div>

          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold">
              가입하기 {currentStep + 1}/{stepTitles.length} 🌈
            </CardTitle>
            <CardDescription className="text-center">
              {stepTitles[currentStep]}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 단계별 폼 렌더링 */}
            {currentStep === 0 && (
              <UserFormStep form={userForm} onSubmit={onUserFormSubmit} />
            )}

            {currentStep === 1 && (
              <SurveyStep onSubmit={onSurveySubmit} isLoading={isLoading} />
            )}
          </CardContent>

          <CardFooter className="flex justify-center">
            <div className="text-sm text-center">
              이미 계정이 있으신가요?{" "}
              <Link href="/sign-in" className="text-primary hover:underline">
                로그인하기 🚪
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
