const CART_CHECKOUT_RESERVATION_STORAGE_KEY = "cart-checkout-reservation";
const HOT_DEAL_CHECKOUT_RESERVATION_STORAGE_KEY = "hotdeal-checkout-reservation";

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
