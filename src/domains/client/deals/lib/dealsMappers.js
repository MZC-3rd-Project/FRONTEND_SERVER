import {
    COMMERCE_IMAGE_PLACEHOLDER,
    computeLeftLabel,
    formatDateTimeLabel,
    formatPercent,
    formatPrice,
    mapItem,
    mapReviews,
    mapStock,
    mapStore,
    toId,
    toNullableNumber,
    toNumber,
    toText,
} from "@/domains/client/commerce/lib/commerceViewUtils";

function mapDealStatusLabel(status, soldOut) {
    const normalized = String(status || "").toUpperCase();

    if (soldOut) {
        return "품절";
    }

    switch (normalized) {
        case "ACTIVE":
        case "ON_SALE":
            return "진행중";
        case "ENDED":
        case "FINISHED":
            return "종료";
        case "SCHEDULED":
            return "오픈 예정";
        default:
            return status ? String(status) : "진행중";
    }
}

function computeDiscountRate(raw) {
    const explicit = toNullableNumber(raw?.discountRate);
    if (explicit !== null) {
        return explicit;
    }

    const originalPrice = toNullableNumber(raw?.originalPrice);
    const discountedPrice = toNullableNumber(raw?.discountedPrice);

    if (originalPrice === null || discountedPrice === null || originalPrice <= 0) {
        return 0;
    }

    return Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);
}

function computeProgressRate(raw) {
    const explicit = toNullableNumber(raw?.progressRate);
    if (explicit !== null) {
        return explicit;
    }

    const soldQuantity = toNumber(raw?.soldQuantity, 0);
    const maxQuantity = toNumber(raw?.maxQuantity, 0);

    if (maxQuantity <= 0) {
        return 0;
    }

    return Math.round((soldQuantity / maxQuantity) * 1000) / 10;
}

export const DEAL_IMAGE_PLACEHOLDER = COMMERCE_IMAGE_PLACEHOLDER;

export function mapHotDealListPayload(payload) {
    const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];

    return {
        items: items.map((deal) => {
            const originalPrice = toNullableNumber(deal?.originalPrice);
            const discountedPrice = toNullableNumber(deal?.discountedPrice ?? deal?.price);
            const remainingQuantity = toNullableNumber(deal?.remainingQuantity);
            const soldQuantity = toNullableNumber(deal?.soldQuantity);
            const maxQuantity = toNullableNumber(deal?.maxQuantity);
            const soldOut = remainingQuantity === 0;
            const discountRate = computeDiscountRate(deal);
            const progressRate = computeProgressRate(deal);

            return {
                id: toId(deal?.hotDealId ?? deal?.id),
                hotDealId: toId(deal?.hotDealId ?? deal?.id),
                itemId: toId(deal?.itemId),
                itemType: toText(deal?.itemType, "PRODUCT"),
                title: toText(deal?.title, "이름 없는 핫딜"),
                statusCode: toText(deal?.status, soldOut ? "ENDED" : "ACTIVE").toUpperCase(),
                status: mapDealStatusLabel(deal?.status, soldOut),
                thumbnailUrl: toText(deal?.thumbnailUrl, ""),
                originalPrice,
                originalPriceText: formatPrice(originalPrice),
                discountedPrice,
                discountedPriceText: formatPrice(discountedPrice),
                discountRate,
                discountLabel: `${discountRate}%`,
                leftLabel: toText(deal?.leftLabel, computeLeftLabel(deal?.endAt)),
                deadlineText: formatDateTimeLabel(deal?.endAt),
                remainingQuantity: remainingQuantity ?? 0,
                soldQuantity: soldQuantity ?? 0,
                maxQuantity: maxQuantity ?? 0,
                soldOut,
                progressRate,
                progressRateText: formatPercent(progressRate),
            };
        }),
        nextCursor: payload?.nextCursor ?? null,
    };
}

export function mapHotDealDetailPayload(raw = {}) {
    const item = mapItem(raw?.item, {
        itemId: toId(raw?.itemId),
        itemType: raw?.itemType,
        title: raw?.title,
        summary: raw?.summary,
        description: raw?.description,
        thumbnailUrl: raw?.thumbnailUrl,
        reviews: raw?.reviews,
    });

    const stock = raw?.stock
        ? mapStock(raw?.stock)
        : mapStock(
            {},
            {
                availableQuantity: raw?.remainingQuantity,
                soldQuantity: raw?.soldQuantity,
                soldOut: toNumber(raw?.remainingQuantity, 0) <= 0,
            }
        );
    const reviews = mapReviews(raw?.reviews ?? item.reviews);
    const originalPrice = toNullableNumber(raw?.originalPrice ?? raw?.price?.base);
    const discountedPrice = toNullableNumber(raw?.discountedPrice ?? raw?.price?.effective ?? raw?.price);
    const soldOut = stock.soldOut || stock.availableQuantity <= 0;
    const statusCode = toText(raw?.status, soldOut ? "ENDED" : "ACTIVE").toUpperCase();

    return {
        id: toId(raw?.hotDealId ?? raw?.id),
        hotDealId: toId(raw?.hotDealId ?? raw?.id),
        itemId: toId(raw?.itemId ?? item.id),
        itemType: toText(raw?.itemType ?? item.itemType, "PRODUCT"),
        salesChannel: toText(raw?.salesChannel, "HOT_DEAL"),
        title: toText(raw?.title, item.title),
        summary: toText(raw?.summary, item.summary || raw?.description),
        category: toText(raw?.category, "카테고리 정보 준비 중"),
        statusCode,
        status: mapDealStatusLabel(raw?.status, soldOut),
        thumbnailUrl: toText(raw?.thumbnailUrl, item.thumbnailUrl),
        originalPrice,
        originalPriceText: formatPrice(originalPrice),
        discountedPrice,
        discountedPriceText: formatPrice(discountedPrice),
        discountRate: computeDiscountRate(raw),
        discountLabel: `${computeDiscountRate(raw)}%`,
        leftLabel: toText(raw?.leftLabel, computeLeftLabel(raw?.endAt)),
        deadlineText: formatDateTimeLabel(raw?.endAt),
        maxPerUser: toNullableNumber(raw?.maxPerUser),
        remainingQuantity: toNumber(raw?.remainingQuantity ?? stock.availableQuantity, 0),
        soldQuantity: toNumber(raw?.soldQuantity ?? stock.soldQuantity, 0),
        maxQuantity: toNumber(raw?.maxQuantity, 0),
        progressRate: computeProgressRate(raw),
        progressRateText: formatPercent(computeProgressRate(raw)),
        store: mapStore(raw?.store, { name: raw?.storeName }),
        stock,
        item: {
            ...item,
            thumbnailUrl: item.thumbnailUrl || toText(raw?.thumbnailUrl, ""),
            reviews,
        },
        reviews,
        checkout: raw?.checkout ?? {
            entryType: "SALES_CHECKOUT",
            itemId: toId(raw?.itemId ?? item.id),
            hotDealId: toId(raw?.hotDealId ?? raw?.id),
        },
        canPurchase: !soldOut && statusCode !== "ENDED" && statusCode !== "FINISHED",
    };
}
