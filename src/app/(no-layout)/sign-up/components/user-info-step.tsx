import { UseFormReturn } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { MotionFormWrapper } from "./ui";

// 통합 회원가입 폼 스키마
export const userFormSchema = z
  .object({
    email: z.string().email({
      message: "이메일 주소가 올바르지 않아요! 다시 확인해 주세요~ 📧",
    }),
    password: z.string().min(8, {
      message: "비밀번호는 최소 8자리 이상이어야 해요! 🔒",
    }),
    confirmPassword: z.string(),
    name: z.string().min(2, {
      message: "이름은 최소 2글자 이상 입력해주세요! 📛",
    }),
    nickname: z.string().min(2, {
      message: "닉네임은 최소 2글자 이상 입력해주세요! 🏷️",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 서로 달라요! 다시 확인해주세요~ 🔍",
    path: ["confirmPassword"],
  });

type UserFormStepProps = {
  form: UseFormReturn<z.infer<typeof userFormSchema>>;
  onSubmit: (values: z.infer<typeof userFormSchema>) => void;
};

export const UserFormStep = ({ form, onSubmit }: UserFormStepProps) => {
  return (
    <MotionFormWrapper formKey="user-form-step">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>이메일</FormLabel>
                <FormControl>
                  <Input placeholder="나의이메일@stockhelper.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>비밀번호 확인</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>이름</FormLabel>
                  <FormControl>
                    <Input placeholder="실명을 입력해주세요" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>닉네임</FormLabel>
                  <FormControl>
                    <Input placeholder="투자의 달인" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full">
            다음 단계로! 👉
          </Button>
        </form>
      </Form>
    </MotionFormWrapper>
  );
};
