export function formatPrice(amount) {
    return `${amount.toLocaleString()}원`;
}

export function parsePriceText(value) {
    return Number(String(value ?? "").replace(/[^\d]/g, "")) || 0;
}

export function formatDateTime(value) {
    return value;
}
