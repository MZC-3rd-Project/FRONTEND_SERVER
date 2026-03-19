import { axiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";
import { toIdString } from "@/common/utils/id";

function normalizeCartLineIdentity(payload = {}) {
    return {
        itemId: toIdString(payload?.itemId),
        referenceId: toIdString(payload?.referenceId),
        channelType: String(payload?.channelType ?? ""),
        channelRefId: payload?.channelRefId ? toIdString(payload.channelRefId) : undefined,
    };
}

function normalizeCartAddPayload(payload = {}) {
    return {
        ...normalizeCartLineIdentity(payload),
        stockItemType: String(payload?.stockItemType ?? ""),
        quantity: Number(payload?.quantity ?? 1),
        selected: payload?.selected ?? true,
    };
}

export async function fetchCart() {
    try {
        const response = await axiosInstance.get("/v1/cart");

        return unwrapApiResponseBody(response, "장바구니를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "장바구니 조회에 실패했습니다.");
    }
}

export async function addCartItem(payload) {
    try {
        const response = await axiosInstance.post("/v1/cart/items", normalizeCartAddPayload(payload));

        return unwrapApiResponseBody(response, "장바구니에 상품을 담지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "장바구니 담기에 실패했습니다.");
    }
}

export async function updateCartItemQuantity(payload) {
    try {
        const response = await axiosInstance.patch("/v1/cart/items/quantity", {
            ...normalizeCartLineIdentity(payload),
            quantity: Number(payload?.quantity ?? 1),
        });

        return unwrapApiResponseBody(response, "장바구니 수량을 변경하지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "장바구니 수량 변경에 실패했습니다.");
    }
}

export async function changeCartSelection(lineItems = []) {
    try {
        const response = await axiosInstance.patch("/v1/cart/items/selection", {
            lineItems: lineItems.map((lineItem) => ({
                ...normalizeCartLineIdentity(lineItem),
                selected: Boolean(lineItem?.selected),
            })),
        });

        return unwrapApiResponseBody(response, "장바구니 선택 상태를 변경하지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "장바구니 선택 상태 변경에 실패했습니다.");
    }
}

export async function removeCartItem(payload) {
    try {
        const response = await axiosInstance.delete("/v1/cart/items", {
            data: normalizeCartLineIdentity(payload),
        });

        return unwrapApiResponseBody(response, "장바구니 상품을 삭제하지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "장바구니 삭제에 실패했습니다.");
    }
}
