import {
    COMMERCE_IMAGE_PLACEHOLDER,
    formatPrice,
    mapItem,
    mapItemTypeLabel,
    mapReviews,
    mapStock,
    mapStore,
    toId,
    toNullableNumber,
    toText,
} from "@/domains/client/commerce/lib/commerceViewUtils";

function mapSaleStatusLabel(status) {
    switch (String(status || "").toUpperCase()) {
        case "ON_SALE":
            return "판매중";
        case "SOLD_OUT":
            return "품절";
        case "ENDED":
            return "종료";
        case "PAUSED":
            return "일시중지";
        default:
            return status ? String(status) : "상태 미정";
    }
}

export const SALES_IMAGE_PLACEHOLDER = COMMERCE_IMAGE_PLACEHOLDER;

export function mapNormalSaleListPayload(payload) {
    const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];

    return {
        items: items.map((item) => {
            const basePrice = toNullableNumber(item?.price?.base ?? item?.basePrice);
            const effectivePrice = toNullableNumber(
                item?.price?.effective ?? item?.effectivePrice ?? item?.price
            );
            const statusCode = toText(item?.status, "ON_SALE").toUpperCase();
            const stock = toNullableNumber(item?.stock);
            const saleId = toId(item?.saleId ?? item?.id ?? item?.itemId);

            return {
                id: saleId,
                saleId,
                itemId: toId(item?.itemId ?? item?.saleId ?? item?.id),
                title: toText(item?.title, "이름 없는 일반판매 상품"),
                category: toText(item?.category, "기타"),
                itemType: toText(item?.itemType, "PRODUCT"),
                itemTypeLabel: mapItemTypeLabel(item?.itemType),
                salesChannel: toText(item?.salesChannel, "NORMAL"),
                statusCode,
                status: mapSaleStatusLabel(statusCode),
                price: effectivePrice,
                priceText: formatPrice(effectivePrice),
                basePrice,
                basePriceText: basePrice !== null && basePrice !== effectivePrice ? formatPrice(basePrice) : null,
                thumbnailUrl: toText(item?.thumbnailUrl, ""),
                stock: stock ?? 0,
                soldOut: stock === 0 || statusCode === "SOLD_OUT" || statusCode === "ENDED",
                activeCampaignId: toId(item?.activeCampaignId ?? item?.campaignId),
                storeName: toText(item?.storeName, ""),
            };
        }),
        nextCursor: payload?.nextCursor ?? null,
        totalCount: payload?.totalCount ?? null,
    };
}

export function mapNormalSaleDetailPayload(raw = {}) {
    const saleId = toId(raw?.saleId ?? raw?.id ?? raw?.itemId);
    const stock = mapStock(raw?.stock);
    const item = mapItem(raw?.item, {
        itemId: toId(raw?.itemId),
        itemType: raw?.itemType,
        title: raw?.title,
        summary: raw?.summary,
        description: raw?.description,
        thumbnailUrl: raw?.thumbnailUrl,
        price: raw?.price,
        reviews: raw?.reviews,
    });
    const reviews = mapReviews(raw?.reviews ?? item.reviews);
    const statusCode = toText(raw?.status, "ON_SALE").toUpperCase();

    return {
        id: saleId,
        saleId,
        itemId: toId(raw?.itemId ?? raw?.saleId ?? raw?.id),
        itemType: toText(raw?.itemType ?? item.itemType, "PRODUCT"),
        itemTypeLabel: mapItemTypeLabel(raw?.itemType ?? item.itemType),
        salesChannel: toText(raw?.salesChannel, "NORMAL"),
        title: toText(raw?.title, item.title),
        summary: toText(raw?.summary, item.summary),
        category: toText(raw?.category, "카테고리 정보 준비 중"),
        statusCode,
        status: mapSaleStatusLabel(statusCode),
        thumbnailUrl: toText(raw?.thumbnailUrl, item.thumbnailUrl),
        price: toNullableNumber(raw?.price ?? item.price),
        priceText: formatPrice(raw?.price ?? item.price),
        store: mapStore(raw?.store, { name: raw?.storeName }),
        stock,
        originFunding: null,
        item: {
            ...item,
            thumbnailUrl: item.thumbnailUrl || toText(raw?.thumbnailUrl, ""),
            reviews,
        },
        reviews,
        checkout: raw?.checkout ?? null,
        canPurchase: !stock.soldOut && statusCode !== "ENDED",
        storeName: toText(raw?.storeName, ""),
    };
}
