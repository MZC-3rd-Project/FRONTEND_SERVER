import { isNumericId, toIdString } from "@/common/utils/id";

function normalizeQuantity(value, fallback = 1) {
    const number = Number(value);

    if (!Number.isFinite(number) || number < 1) {
        return fallback;
    }

    return Math.floor(number);
}

function assertNumericId(value, label) {
    const id = toIdString(value);

    if (!isNumericId(id)) {
        throw new Error(`${label}가 없어 장바구니에 담을 수 없습니다.`);
    }

    return id;
}

function resolveDefaultOptionReference({ stock, item, fallbackReferenceId }) {
    const activeOptionStock = Array.isArray(stock?.optionStocks)
        ? stock.optionStocks.find((optionStock) => optionStock?.itemOptionId && !optionStock?.soldOut) ??
          stock.optionStocks.find((optionStock) => optionStock?.itemOptionId)
        : null;

    if (activeOptionStock?.itemOptionId) {
        return {
            referenceId: assertNumericId(activeOptionStock.itemOptionId, "옵션 ID"),
            stockItemType: "ITEM_OPTION",
        };
    }

    const firstOption = Array.isArray(item?.options)
        ? item.options.find((option) => toIdString(option?.id))
        : null;

    if (firstOption?.id) {
        return {
            referenceId: assertNumericId(firstOption.id, "옵션 ID"),
            stockItemType: "ITEM_OPTION",
        };
    }

    if (fallbackReferenceId) {
        return {
            referenceId: assertNumericId(fallbackReferenceId, "옵션 ID"),
            stockItemType: "ITEM_OPTION",
        };
    }

    throw new Error("선택 가능한 옵션 정보가 없어 장바구니에 담을 수 없습니다.");
}

function createCartAddPayload({
    itemId,
    referenceId,
    channelType,
    channelRefId,
    stockItemType = "ITEM_OPTION",
    quantity = 1,
}) {
    const normalizedChannelType = String(channelType || "").trim().toUpperCase();

    if (!normalizedChannelType) {
        throw new Error("판매 채널 정보가 없어 장바구니에 담을 수 없습니다.");
    }

    return {
        itemId: assertNumericId(itemId, "상품 ID"),
        referenceId: assertNumericId(referenceId, "옵션 ID"),
        channelType: normalizedChannelType,
        channelRefId: channelRefId ? assertNumericId(channelRefId, "채널 참조 ID") : undefined,
        stockItemType,
        quantity: normalizeQuantity(quantity),
        selected: true,
    };
}

export function buildSaleCartItemInput(sale, { quantity = 1 } = {}) {
    const saleStatus = String(sale?.statusCode ?? sale?.status ?? "").trim().toUpperCase();

    if (saleStatus && saleStatus !== "ON_SALE") {
        throw new Error("일반판매 상태의 상품만 장바구니에 담을 수 있습니다.");
    }

    const optionIdentity = resolveDefaultOptionReference({
        stock: sale?.stock,
        item: sale?.item,
        fallbackReferenceId: sale?.checkout?.referenceId,
    });

    return createCartAddPayload({
        itemId: sale?.itemId ?? sale?.item?.id,
        referenceId: optionIdentity.referenceId,
        channelType: sale?.salesChannel ?? "NORMAL",
        stockItemType: optionIdentity.stockItemType,
        quantity,
    });
}

export function buildDealCartItemInput(deal, { quantity = 1 } = {}) {
    const optionIdentity = resolveDefaultOptionReference({
        stock: deal?.stock,
        item: deal?.item,
        fallbackReferenceId: deal?.checkout?.referenceId,
    });

    return createCartAddPayload({
        itemId: deal?.itemId ?? deal?.item?.id,
        referenceId: optionIdentity.referenceId,
        channelType: deal?.salesChannel ?? "HOT_DEAL",
        channelRefId: deal?.checkout?.hotDealId ?? deal?.hotDealId,
        stockItemType: optionIdentity.stockItemType,
        quantity,
    });
}

export function buildFundingRewardCartItemInput(campaign, reward, { quantity = 1 } = {}) {
    const referenceId = reward?.itemOptionId ?? reward?.id;

    return createCartAddPayload({
        itemId: campaign?.itemId ?? campaign?.item?.id,
        referenceId,
        channelType: campaign?.salesChannel ?? "FUNDING",
        channelRefId: campaign?.checkout?.campaignId ?? campaign?.id,
        stockItemType: "ITEM_OPTION",
        quantity,
    });
}
