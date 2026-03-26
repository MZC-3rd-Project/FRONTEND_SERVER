import { axiosInstance, bffAxiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";

export async function fetchOrders(params = {}) {
    try {
        const response = await axiosInstance.get("/v1/orders", { params });
        return unwrapApiResponseBody(response, "주문 목록을 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "주문 목록 조회에 실패했습니다.");
    }
}

export async function fetchOrderDetail(orderId) {
    try {
        const response = await bffAxiosInstance.get(`/bff/v1/orders/${orderId}`);
        return unwrapApiResponseBody(response, "주문 정보를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "주문 상세 조회에 실패했습니다.");
    }
}

export async function cancelOrder(orderId) {
    try {
        const response = await axiosInstance.post(`/v1/orders/${orderId}/cancel`);
        return unwrapApiResponseBody(response, "주문 취소에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "주문 취소 요청에 실패했습니다.");
    }
}

export async function refundOrder(orderId) {
    try {
        const response = await axiosInstance.post(`/v1/orders/${orderId}/refund`);
        return unwrapApiResponseBody(response, "환불 요청에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "환불 요청에 실패했습니다.");
    }
}
