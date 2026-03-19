import { formatPrice, toId, toText } from "@/domains/client/commerce/lib/commerceViewUtils";

export const STORE_IMAGE_PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Crect width='1200' height='800' fill='%23f4f4f5'/%3E%3Crect x='160' y='160' width='880' height='480' rx='36' fill='%23e4e4e7'/%3E%3Cpath d='M250 560 430 390l120 120 90-80 210 130H250Z' fill='%23d4d4d8'/%3E%3Ctext x='50%25' y='54%25' text-anchor='middle' fill='%2371717a' font-family='sans-serif' font-size='42'%3EStore Preview%3C/text%3E%3C/svg%3E";

function mapStoreStatus(status) {
    switch (String(status || "").toUpperCase()) {
        case "ACTIVE":
            return "운영중";
        case "INACTIVE":
            return "비활성";
        case "SUSPENDED":
            return "중지";
        default:
            return status ? String(status) : "상태 미정";
    }
}

function mapItemTypeLabel(itemType) {
    switch (String(itemType || "").toUpperCase()) {
        case "PRODUCT":
            return "상품";
        case "GOODS":
            return "굿즈";
        case "PERFORMANCE":
            return "공연";
        default:
            return itemType ? String(itemType) : "기타";
    }
}

function mapStoreImage(raw) {
    return {
        mediaId: toId(raw?.mediaId),
        mediaUrl: toText(raw?.mediaUrl),
        imageType: toText(raw?.imageType),
        sortOrder: Number.isFinite(Number(raw?.sortOrder)) ? Number(raw?.sortOrder) : 0,
    };
}

function mapStoreItem(raw) {
    const itemType = toText(raw?.itemType, "PRODUCT").toUpperCase();

    return {
        id: toId(raw?.itemId ?? raw?.id),
        sellerId: toId(raw?.sellerId),
        title: toText(raw?.title, "상품 정보 준비 중"),
        price: raw?.price ?? null,
        priceText: formatPrice(raw?.price),
        itemType,
        itemTypeLabel: mapItemTypeLabel(itemType),
        status: toText(raw?.status, "상태 미정"),
        thumbnailMediaId: toId(raw?.thumbnailMediaId),
        thumbnailUrl: toText(raw?.thumbnailUrl),
    };
}

export function mapStoreListPayload(payload) {
    const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];

    return {
        items: items.map((store) => ({
            id: toId(store?.storeId ?? store?.id),
            userId: toId(store?.userId),
            name: toText(store?.storeName, "이름 없는 스토어"),
            statusCode: toText(store?.status, ""),
            status: mapStoreStatus(store?.status),
            description: toText(store?.description, "스토어 소개가 준비 중입니다."),
            contactValue: toText(store?.contactValue, "연락처 준비 중"),
            address: toText(store?.address, "주소 준비 중"),
            ownerNickname: toText(store?.ownerNickname, "운영자 정보 준비 중"),
            thumbnail: mapStoreImage(store?.thumbnail),
            thumbnailUrl: toText(store?.thumbnail?.mediaUrl),
        })),
        nextCursor: payload?.nextCursor ?? null,
        hasNext: Boolean(payload?.hasNext ?? payload?.nextCursor),
        totalCount: payload?.totalCount ?? null,
    };
}

export function mapStoreDetailPayload(raw = {}) {
    const thumbnail = mapStoreImage(raw?.images?.thumbnail);
    const gallery = Array.isArray(raw?.images?.gallery) ? raw.images.gallery.map(mapStoreImage) : [];
    const items = Array.isArray(raw?.items) ? raw.items.map(mapStoreItem) : [];

    const groupedItems = {
        PRODUCT: items.filter((item) => item.itemType === "PRODUCT"),
        GOODS: items.filter((item) => item.itemType === "GOODS"),
        PERFORMANCE: items.filter((item) => item.itemType === "PERFORMANCE"),
    };

    return {
        id: toId(raw?.storeId ?? raw?.id),
        userId: toId(raw?.userId),
        name: toText(raw?.storeName, "이름 없는 스토어"),
        statusCode: toText(raw?.status, ""),
        status: mapStoreStatus(raw?.status),
        description: toText(raw?.description, "스토어 소개가 준비 중입니다."),
        address: toText(raw?.address, "주소 준비 중"),
        addressType: toText(raw?.addressType),
        contactValue: toText(raw?.contactValue, "연락처 준비 중"),
        contactType: toText(raw?.contactType),
        ownerNickname: toText(raw?.ownerNickname, "운영자 정보 준비 중"),
        ownerProfileImageUrl: toText(raw?.ownerProfileImageUrl),
        activeItemCount: Number.isFinite(Number(raw?.activeItemCount)) ? Number(raw?.activeItemCount) : items.length,
        latestItemUpdatedAt: raw?.latestItemUpdatedAt ?? null,
        images: {
            thumbnail,
            gallery,
            all: [thumbnail, ...gallery].filter((image) => image.mediaUrl),
        },
        items,
        groupedItems,
    };
}
