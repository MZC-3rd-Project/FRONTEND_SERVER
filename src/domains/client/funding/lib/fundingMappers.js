const currencyFormatter = new Intl.NumberFormat("ko-KR");

export const FUNDING_IMAGE_PLACEHOLDER =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1200 800'%3E%3Crect width='1200' height='800' fill='%23f4f4f5'/%3E%3Ccircle cx='270' cy='220' r='70' fill='%23d4d4d8'/%3E%3Cpath d='M140 650 420 370l170 170 115-115 355 225H140Z' fill='%23e4e4e7'/%3E%3Ctext x='50%25' y='54%25' text-anchor='middle' fill='%2371717a' font-family='sans-serif' font-size='42'%3EFunding Preview%3C/text%3E%3C/svg%3E";

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

function toId(value, fallback = null) {
    if (value === null || value === undefined) {
        return fallback;
    }

    const normalized = String(value).trim();
    return normalized ? normalized : fallback;
}

function parseDate(value) {
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

function formatDateTimeLabel(value) {
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

function formatPrice(value) {
    const number = toNullableNumber(value);
    if (number === null) {
        return value ? String(value) : "-";
    }

    return `${currencyFormatter.format(number)}원`;
}

function formatPercent(value) {
    const number = toNumber(value, 0);
    const rounded = Math.round(number * 10) / 10;
    return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

function computeProgressRate(raw) {
    const explicitRate = toNullableNumber(raw?.progressRate ?? raw?.progress);
    if (explicitRate !== null) {
        return explicitRate;
    }

    const currentAmount = toNumber(raw?.currentAmount, 0);
    const goalAmount = toNumber(raw?.goalAmount, 0);
    if (goalAmount <= 0) {
        return 0;
    }

    return Math.round((currentAmount / goalAmount) * 1000) / 10;
}

function mapFundingStatus(status) {
    switch (String(status || "").toUpperCase()) {
        case "ACTIVE":
            return "진행중";
        case "SUCCEEDED":
            return "완료";
        case "FAILED":
            return "실패";
        case "CANCELLED":
            return "취소";
        default:
            return status ? String(status) : "상태 미정";
    }
}

function mapStock(rawStock = {}) {
    const optionStocks = Array.isArray(rawStock.optionStocks)
        ? rawStock.optionStocks.map((optionStock) => ({
            itemOptionId: toId(optionStock?.itemOptionId),
            availableQuantity: toNumber(optionStock?.availableQuantity, 0),
            soldOut: Boolean(optionStock?.soldOut),
        }))
        : [];

    return {
        availableQuantity: toNumber(rawStock.availableQuantity, 0),
        soldQuantity: toNumber(rawStock.soldQuantity, 0),
        soldOut: Boolean(rawStock.soldOut),
        optionStocks,
    };
}

function resolveRewardSoldOut(optionStockMap, itemOptionId) {
    if (!itemOptionId) {
        return false;
    }

    return Boolean(optionStockMap.get(itemOptionId)?.soldOut);
}

function resolveRewardAvailableQuantity(optionStockMap, itemOptionId) {
    if (!itemOptionId) {
        return null;
    }

    return toNullableNumber(optionStockMap.get(itemOptionId)?.availableQuantity);
}

function mapRewardOptions(raw, item, stock) {
    const optionStockMap = new Map(
        (stock.optionStocks || []).map((optionStock) => [optionStock.itemOptionId, optionStock])
    );

    if (Array.isArray(raw?.rewardOptions) && raw.rewardOptions.length > 0) {
        return raw.rewardOptions.map((rewardOption) => {
            const price = toNullableNumber(rewardOption?.price);
            const itemOptionId = toId(rewardOption?.itemOptionId);

            return {
                id: toId(rewardOption?.id ?? itemOptionId, rewardOption?.title),
                title: toText(rewardOption?.title, "리워드"),
                shippingText: toText(rewardOption?.shippingText ?? rewardOption?.shipping, "발송 일정 추후 안내"),
                price,
                priceText: formatPrice(rewardOption?.price),
                itemOptionId,
                availableQuantity: resolveRewardAvailableQuantity(optionStockMap, itemOptionId),
                soldOut: resolveRewardSoldOut(optionStockMap, itemOptionId),
            };
        });
    }

    if (Array.isArray(item?.options) && item.options.length > 0) {
        const basePrice = toNumber(item.price, 0);

        return item.options.map((option) => {
            const itemOptionId = toId(option?.id);
            const additionalPrice = toNumber(option?.additionalPrice, 0);
            const totalPrice = basePrice + additionalPrice;

            return {
                id: toId(itemOptionId, option?.optionName),
                title: toText(option?.optionName, "옵션"),
                shippingText: "발송 일정 추후 안내",
                price: totalPrice,
                priceText: formatPrice(totalPrice),
                itemOptionId,
                availableQuantity: resolveRewardAvailableQuantity(optionStockMap, itemOptionId),
                soldOut: resolveRewardSoldOut(optionStockMap, itemOptionId),
            };
        });
    }

    return [];
}

function mapReviews(raw) {
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

function mapDetailSections(rawSections) {
    if (!Array.isArray(rawSections)) {
        return [];
    }

    return rawSections.map((section, index) => ({
        id: `${section?.title ?? "section"}-${index}`,
        title: toText(section?.title, "상세 정보"),
        description: toText(section?.description, "상세 설명이 준비 중입니다."),
        image: toText(section?.image ?? section?.imageUrl, ""),
        highlights: Array.isArray(section?.highlights) ? section.highlights.filter(Boolean) : [],
    }));
}

function mapStore(raw) {
    return {
        id: toId(raw?.id),
        name: toText(raw?.name, "스토어 정보 준비 중"),
        tagline: toText(raw?.tagline, "프로젝트를 운영하는 파트너 스토어"),
        rating: toNumber(raw?.rating, 0),
        reviewCount: toNumber(raw?.reviewCount, 0),
        soldSummary: Array.isArray(raw?.soldSummary) ? raw.soldSummary.filter(Boolean) : [],
    };
}

function mapItem(raw, fallback = {}) {
    const thumbnailUrl =
        toText(raw?.thumbnailUrl) ||
        toText(raw?.images?.thumbnail?.mediaUrl) ||
        toText(raw?.thumbnail?.mediaUrl) ||
        fallback.thumbnailUrl ||
        "";

    return {
        id: toId(raw?.id ?? fallback.itemId),
        title: toText(raw?.title, fallback.title || "상품 정보 준비 중"),
        summary: toText(raw?.summary, fallback.summary || toText(raw?.description, "상품 요약이 준비 중입니다.")),
        description: toText(raw?.description, "상세 설명이 준비 중입니다."),
        price: toNullableNumber(raw?.price),
        priceText: formatPrice(raw?.price),
        thumbnailUrl,
        features: Array.isArray(raw?.features) ? raw.features.filter(Boolean) : [],
        detailSections: mapDetailSections(raw?.detailSections),
        reviews: mapReviews(raw?.reviews ?? fallback.reviews),
        options: Array.isArray(raw?.options) ? raw.options : [],
    };
}

export function mapFundingCampaignListPayload(payload) {
    const items = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload) ? payload : [];

    return {
        items: items.map((campaign) => {
            const progressRate = computeProgressRate(campaign);

            return {
                id: toId(campaign?.campaignId ?? campaign?.id),
                title: toText(campaign?.title, "제목 없는 펀딩"),
                summary: toText(campaign?.summary, ""),
                category: toText(campaign?.category, "기타"),
                makerName: toText(campaign?.makerName, "메이커 정보 준비 중"),
                status: mapFundingStatus(campaign?.status),
                statusCode: toText(campaign?.status, ""),
                deadlineText: formatDateTimeLabel(campaign?.endAt),
                leftLabel: toText(campaign?.leftLabel, "일정 계산 중"),
                thumbnailUrl: toText(campaign?.thumbnailUrl, ""),
                supporterCount: toNumber(campaign?.supporterCount ?? campaign?.supporters, 0),
                progressRate,
                progressRateText: formatPercent(progressRate),
                currentAmount: toNumber(campaign?.currentAmount, 0),
                currentAmountText: formatPrice(campaign?.currentAmount),
                goalAmount: toNumber(campaign?.goalAmount, 0),
                goalAmountText: formatPrice(campaign?.goalAmount),
            };
        }),
        nextCursor: payload?.nextCursor ?? null,
    };
}

export function mapFundingCampaignDetailPayload(raw = {}) {
    const progressRate = computeProgressRate(raw);
    const stock = mapStock(raw?.stock);
    const store = mapStore(raw?.store ?? { name: raw?.makerName });
    const item = mapItem(raw?.item, {
        itemId: raw?.itemId,
        title: raw?.title,
        summary: raw?.summary,
        thumbnailUrl: toText(raw?.thumbnailUrl),
        reviews: raw?.reviews ?? raw?.productReviews,
    });
    const rewardOptions = mapRewardOptions(raw, item, stock);

    return {
        id: toId(raw?.campaignId ?? raw?.id),
        itemId: toId(raw?.itemId ?? raw?.item?.id),
        itemType: toText(raw?.itemType ?? raw?.item?.itemType, "PRODUCT"),
        salesChannel: toText(raw?.salesChannel, "FUNDING"),
        title: toText(raw?.title, item.title),
        summary: toText(raw?.summary, item.summary),
        category: toText(raw?.category, "기타"),
        makerName: toText(raw?.makerName, store.name),
        status: mapFundingStatus(raw?.status),
        statusCode: toText(raw?.status, ""),
        thumbnailUrl: toText(raw?.thumbnailUrl, item.thumbnailUrl),
        progressRate,
        progressRateText: formatPercent(progressRate),
        currentAmount: toNumber(raw?.currentAmount, 0),
        currentAmountText: formatPrice(raw?.currentAmount),
        goalAmount: toNumber(raw?.goalAmount, 0),
        goalAmountText: formatPrice(raw?.goalAmount),
        deadlineText: formatDateTimeLabel(raw?.endAt),
        leftLabel: toText(raw?.leftLabel, "일정 계산 중"),
        supporterCount: toNumber(raw?.supporterCount ?? raw?.supporters, 0),
        isSupportable: Boolean(raw?.isSupportable ?? String(raw?.status).toUpperCase() === "ACTIVE"),
        rewardOptions,
        store,
        stock,
        item: {
            ...item,
            title: item.title || toText(raw?.title, "상품 정보 준비 중"),
            thumbnailUrl: item.thumbnailUrl || toText(raw?.thumbnailUrl, ""),
            reviews: mapReviews(raw?.reviews ?? item.reviews),
        },
        checkout: raw?.checkout ?? null,
    };
}
