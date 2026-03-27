import { axiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";

export async function fetchStores(params = {}) {
    try {
        const response = await axiosInstance.get("/v1/store-query/stores", {
            params,
        });

        return unwrapApiResponseBody(response, "스토어 데이터를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "스토어 목록 조회에 실패했습니다.");
    }
}

export async function fetchStoreDetail(storeId) {
    try {
        const response = await axiosInstance.get(`/v1/store-query/stores/${storeId}`);
        return unwrapApiResponseBody(response, "스토어 데이터를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "스토어 상세 조회에 실패했습니다.");
    }
}

export async function fetchMyStores() {
    try {
        const response = await axiosInstance.get("/v1/store-query/stores/me");
        return unwrapApiResponseBody(response, "내 스토어 목록을 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "내 스토어 목록 조회에 실패했습니다.");
    }
}
