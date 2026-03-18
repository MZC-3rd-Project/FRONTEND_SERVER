const currencyFormatter = new Intl.NumberFormat("ko-KR");

export const COMMERCE_IMAGE_PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Crect width='1200' height='800' fill='%23f4f4f5'/%3E%3Ccircle cx='270' cy='220' r='70' fill='%23d4d4d8'/%3E%3Cpath d='M140 650 420 370l170 170 115-115 355 225H140Z' fill='%23e4e4e7'/%3E%3Ctext x='50%25' y='54%25' text-anchor='middle' fill='%2371717a' font-family='sans-serif' font-size='42'%3ECommerce Preview%3C/text%3E%3C/svg%3E";

export function toNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
}

export function toNullableNumber(value) {
    const number = Number(value);
    return Number.isFinite(number) ? number : null;
}

export function toText(value, fallback = "") {
    if (typeof value === "string" && value.trim()) {
        return value.trim();
    }

    return fallback;
}

export function parseDate(value) {
    if (!value) {
        return null;
    }

    if (value instanceof Date) {
        return Number.isNaN(value.getTime()) ? null : value;
    }

    const normalized = String(value).replace(" ", "T");
    const date = new Date(normalized);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function formatDateTimeLabel(value) {
    const date = parseDate(value);

    if (!date) {
        return value ? String(value) : "일정 미정";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export function formatPrice(value) {
    const number = toNullableNumber(value);

    if (number === null) {
        return value ? String(value) : "-";
    }

    return `${currencyFormatter.format(number)}원`;
}

export function formatPercent(value) {
    const number = toNumber(value, 0);
    const rounded = Math.round(number * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function computeLeftLabel(value) {
    const date = parseDate(value);

    if (!date) {
        return "일정 계산 중";
    }

    const diffMs = date.getTime() - Date.now();
    if (diffMs <= 0) {
        return "종료";
    }

    const totalSeconds = Math.floor(diffMs / 1000);
    const days = Math.floor(totalSeconds / 86_400);
    const hours = Math.floor((totalSeconds % 86_400) / 3_600);
    const minutes = Math.floor((totalSeconds % 3_600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
        return `${days}일 ${hours}시간 남음`;
    }

    if (hours > 0) {
        return `${hours}시간 ${minutes}분 남음`;
    }

    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function mapItemTypeLabel(itemType) {
    switch (String(itemType || "").toUpperCase()) {
        case "PRODUCT":
            return "상품";
        case "GOODS":
            return "굿즈";
        case "PERFORMANCE":
            return "공연";
        default:
            return itemType ? String(itemType) : "상품";
    }
}

export function mapStock(rawStock = {}, fallback = {}) {
    const optionStocks = Array.isArray(rawStock?.optionStocks)
        ? rawStock.optionStocks
            .map((optionStock) => ({
                itemOptionId: toNullableNumber(optionStock?.itemOptionId),
                availableQuantity: toNumber(optionStock?.availableQuantity, 0),
                soldOut: Boolean(optionStock?.soldOut),
            }))
            .filter((optionStock) => optionStock.itemOptionId !== null)
        : [];

    const availableQuantity = toNullableNumber(rawStock?.availableQuantity);
    const soldQuantity = toNullableNumber(rawStock?.soldQuantity);
    const fallbackAvailable = toNullableNumber(fallback?.availableQuantity);
    const fallbackSold = toNullableNumber(fallback?.soldQuantity);
    const soldOut = rawStock?.soldOut ?? fallback?.soldOut;

    return {
        availableQuantity: availableQuantity ?? fallbackAvailable ?? 0,
        soldQuantity: soldQuantity ?? fallbackSold ?? 0,
        soldOut: Boolean(soldOut),
        optionStocks,
    };
}

export function mapReviews(raw) {
    if (!Array.isArray(raw)) {
        return [];
    }

    return raw.map((review, index) => ({
        id: review?.id ?? `${review?.user ?? "reviewer"}-${index}`,
        user: toText(review?.user, "사용자"),
        rating: Math.max(0, Math.min(5, toNumber(review?.rating, 0))),
        comment: toText(review?.comment, "리뷰 내용이 없습니다."),
    }));
}

export function mapDetailSections(rawSections) {
    if (!Array.isArray(rawSections)) {
        return [];
    }

    return rawSections.map((section, index) => ({
        id: `${section?.id ?? section?.title ?? "section"}-${index}`,
        title: toText(section?.title, "상세 정보"),
        description: toText(section?.description, "상세 설명이 준비 중입니다."),
        image: toText(section?.image ?? section?.imageUrl, ""),
        highlights: Array.isArray(section?.highlights) ? section.highlights.filter(Boolean) : [],
    }));
}

export function mapStore(raw = {}, fallback = {}) {
    return {
        id: raw?.id ?? fallback?.id ?? null,
        name: toText(raw?.name ?? raw?.storeName, fallback?.name ?? "스토어 정보 준비 중"),
        tagline: toText(raw?.tagline ?? raw?.description, fallback?.tagline ?? ""),
    };
}

export function mapItem(raw = {}, fallback = {}) {
    const thumbnailUrl =
        toText(raw?.thumbnailUrl) ||
        toText(raw?.images?.thumbnail?.mediaUrl) ||
        toText(raw?.thumbnail?.mediaUrl) ||
        toText(fallback?.thumbnailUrl) ||
        "";

    return {
        id: raw?.id ?? raw?.itemId ?? fallback?.id ?? fallback?.itemId ?? null,
        itemType: toText(raw?.itemType ?? fallback?.itemType, "PRODUCT"),
        title: toText(raw?.title, fallback?.title ?? "상품 정보 준비 중"),
        summary: toText(raw?.summary, fallback?.summary ?? toText(raw?.description, "상품 요약이 준비 중입니다.")),
        description: toText(raw?.description, fallback?.description ?? "상세 설명이 준비 중입니다."),
        price: toNullableNumber(raw?.price ?? fallback?.price),
        priceText: formatPrice(raw?.price ?? fallback?.price),
        thumbnailUrl,
        features: Array.isArray(raw?.features) ? raw.features.filter(Boolean) : [],
        detailSections: mapDetailSections(raw?.detailSections),
        reviews: mapReviews(raw?.reviews ?? fallback?.reviews),
        options: Array.isArray(raw?.options) ? raw.options : [],
    };
}
