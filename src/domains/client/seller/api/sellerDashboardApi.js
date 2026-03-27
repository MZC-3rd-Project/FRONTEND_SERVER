import { bffAxiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";

export async function fetchSellerDashboardOverview(params = {}) {
    try {
        const response = await bffAxiosInstance.get("/bff/v1/seller/dashboard/overview", {
            params,
        });

        return unwrapApiResponseBody(response, "판매분석 데이터를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "판매분석 조회에 실패했습니다.");
    }
}
