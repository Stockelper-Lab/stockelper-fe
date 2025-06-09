import * as z from "zod";

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
