import {emailSchema,verifyCodeSchema,profileSchema} from "@/domains/client/profile/actions/schema/schema.js";
import {confirmEmailVerify, requestEmailVerify, updateProfile} from "@/domains/client/profile/api/profileApi.js";

/** 프로필 저장 액션 */
export async function saveProfileAction(prevState, formData) {
    const nickname = formData.get("nickname");
    const phone = formData.get("phone");
    const delivery = formData.get("delivery");

    // 1. Zod 검증
    const result = profileSchema.safeParse({ nickname, phone, delivery });

    if (!result.success) {
        return { ...prevState, errors: result.error.flatten().fieldErrors, serverError: null };
    }

    // 2. API 호출
    try {
        await updateProfile(result.data);
        console.log("저장할 데이터:", result.data);
        return { success: true, errors: {}, serverError: null };
    } catch (error) {
        return { ...prevState, errors: {}, serverError: error.message ?? "프로필 저장에 실패했습니다." };
    }
}

/** 인증번호 확인 액션 */
export async function confirmCodeAction(prevState, formData) {
    const email = formData.get("email");
    const code = formData.get("code");

    // 1. Zod 검증
    const result = verifyCodeSchema.safeParse({ code });
    if (!result.success) {
        return { ...prevState, errors: result.error.flatten().fieldErrors, serverError: null };
    }

    // 2. API 호출
    try {
        await confirmEmailVerify({ email, code });
        return { success: true, errors: {}, serverError: null };
    } catch (error) {
        return { ...prevState, errors: {}, serverError: error.message ?? "인증번호 확인에 실패했습니다." };
    }
}


/** 인증번호 요청 액션 */
export async function requestCodeAction(prevState, formData) {
    const email = formData.get("email");

    // 1. Zod 검증
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
        return { ...prevState, errors: result.error.flatten().fieldErrors, serverError: null };
    }

    // 2. API 호출
    try {
        await requestEmailVerify(email);
        return { success: true, errors: {}, serverError: null };
    } catch (error) {
        return { ...prevState, errors: {}, serverError: error.message ?? "인증번호 발송에 실패했습니다." };
    }
}