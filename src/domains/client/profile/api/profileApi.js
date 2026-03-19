import { axiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";

export async function fetchProfile() {
    try {
        const response = await axiosInstance.get("/profile");
        return unwrapApiResponseBody(response, "프로필 정보를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "프로필 조회에 실패했습니다.");
    }
}

export async function requestEmailVerify(email) {
    try {
        const response = await axiosInstance.post("/profile/email/verify-request", { email });
        unwrapApiResponseBody(response, "인증번호 발송에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "인증번호 발송에 실패했습니다.");
    }
}

export async function confirmEmailVerify({ email, code }) {
    try {
        const response = await axiosInstance.post("/profile/email/verify-confirm", { email, code });
        unwrapApiResponseBody(response, "인증번호 확인에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "인증번호 확인에 실패했습니다.");
    }
}

export async function updateProfile(data) {
    try {
        console.log(data, "data");
        const response = await axiosInstance.put("/profile", data);
        console.log("response", response);
        return unwrapApiResponseBody(response, "프로필 수정에 실패했습니다.");
    } catch (error) {
        console.log("updateProfile error:", error);
        throw normalizeApiError(error, "프로필 수정에 실패했습니다.");
    }
}

