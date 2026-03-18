import { bffAxiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";

export async function fetchHotDeals(params = {}) {
    try {
        const response = await bffAxiosInstance.get("/bff/v1/hot-deals", {
            params,
        });

        return unwrapApiResponseBody(response, "핫딜 목록을 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "핫딜 목록 조회에 실패했습니다.");
    }
}

export async function fetchHotDealDetail({ hotDealId, itemId, itemType = "PRODUCT" }) {
    if (itemId) {
        try {
            const response = await bffAxiosInstance.get(`/bff/v1/catalog/items/${itemId}/detail`, {
                params: {
                    itemType,
                    salesChannel: "HOT_DEAL",
                    hotDealId,
                },
            });

            return unwrapApiResponseBody(response, "핫딜 상세를 불러오지 못했습니다.");
        } catch (error) {
            if (!hotDealId) {
                throw normalizeApiError(error, "핫딜 상세 조회에 실패했습니다.");
            }
        }
    }

    try {
        const response = await bffAxiosInstance.get(`/bff/v1/hot-deals/${hotDealId}`);
        return unwrapApiResponseBody(response, "핫딜 상세를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "핫딜 상세 조회에 실패했습니다.");
    }
}
