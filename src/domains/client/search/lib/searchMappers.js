import {
    COMMERCE_IMAGE_PLACEHOLDER,
    formatPrice,
    mapItemTypeLabel,
    toId,
    toNullableNumber,
    toNumber,
    toText,
} from "@/domains/client/commerce/lib/commerceViewUtils";

const CHANNEL_LABELS = {
    NORMAL: "판매",
    HOT_DEAL: "핫딜",
    FUNDING: "펀딩",
};

const STATUS_LABELS = {
    ON_SALE: "판매중",
    HOT_DEAL: "핫딜 진행중",
    FUNDING: "진행중",
    FUNDED: "완료",
    FUND_FAILED: "실패",
    SOLD_OUT: "품절",
    CLOSED: "종료",
    HIDDEN: "숨김",
};

function mapChannelLabel(salesChannel) {
    return CHANNEL_LABELS[salesChannel] ?? toText(salesChannel, "상품");
}

function mapStatusLabel(statusCode) {
    return STATUS_LABELS[statusCode] ?? toText(statusCode, "상태 미정");
}

export function mapCatalogItem(raw = {}) {
    const itemId = toId(raw?.itemId);
    const itemType = toText(raw?.itemType, "PRODUCT").toUpperCase();
    const salesChannel = toText(raw?.salesChannel, "NORMAL").toUpperCase();
    const statusCode = toText(raw?.status, "ON_SALE").toUpperCase();
    const basePrice = toNullableNumber(raw?.price?.base ?? raw?.basePrice);
    const effectivePrice = toNullableNumber(raw?.price?.effective ?? raw?.effectivePrice ?? raw?.price);
    const resolvedPrice = effectivePrice ?? basePrice;

    return {
        id: itemId,
        itemId,
        title: toText(raw?.title, "이름 없는 상품"),
        itemType,
        itemTypeLabel: mapItemTypeLabel(itemType),
        salesChannel,
        channelLabel: mapChannelLabel(salesChannel),
        statusCode,
        statusLabel: mapStatusLabel(statusCode),
        basePrice,
        effectivePrice: resolvedPrice,
        priceText: formatPrice(resolvedPrice),
        stock: toNullableNumber(raw?.stock),
        availableStock: toNullableNumber(raw?.availableStock),
        thumbnailMediaId: toId(raw?.thumbnailMediaId),
        thumbnailUrl: toText(raw?.thumbnailUrl, COMMERCE_IMAGE_PLACEHOLDER),
        activeHotDealId: toId(raw?.activeHotDealId),
        activeCampaignId: toId(raw?.activeCampaignId),
        detailTargetType: toText(raw?.detailTarget?.type),
        detailTargetPath: toText(raw?.detailTarget?.path),
    };
}

export function mapCatalogSearchPayload(payload = {}) {
    const items = Array.isArray(payload?.items) ? payload.items : [];

    return {
        items: items.map(mapCatalogItem),
        nextCursor: payload?.nextCursor ?? null,
        totalCount: toNullableNumber(payload?.totalCount),
    };
}

export function mapStoreSearchPayload(payload = {}) {
    const items = Array.isArray(payload?.items) ? payload.items : [];

    return {
        items: items.map((store) => ({
            id: toId(store?.id ?? store?.storeId),
            storeId: toId(store?.id ?? store?.storeId),
            name: toText(store?.name ?? store?.storeName, "이름 없는 스토어"),
            description: toText(store?.description, "스토어 소개가 준비 중입니다."),
            ownerNickname: toText(store?.ownerNickname, "운영자 정보 준비 중"),
            contactValue: toText(store?.contactValue, "연락처 준비 중"),
            address: toText(store?.address, "주소 준비 중"),
            statusCode: toText(store?.status, "").toUpperCase(),
            statusLabel: toText(store?.status, "상태 미정"),
            thumbnailUrl: toText(store?.thumbnail?.mediaUrl ?? store?.thumbnailUrl, COMMERCE_IMAGE_PLACEHOLDER),
        })),
        nextCursor: payload?.nextCursor ?? null,
        totalCount: toNullableNumber(payload?.totalCount),
    };
}

export function isSearchCriteriaActive({
    keyword = "",
    category = "전체",
    status = "전체",
}) {
    return Boolean(String(keyword || "").trim()) || category !== "전체" || status !== "전체";
}

export function mapFundingStatusLabelToQueryStatus(statusLabel) {
    switch (statusLabel) {
        case "진행중":
            return ["FUNDING"];
        case "완료":
            return ["FUNDED"];
        case "실패":
            return ["FUND_FAILED"];
        default:
            return [];
    }
}

export function mapSalesStatusLabelToQueryStatus(statusLabel) {
    switch (statusLabel) {
        case "판매중":
            return ["ON_SALE"];
        case "품절":
            return ["SOLD_OUT"];
        case "종료":
            return ["CLOSED"];
        default:
            return [];
    }
}

export function getSearchStatusOptions(scope) {
    switch (scope) {
        case "funding":
            return ["전체", "진행중", "완료", "실패"];
        case "sales":
            return ["전체", "판매중", "품절", "종료"];
        default:
            return ["전체"];
    }
}

export function mapScopeStatusLabelToQueryStatus(scope, statusLabel) {
    switch (scope) {
        case "funding":
            return mapFundingStatusLabelToQueryStatus(statusLabel);
        case "sales":
            return mapSalesStatusLabelToQueryStatus(statusLabel);
        default:
            return [];
    }
}

export function mapSalesTypeLabelToItemType(typeLabel) {
    switch (typeLabel) {
        case "상품":
            return "PRODUCT";
        case "굿즈":
            return "GOODS";
        case "공연":
            return "PERFORMANCE";
        default:
            return null;
    }
}

export function mapStoreStatusLabelToQueryStatus(statusLabel) {
    switch (statusLabel) {
        case "운영중":
            return "ACTIVE";
        case "비활성":
            return "INACTIVE";
        case "중지":
            return "SUSPENDED";
        default:
            return null;
    }
}

export function formatCatalogMeta(item) {
    const parts = [];

    if (item.availableStock !== null) {
        parts.push(`구매 가능 ${toNumber(item.availableStock, 0)}개`);
    } else if (item.stock !== null) {
        parts.push(`재고 ${toNumber(item.stock, 0)}개`);
    }

    if (item.basePrice !== null && item.effectivePrice !== null && item.basePrice > item.effectivePrice) {
        parts.push(`정가 ${formatPrice(item.basePrice)}`);
    }

    return parts;
}
