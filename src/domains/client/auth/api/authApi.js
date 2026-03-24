import { axiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";

export async function signup({ email, password, nickname }) {
    try {
        const response = await axiosInstance.post("/v1/auth/signup", {
            email,
            password,
            nickname,
        });
        return unwrapApiResponseBody(response, "회원가입에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "회원가입에 실패했습니다.");
    }
}

export async function verifyEmail({ email, code }) {
    try {
        const response = await axiosInstance.post("/v1/auth/emails/verify", {
            email,
            code,
        });
        return unwrapApiResponseBody(response, "이메일 인증에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "이메일 인증에 실패했습니다.");
    }
}

export async function resendVerificationEmail(email) {
    try {
        const response = await axiosInstance.post("/v1/auth/emails/verification", {
            email,
        });
        return unwrapApiResponseBody(response, "인증 메일 재발송에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "인증 메일 재발송에 실패했습니다.");
    }
}

export async function checkEmailAvailability(email) {
    try {
        const response = await axiosInstance.get("/v1/auth/emails/check", {
            params: { email },
        });
        return unwrapApiResponseBody(response, "이메일 중복 확인에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "이메일 중복 확인에 실패했습니다.");
    }
}

export async function checkNicknameAvailability(nickname) {
    try {
        const response = await axiosInstance.get("/v1/auth/nicknames/check", {
            params: { nickname },
        });
        return unwrapApiResponseBody(response, "닉네임 중복 확인에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "닉네임 중복 확인에 실패했습니다.");
    }
}
