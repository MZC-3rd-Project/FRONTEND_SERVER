import { axiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";

/**
 * 토스페이먼츠 결제 승인 확인 요청
 * 토스 결제 성공 리다이렉트 후 paymentKey, orderId, amount를 백엔드로 전달하여 최종 승인 처리
 */
export async function confirmPayment({ paymentKey, orderId, amount }) {
    try {
        const response = await axiosInstance.post("/v1/payments/confirm", {
            paymentKey,
            orderId,
            amount: Number(amount),
        });
        return unwrapApiResponseBody(response, "결제 승인에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "결제 승인 요청에 실패했습니다.");
    }
}
