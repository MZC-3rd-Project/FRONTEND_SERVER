import { formatPrice } from "@/domains/client/common/utils/format.js";
import { toIdString } from "@/common/utils/id";

function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

function toNullableNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

function toText(value, fallback = "") {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }

    return fallback;
}

function mapChannelTypeLabel(channelType) {
    switch (String(channelType || "").toUpperCase()) {
        case "HOT_DEAL":
            return "핫딜";
        case "FUNDING":
            return "펀딩";
        case "NORMAL":
            return "일반판매";
        default:
            return channelType ? String(channelType) : "상품";
    }
}

export function buildCartLineKey(lineItem = {}) {
    return [
        toIdString(lineItem?.itemId),
        toIdString(lineItem?.referenceId),
        String(lineItem?.channelType ?? ""),
        toIdString(lineItem?.channelRefId),
    ].join(":");
}

function buildCartItemSubtitle(item) {
    const parts = [];

    if (item.storeName) {
        parts.push(item.storeName);
    }

    if (item.channelTypeLabel) {
        parts.push(item.channelTypeLabel);
    }

    if (item.salesStatus) {
        parts.push(item.salesStatus);
    }

    parts.push(`수량 ${item.quantity}`);

    return parts.join(" · ");
}

export function mapCartItem(raw = {}) {
    const itemId = toIdString(raw?.itemId);
    const referenceId = toIdString(raw?.referenceId);
    const channelType = toText(raw?.channelType, "NORMAL").toUpperCase();
    const channelRefId = toIdString(raw?.channelRefId);
    const quantity = Math.max(1, toNumber(raw?.quantity, 1));
    const unitPrice = Math.max(0, toNumber(raw?.displayPrice, 0));
    const totalPrice = unitPrice * quantity;

    const item = {
        lineKey: buildCartLineKey({
            itemId,
            referenceId,
            channelType,
            channelRefId,
        }),
        itemId,
        referenceId,
        channelType,
        channelTypeLabel: mapChannelTypeLabel(channelType),
        channelRefId,
        stockItemType: toText(raw?.stockItemType, "ITEM_OPTION"),
        quantity,
        selected: Boolean(raw?.selected),
        storeId: toIdString(raw?.storeId),
        itemTitle: toText(raw?.itemTitle, "상품 정보 준비 중"),
        thumbnailUrl: toText(raw?.thumbnailUrl, ""),
        storeName: toText(raw?.storeName, "스토어 정보 준비 중"),
        unitPrice,
        unitPriceText: formatPrice(unitPrice),
        totalPrice,
        totalPriceText: formatPrice(totalPrice),
        salesStatus: toText(raw?.salesStatus, ""),
        updatedAt: toText(raw?.updatedAt, ""),
        expiresAtEpoch: toNullableNumber(raw?.expiresAtEpoch),
    };

    return {
        ...item,
        subtitle: buildCartItemSubtitle(item),
    };
}

export function mapCartPayload(payload = {}) {
    const items = Array.isArray(payload?.items) ? payload.items.map(mapCartItem) : [];
    const totalPrice = items.reduce((sum, item) => sum + item.totalPrice, 0);
    const selectedItems = items.filter((item) => item.selected);
    const selectedTotalPrice = selectedItems.reduce((sum, item) => sum + item.totalPrice, 0);

    return {
        itemCount: toNumber(payload?.itemCount, items.length),
        selectedItemCount: toNumber(payload?.selectedItemCount, selectedItems.length),
        items,
        totalPrice,
        totalPriceText: formatPrice(totalPrice),
        selectedItems,
        selectedTotalPrice,
        selectedTotalPriceText: formatPrice(selectedTotalPrice),
        isEmpty: items.length === 0,
    };
}
