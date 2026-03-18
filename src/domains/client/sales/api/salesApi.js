import { bffAxiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";

export async function fetchNormalSales(params = {}) {
    try {
        const response = await bffAxiosInstance.get("/bff/v1/sales/products", {
            params,
        });

        return unwrapApiResponseBody(response, "일반판매 목록을 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "일반판매 목록 조회에 실패했습니다.");
    }
}

export async function fetchNormalSaleDetail(saleId) {
    try {
        const response = await bffAxiosInstance.get(`/bff/v1/sales/products/${saleId}`);

        return unwrapApiResponseBody(response, "일반판매 상세를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "일반판매 상세 조회에 실패했습니다.");
    }
}
