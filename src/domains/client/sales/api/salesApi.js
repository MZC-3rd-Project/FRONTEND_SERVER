import { bffAxiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";
import { encodeIdPathSegment } from "@/common/utils/id";

export async function fetchNormalSales(params = {}) {
    try {
        const response = await bffAxiosInstance.get("/bff/v1/catalog/items", {
            params: {
                itemType: "PRODUCT",
                channel: "NORMAL",
                ...params,
            },
        });

        return unwrapApiResponseBody(response, "일반판매 목록을 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "일반판매 목록 조회에 실패했습니다.");
    }
}

export async function fetchNormalSaleDetail({
    itemId,
    itemType = "PRODUCT",
    salesChannel = "NORMAL",
}) {
    try {
        const response = await bffAxiosInstance.get(
            `/bff/v1/catalog/items/${encodeIdPathSegment(itemId)}/detail`,
            {
                params: {
                    itemType,
                    salesChannel,
                },
            }
        );

        return unwrapApiResponseBody(response, "일반판매 상세를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "일반판매 상세 조회에 실패했습니다.");
    }
}
