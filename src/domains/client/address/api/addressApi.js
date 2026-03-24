import { axiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";

export async function fetchAddresses() {
    try {
        const response = await axiosInstance.get("/api/profile/addresses");
        return unwrapApiResponseBody(response, "배송지 목록을 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "배송지 목록 조회에 실패했습니다.");
    }
}

export async function createAddress(data) {
    try {
        const response = await axiosInstance.post("/api/profile/addresses", data);
        return unwrapApiResponseBody(response, "배송지 추가에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "배송지 추가 요청에 실패했습니다.");
    }
}

export async function updateAddress(addressId, data) {
    try {
        const response = await axiosInstance.put(`/api/profile/addresses/${addressId}`, data);
        return unwrapApiResponseBody(response, "배송지 수정에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "배송지 수정 요청에 실패했습니다.");
    }
}

export async function deleteAddress(addressId) {
    try {
        const response = await axiosInstance.delete(`/api/profile/addresses/${addressId}`);
        return unwrapApiResponseBody(response, "배송지 삭제에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "배송지 삭제 요청에 실패했습니다.");
    }
}

export async function setDefaultAddress(addressId) {
    try {
        const response = await axiosInstance.patch(`/api/profile/addresses/${addressId}/default`);
        return unwrapApiResponseBody(response, "기본 배송지 설정에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "기본 배송지 설정 요청에 실패했습니다.");
    }
}
