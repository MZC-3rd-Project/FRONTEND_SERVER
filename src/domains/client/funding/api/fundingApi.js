import { bffAxiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";
import { encodeIdPathSegment } from "@/common/utils/id";

export async function fetchFundingCampaigns(params = {}) {
    try {
        const response = await bffAxiosInstance.get("/bff/v1/funding/campaigns", {
            params,
        });

        return unwrapApiResponseBody(response, "펀딩 데이터를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "펀딩 목록 조회에 실패했습니다.");
    }
}

export async function fetchFundingCampaignDetail(campaignId) {
    try {
        const response = await bffAxiosInstance.get(`/bff/v1/funding/campaigns/${encodeIdPathSegment(campaignId)}`);
        return unwrapApiResponseBody(response, "펀딩 데이터를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "펀딩 상세 조회에 실패했습니다.");
    }
}
