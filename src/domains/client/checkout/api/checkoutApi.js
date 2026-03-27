import { axiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";

export async function reserveCheckout(payload = {}) {
    try {
        const response = await axiosInstance.post("/v1/cart/checkout/reservations", payload);
        return unwrapApiResponseBody(response, "체크아웃 예약에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "체크아웃 예약 요청에 실패했습니다.");
    }
}

export async function reserveSalesCheckout(payload = {}) {
    try {
        const response = await axiosInstance.post("/v1/sales/checkout/reservations", payload);
        return unwrapApiResponseBody(response, "판매 체크아웃 예약에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "판매 체크아웃 예약 요청에 실패했습니다.");
    }
}

export async function fetchCheckoutQuote(orderId) {
    try {
        const response = await axiosInstance.post("/v1/sales/checkout/quotes", {
            orderId,
        });
        return unwrapApiResponseBody(response, "가격 정보를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "가격 견적 조회에 실패했습니다.");
    }
}

export async function submitCheckout({ orderId, recipientName, recipientPhone, deliveryAddressId, deliveryMemo }) {
    try {
        const response = await axiosInstance.post("/v1/sales/checkout/submit", {
            orderId,
            recipientName,
            recipientPhone,
            deliveryAddressId,
            deliveryMemo,
        });
        return unwrapApiResponseBody(response, "주문 확정에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "주문 확정 요청에 실패했습니다.");
    }
}

export async function cancelCheckout(orderId) {
    try {
        const response = await axiosInstance.post("/v1/sales/checkout/cancellations", {
            orderId,
        });
        return unwrapApiResponseBody(response, "체크아웃 취소에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "체크아웃 취소 요청에 실패했습니다.");
    }
}
