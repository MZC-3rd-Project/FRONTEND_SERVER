import { formatPrice } from "@/domains/client/common/utils/format.js";

function toNumber(value, fallback = 0) {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
}

function toText(value, fallback = "") {
    return typeof value === "string" ? value.trim() : fallback;
}

const ORDER_STATUS_MAP = {
    PAYMENT_PENDING: { label: "결제대기", className: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
    PAID: { label: "결제완료", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
    SHIPPING: { label: "배송중", className: "bg-primary/10 text-primary" },
    DELIVERED: { label: "배송완료", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    COMPLETED: { label: "구매확정", className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
    CANCELLED: { label: "주문취소", className: "bg-destructive/10 text-destructive" },
    REFUNDED: { label: "환불완료", className: "bg-destructive/10 text-destructive" },
};

export function mapOrderStatus(status) {
    return ORDER_STATUS_MAP[status] ?? { label: status ?? "알 수 없음", className: "bg-muted text-muted-foreground" };
}

export function canCancelOrder(status) {
    return status === "PAYMENT_PENDING";
}

export function canRefundOrder(status) {
    return ["PAID", "SHIPPING", "DELIVERED", "COMPLETED"].includes(status);
}

export function canWriteReview(status) {
    return ["DELIVERED", "COMPLETED"].includes(status);
}

function mapOrderItem(raw) {
    return {
        id: toText(raw.orderItemId ?? raw.id ?? raw.itemId),
        orderItemId: toText(raw.orderItemId ?? raw.id),
        itemId: toText(raw.itemId ?? raw.id),
        name: toText(raw.name ?? raw.productName ?? raw.itemName ?? raw.titleSnap ?? raw.title),
        option: toText(raw.option ?? raw.optionName ?? raw.itemTypeSnap),
        thumbnail: toText(raw.thumbnail ?? raw.thumbnailUrl ?? raw.imageUrl),
        storeName: toText(raw.storeName ?? raw.storeNameSnap),
        storeId: toText(raw.storeId),
        quantity: toNumber(raw.quantity, 1),
        unitPrice: toNumber(raw.unitPrice ?? raw.price ?? raw.priceSnap),
        lineAmount: toNumber(raw.lineAmount, toNumber(raw.unitPrice ?? raw.price ?? raw.priceSnap) * toNumber(raw.quantity, 1)),
    };
}

function mapShipping(raw) {
    if (!raw) return null;

    return {
        receiver: toText(raw.receiver ?? raw.recipientName),
        phone: toText(raw.phone ?? raw.recipientPhone),
        zipCode: toText(raw.zipCode ?? raw.postalCode),
        address1: toText(raw.address1 ?? raw.address ?? raw.roadAddress),
        address2: toText(raw.address2 ?? raw.detailAddress),
        message: toText(raw.message ?? raw.deliveryMessage),
        courier: toText(raw.courier ?? raw.carrierName),
        trackingNo: toText(raw.trackingNo ?? raw.trackingNumber),
    };
}

export function mapOrderListPayload(raw) {
    if (!raw) return { orders: [], totalCount: 0, page: 0, size: 10 };

    const content = Array.isArray(raw.content) ? raw.content : Array.isArray(raw) ? raw : [];

    return {
        orders: content.map(mapOrderSummary),
        totalCount: toNumber(raw.totalElements ?? raw.totalCount ?? content.length),
        page: toNumber(raw.number ?? raw.page),
        size: toNumber(raw.size, 10),
        totalPages: toNumber(raw.totalPages, 1),
    };
}

function mapOrderSummary(raw) {
    const status = mapOrderStatus(raw.status ?? raw.orderStatus);
    const totalAmount = toNumber(raw.totalAmount ?? raw.totalPrice);

    return {
        id: toText(raw.id ?? raw.orderId),
        status: raw.status ?? raw.orderStatus,
        statusLabel: status.label,
        statusClassName: status.className,
        orderedAt: toText(raw.orderedAt ?? raw.createdAt ?? raw.orderDate),
        totalAmount,
        totalAmountText: formatPrice(totalAmount),
        items: Array.isArray(raw.items ?? raw.orderItems) ? (raw.items ?? raw.orderItems).map(mapOrderItem) : [],
    };
}

export function mapOrderDetailPayload(raw) {
    if (!raw) return null;

    const status = mapOrderStatus(raw.status ?? raw.orderStatus);
    const totalAmount = toNumber(raw.totalAmount ?? raw.totalPrice);
    const discountAmount = toNumber(raw.discountAmount);
    const shippingFee = toNumber(raw.shippingFee ?? raw.deliveryFee);
    const usedPoint = toNumber(raw.usedPoint ?? raw.pointUsed);
    const subtotal = toNumber(raw.subtotal, totalAmount + discountAmount + usedPoint - shippingFee);

    return {
        id: toText(raw.id ?? raw.orderId),
        status: raw.status ?? raw.orderStatus,
        statusLabel: status.label,
        statusClassName: status.className,
        orderedAt: toText(raw.orderedAt ?? raw.createdAt ?? raw.orderDate),
        paymentMethod: toText(raw.paymentMethod, "토스페이먼츠"),
        items: Array.isArray(raw.items ?? raw.orderItems) ? (raw.items ?? raw.orderItems).map(mapOrderItem) : [],
        shipping: mapShipping(raw.shipping ?? raw.shipment ?? raw.shippingInfo ?? raw.deliveryInfo),
        subtotal,
        subtotalText: formatPrice(subtotal),
        discountAmount,
        discountAmountText: formatPrice(discountAmount),
        shippingFee,
        shippingFeeText: formatPrice(shippingFee),
        usedPoint,
        usedPointText: formatPrice(usedPoint),
        totalAmount,
        totalAmountText: formatPrice(totalAmount),
        timeline: Array.isArray(raw.timeline ?? raw.orderTimeline)
            ? (raw.timeline ?? raw.orderTimeline).map((step) => ({
                label: toText(step.label ?? step.status),
                at: toText(step.at ?? step.timestamp ?? step.createdAt),
                done: Boolean(step.done ?? step.completed ?? step.at),
            }))
            : [],
    };
}
