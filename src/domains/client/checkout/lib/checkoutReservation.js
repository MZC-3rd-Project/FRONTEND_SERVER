const CART_CHECKOUT_RESERVATION_STORAGE_KEY = "cart-checkout-reservation";
const HOT_DEAL_CHECKOUT_RESERVATION_STORAGE_KEY = "hotdeal-checkout-reservation";
const FUNDING_CHECKOUT_RESERVATION_STORAGE_KEY = "funding-checkout-reservation";

export function buildCheckoutIdempotencyKey() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }
    return `checkout-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function mapCartItemToCheckoutItem(item) {
    return {
        id: item.lineKey,
        kind: item.channelTypeLabel,
        storeId: item.storeId,
        storeName: item.storeName,
        name: item.itemTitle,
        option: item.salesStatus
            ? `${item.channelTypeLabel} · ${item.salesStatus}`
            : item.channelTypeLabel,
        thumbnail: item.thumbnailUrl,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
    };
}

export function buildCartCheckoutReservationPayload(selectedItems = []) {
    return {
        idempotencyKey: buildCheckoutIdempotencyKey(),
        lineItems: selectedItems.map((item) => ({
            itemId: item.itemId,
            referenceId: item.referenceId,
            channelType: item.channelType,
            channelRefId: item.channelRefId || null,
            stockItemType: item.stockItemType,
            quantity: item.quantity,
        })),
    };
}

export function createCartCheckoutReservationState({ reservation, selectedItems, idempotencyKey }) {
    return {
        orderId: reservation?.orderId ?? "",
        expiresAt: reservation?.expiresAt ?? null,
        reservedItems: reservation?.items ?? reservation?.reservedItems ?? [],
        checkoutItems: selectedItems.map(mapCartItemToCheckoutItem),
        idempotencyKey,
    };
}

export function readCartCheckoutReservation() {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const raw = window.sessionStorage.getItem(CART_CHECKOUT_RESERVATION_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function persistCartCheckoutReservation(reservation) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        if (!reservation) {
            window.sessionStorage.removeItem(CART_CHECKOUT_RESERVATION_STORAGE_KEY);
            return;
        }
        window.sessionStorage.setItem(CART_CHECKOUT_RESERVATION_STORAGE_KEY, JSON.stringify(reservation));
    } catch {
        // Ignore storage failures and keep checkout flow in-memory.
    }
}

export function clearCartCheckoutReservation() {
    persistCartCheckoutReservation(null);
}

export function createHotDealCheckoutReservationState({ reservation, deal, quantity, idempotencyKey }) {
    return {
        mode: "hotdeal",
        hotDealId: deal?.hotDealId ?? deal?.id ?? "",
        orderId: reservation?.orderId ?? "",
        expiresAt: reservation?.expiresAt ?? null,
        quantity,
        unitPrice: deal?.discountedPrice ?? 0,
        totalAmount: (deal?.discountedPrice ?? 0) * quantity,
        checkoutItems: [
            {
                id: `hotdeal-${deal?.hotDealId ?? deal?.id ?? ""}`,
                kind: "핫딜",
                storeId: deal?.store?.id ?? null,
                storeName: deal?.store?.name ?? "핫딜",
                name: deal?.title ?? "핫딜 상품",
                option: `핫딜 · 수량 ${quantity}개`,
                thumbnail: deal?.thumbnailUrl ?? deal?.item?.thumbnailUrl ?? "",
                quantity,
                unitPrice: deal?.discountedPrice ?? 0,
            },
        ],
        idempotencyKey,
        submitted: false,
    };
}

export function createFundingCheckoutReservationState({ reservation, campaign, reward, quantity = 1, idempotencyKey }) {
    const numericQuantity = Number.isFinite(Number(quantity)) && Number(quantity) > 0 ? Math.floor(Number(quantity)) : 1;
    const unitPrice = reward?.price ?? 0;

    return {
        mode: "funding",
        campaignId: campaign?.campaignId ?? campaign?.id ?? "",
        orderId: reservation?.orderId ?? "",
        expiresAt: reservation?.expiresAt ?? null,
        quantity: numericQuantity,
        unitPrice,
        totalAmount: unitPrice * numericQuantity,
        checkoutItems: [
            {
                id: `funding-${campaign?.campaignId ?? campaign?.id ?? ""}-${reward?.id ?? reward?.itemOptionId ?? "reward"}`,
                kind: "펀딩",
                storeId: campaign?.store?.id ?? null,
                storeName: campaign?.store?.name ?? "펀딩",
                name: reward?.title ?? campaign?.title ?? "펀딩 리워드",
                option: campaign?.title ?? "펀딩 참여",
                thumbnail: campaign?.thumbnailUrl ?? campaign?.item?.thumbnailUrl ?? "",
                quantity: numericQuantity,
                unitPrice,
            },
        ],
        idempotencyKey,
        submitted: false,
    };
}

export function readHotDealCheckoutReservation() {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const raw = window.sessionStorage.getItem(HOT_DEAL_CHECKOUT_RESERVATION_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function persistHotDealCheckoutReservation(reservation) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        if (!reservation) {
            window.sessionStorage.removeItem(HOT_DEAL_CHECKOUT_RESERVATION_STORAGE_KEY);
            return;
        }
        window.sessionStorage.setItem(HOT_DEAL_CHECKOUT_RESERVATION_STORAGE_KEY, JSON.stringify(reservation));
    } catch {
        // Ignore storage failures and keep checkout flow in-memory.
    }
}

export function clearHotDealCheckoutReservation() {
    persistHotDealCheckoutReservation(null);
}

export function readFundingCheckoutReservation() {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        const raw = window.sessionStorage.getItem(FUNDING_CHECKOUT_RESERVATION_STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function persistFundingCheckoutReservation(reservation) {
    if (typeof window === "undefined") {
        return;
    }

    try {
        if (!reservation) {
            window.sessionStorage.removeItem(FUNDING_CHECKOUT_RESERVATION_STORAGE_KEY);
            return;
        }
        window.sessionStorage.setItem(FUNDING_CHECKOUT_RESERVATION_STORAGE_KEY, JSON.stringify(reservation));
    } catch {
        // Ignore storage failures and keep checkout flow in-memory.
    }
}

export function clearFundingCheckoutReservation() {
    persistFundingCheckoutReservation(null);
}
