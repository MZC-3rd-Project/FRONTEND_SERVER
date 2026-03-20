import { bffAxiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";
import { encodeIdPathSegment } from "@/common/utils/id";

export async function fetchCatalogItems(params = {}) {
    try {
        const response = await bffAxiosInstance.get("/bff/v1/catalog/items", {
            params,
        });

        return unwrapApiResponseBody(response, "검색 결과를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "검색 결과 조회에 실패했습니다.");
    }
}

export async function fetchCatalogItemDetail({
    itemId,
    itemType,
    salesChannel,
    hotDealId,
    campaignId,
}) {
    try {
        const response = await bffAxiosInstance.get(
            `/bff/v1/catalog/items/${encodeIdPathSegment(itemId)}/detail`,
            {
                params: {
                    itemType,
                    salesChannel,
                    ...(hotDealId ? { hotDealId } : {}),
                    ...(campaignId ? { campaignId } : {}),
                },
            }
        );

        return unwrapApiResponseBody(response, "검색 상세 정보를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "검색 상세 조회에 실패했습니다.");
    }
}
