import { bffAxiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";

export async function fetchClosingSoonFundingCampaigns(params = {}) {
    try {
        const response = await bffAxiosInstance.get("/bff/v1/main/funding/closing-soon", {
            params,
        });

        return unwrapApiResponseBody(response, "마감 임박 펀딩 데이터를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "마감 임박 펀딩 조회에 실패했습니다.");
    }
}
