import { formatPrice } from "@/domains/client/common/utils/format.js";
import { STORE_IMAGE_PLACEHOLDER } from "@/domains/client/store/lib/storeMappers";
import { findStoreProduct } from "@/domains/client/store/mock/storeData.js";

export function mapStoreItemRouteProductType(itemType) {
    return String(itemType || "").toUpperCase() === "PERFORMANCE" ? "ticket" : "stock";
}

export function resolveStorePreviewProduct(store, item) {
    const productType = mapStoreItemRouteProductType(item?.itemType);
    const resolved = findStoreProduct(String(store?.id ?? ""), productType, String(item?.id ?? ""));

    if (resolved) {
        return {
            ...resolved,
            isSummaryFallback: false,
        };
    }

    return {
        productType,
        isSummaryFallback: true,
        store: {
            id: store?.id ?? "",
            name: store?.name ?? "스토어 정보 준비 중",
            tagline: store?.description ?? "스토어 소개 준비 중",
            rating: 0,
            reviewCount: 0,
            soldSummary: [],
        },
        product: {
            id: item?.id ?? "",
            name: item?.title ?? "상품 정보 준비 중",
            thumbnail: item?.thumbnailUrl || STORE_IMAGE_PLACEHOLDER,
            price: item?.priceText || formatPrice(item?.price),
            stock: null,
            status: item?.status ?? "상태 미정",
            category: item?.itemTypeLabel ?? item?.itemType ?? "상품",
            reviews: [],
            tiers: [],
            eventDate: "일정 정보 준비 중",
            venue: "장소 정보 준비 중",
        },
    };
}
