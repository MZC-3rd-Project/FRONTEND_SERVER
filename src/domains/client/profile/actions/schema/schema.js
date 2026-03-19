import { z } from "zod";

export const emailSchema = z.object({
    email: z
        .string()
        .min(1, "이메일을 입력해주세요.")
        .email("유효한 이메일 형식이 아닙니다."),
});

export const verifyCodeSchema = z.object({
    code: z
        .string()
        .min(1, "인증번호를 입력해주세요.")
        .length(6, "인증번호는 6자리입니다."),
});

export const profileSchema = z.object({
    nickname: z
        .string()
        .min(1, "닉네임을 입력해주세요.")
        .max(20, "닉네임은 20자 이하로 입력해주세요."),
    phone: z
        .string()
        .min(1, "전화번호를 입력해주세요.")
        .regex(/^010-\d{4}-\d{4}$/, "010-0000-0000 형식으로 입력해주세요."),
    delivery: z
        .string()
        .max(100, "배송지는 100자 이하로 입력해주세요.")
        .optional(),
});