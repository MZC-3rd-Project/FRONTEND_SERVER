import { axiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";

export async function signup({ username, email, password, firstName, lastName }) {
    try {
        const response = await axiosInstance.post("/v1/auth/signup", {
            username,
            email,
            password,
            firstName,
            lastName,
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
        const response = await axiosInstance.post("/v1/auth/emails/resend", {
            email,
        });
        return unwrapApiResponseBody(response, "인증 메일 재발송에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "인증 메일 재발송에 실패했습니다.");
    }
}
