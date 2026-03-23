import { formatPrice } from "@/domains/client/common/utils/format.js";

function toNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

function toText(value, fallback = "") {
    return typeof value === "string" ? value.trim() : fallback;
}

export function mapCheckoutQuotePayload(raw) {
    if (!raw) return null;

    const items = Array.isArray(raw.items) ? raw.items.map(mapCheckoutItem) : [];
    const subtotal = toNumber(raw.subtotal ?? raw.totalProductAmount);
    const shippingFee = toNumber(raw.shippingFee ?? raw.deliveryFee);
    const discountAmount = toNumber(raw.discountAmount);
    const totalAmount = toNumber(raw.totalAmount, subtotal + shippingFee - discountAmount);

    return {
        orderId: toText(raw.orderId),
        items,
        subtotal,
        subtotalText: formatPrice(subtotal),
        shippingFee,
        shippingFeeText: formatPrice(shippingFee),
        discountAmount,
        discountAmountText: formatPrice(discountAmount),
        totalAmount,
        totalAmountText: formatPrice(totalAmount),
    };
}

function mapCheckoutItem(raw) {
    return {
        id: toText(raw.id ?? raw.itemId ?? raw.cartItemId),
        name: toText(raw.name ?? raw.productName ?? raw.itemName),
        option: toText(raw.option ?? raw.optionName),
        thumbnail: toText(raw.thumbnail ?? raw.thumbnailUrl ?? raw.imageUrl),
        storeName: toText(raw.storeName),
        quantity: toNumber(raw.quantity, 1),
        unitPrice: toNumber(raw.unitPrice ?? raw.price),
        totalPrice: toNumber(raw.totalPrice ?? raw.unitPrice * raw.quantity),
    };
}

export function mapReservationPayload(raw) {
    if (!raw) return null;

    return {
        orderId: toText(raw.orderId),
        reservedAt: toText(raw.reservedAt ?? raw.createdAt),
        expiresAt: toText(raw.expiresAt),
        items: Array.isArray(raw.items) ? raw.items.map(mapCheckoutItem) : [],
    };
}

export function mapSubmitPayload(raw) {
    if (!raw) return null;

    return {
        orderId: toText(raw.orderId),
        status: toText(raw.status, "PAYMENT_PENDING"),
        totalAmount: toNumber(raw.totalAmount),
    };
}
