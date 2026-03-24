import { axiosInstance, bffAxiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";
import { encodeIdPathSegment } from "@/common/utils/id";

const HOT_DEAL_REQUEST_CONFIG = {
    skipAuthRedirect: true,
};

const isDev = import.meta.env.DEV;
const proxyTarget = import.meta.env.VITE_API_PROXY_TARGET;
const useDevProxy = isDev && Boolean(proxyTarget);
const defaultHotDealBaseURL = isDev ? "http://localhost:8071/api" : "/api";
const hotDealBaseURL = useDevProxy
    ? "/api"
    : (import.meta.env.VITE_API_URL || defaultHotDealBaseURL);

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
            const response = await bffAxiosInstance.get(`/bff/v1/catalog/items/${encodeIdPathSegment(itemId)}/detail`, {
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
        const response = await bffAxiosInstance.get(`/bff/v1/hot-deals/${encodeIdPathSegment(hotDealId)}`);
        return unwrapApiResponseBody(response, "핫딜 상세를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "핫딜 상세 조회에 실패했습니다.");
    }
}

export async function enterHotDealQueue(hotDealId) {
    try {
        const response = await axiosInstance.post(
            `/v1/hot-deals/${encodeIdPathSegment(hotDealId)}/queue/enter`,
            undefined,
            HOT_DEAL_REQUEST_CONFIG
        );

        return unwrapApiResponseBody(response, "핫딜 대기열 입장에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "핫딜 대기열 입장에 실패했습니다.");
    }
}

export async function fetchHotDealQueueStatus(hotDealId) {
    try {
        const response = await axiosInstance.get(
            `/v1/hot-deals/${encodeIdPathSegment(hotDealId)}/queue`,
            HOT_DEAL_REQUEST_CONFIG
        );

        return unwrapApiResponseBody(response, "핫딜 대기열 상태를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "핫딜 대기열 상태 조회에 실패했습니다.");
    }
}

export async function purchaseHotDeal(hotDealId, { quantity = 1, token } = {}) {
    try {
        const response = await axiosInstance.post(
            `/v1/hot-deals/${encodeIdPathSegment(hotDealId)}/purchase`,
            {
                quantity,
                ...(token ? { token } : {}),
            },
            HOT_DEAL_REQUEST_CONFIG
        );

        return unwrapApiResponseBody(response, "핫딜 구매 요청에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "핫딜 구매 요청에 실패했습니다.");
    }
}

export function buildHotDealQueueSseUrl(hotDealId, baseOrigin) {
    const origin = baseOrigin || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    const baseURL = hotDealBaseURL.replace(/\/$/, "");

    return new URL(
        `${baseURL}/v1/hot-deals/${encodeIdPathSegment(hotDealId)}/queue/stream`,
        origin
    ).toString();
}
