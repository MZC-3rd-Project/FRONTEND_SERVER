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
        const campaignResponse = await bffAxiosInstance.get(`/bff/v1/funding/campaigns/${encodeIdPathSegment(campaignId)}`);
        const campaignPayload = unwrapApiResponseBody(campaignResponse, "펀딩 데이터를 불러오지 못했습니다.");
        const itemId = campaignPayload?.itemId ?? campaignPayload?.item?.id;

        if (!itemId) {
            return campaignPayload;
        }

        const detailResponse = await bffAxiosInstance.get(
            `/bff/v1/catalog/items/${encodeIdPathSegment(itemId)}/detail`,
            {
                params: {
                    itemType: campaignPayload?.itemType ?? campaignPayload?.item?.itemType ?? "PRODUCT",
                    salesChannel: "FUNDING",
                    campaignId,
                },
            }
        );
        const detailPayload = unwrapApiResponseBody(detailResponse, "펀딩 데이터를 불러오지 못했습니다.");

        return {
            ...campaignPayload,
            ...detailPayload,
            id: detailPayload?.id ?? campaignPayload?.id ?? campaignId,
            campaignId:
                detailPayload?.campaignId
                ?? campaignPayload?.campaignId
                ?? campaignPayload?.id
                ?? campaignId,
            itemId: detailPayload?.itemId ?? campaignPayload?.itemId ?? campaignPayload?.item?.id,
            item: {
                ...(campaignPayload?.item && typeof campaignPayload.item === "object" ? campaignPayload.item : {}),
                ...(detailPayload?.item && typeof detailPayload.item === "object" ? detailPayload.item : {}),
            },
            store: detailPayload?.store ?? campaignPayload?.store,
        };
    } catch (error) {
        throw normalizeApiError(error, "펀딩 상세 조회에 실패했습니다.");
    }
}
