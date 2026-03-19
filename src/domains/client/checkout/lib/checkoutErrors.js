const SALES_ERROR_MESSAGES = {
    "SALES-003": "잘못된 요청입니다.",
    "SALES-100": "체크아웃 세션을 찾을 수 없습니다.",
    "SALES-101": "체크아웃 세션이 만료되었습니다.",
    "SALES-102": "이미 처리된 체크아웃입니다.",
    "SALES-200": "상품 정보를 찾을 수 없습니다.",
    "SALES-201": "판매가 종료된 상품입니다.",
    "SALES-202": "구매 수량이 제한을 초과했습니다.",
    "SALES-203": "재고가 부족합니다.",
    "SALES-204": "예약이 만료되었습니다. 다시 시도해 주세요.",
};

export function getCheckoutErrorMessage(error) {
    const code = error?.code;
    if (code && SALES_ERROR_MESSAGES[code]) {
        return SALES_ERROR_MESSAGES[code];
    }
    return error?.message || "주문 처리 중 오류가 발생했습니다.";
}

export function isStockInsufficient(error) {
    return error?.code === "SALES-203" || error?.status === 409;
}

export function isReservationExpired(error) {
    return error?.code === "SALES-204";
}

export function isSessionExpired(error) {
    return error?.code === "SALES-101";
}
