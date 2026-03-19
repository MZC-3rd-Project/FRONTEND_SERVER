import { Link, useSearchParams } from "react-router";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const reasonMessages = {
    // 결제 관련
    PAY_PROCESS_ERROR: "결제 처리 중 오류가 발생했습니다.",
    CARD_DECLINED: "카드 승인이 거절되었습니다.",
    USER_CANCELED: "사용자가 결제를 취소했습니다.",
    // SALES 서비스 에러
    "SALES-003": "잘못된 요청입니다.",
    "SALES-100": "체크아웃 세션을 찾을 수 없습니다.",
    "SALES-101": "체크아웃 세션이 만료되었습니다. 다시 시도해 주세요.",
    "SALES-102": "이미 처리된 체크아웃입니다.",
    "SALES-200": "상품 정보를 찾을 수 없습니다.",
    "SALES-201": "판매가 종료된 상품입니다.",
    "SALES-202": "구매 수량이 제한을 초과했습니다.",
    "SALES-203": "재고가 부족합니다. 수량을 조정한 뒤 다시 시도해 주세요.",
    "SALES-204": "예약이 만료되었습니다. 다시 시도해 주세요.",
};

const RETRYABLE_CODES = new Set([
    "PAY_PROCESS_ERROR",
    "SALES-101",
    "SALES-203",
    "SALES-204",
]);

function OrderFailPage() {
    const [params] = useSearchParams();
    const orderId = params.get("orderId") ?? "";
    const code = params.get("code") ?? "PAY_PROCESS_ERROR";
    const message = params.get("message") ?? "";

    const displayMessage =
        reasonMessages[code] ?? (message || "알 수 없는 오류가 발생했습니다.");
    const canRetry = RETRYABLE_CODES.has(code);

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <section className="rounded-3xl border border-rose-200 bg-rose-50/80 p-6 text-rose-900 shadow-[0_14px_45px_rgba(244,63,94,0.15)] sm:p-8 dark:border-rose-300/30 dark:bg-rose-400/10 dark:text-rose-100">
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">Payment Failed</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">결제에 실패했습니다</h2>
                <p className="mt-2 text-sm">{displayMessage}</p>
            </section>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        오류 정보
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    {orderId && (
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>주문번호</span>
                            <span className="font-semibold text-foreground">{orderId}</span>
                        </div>
                    )}
                    <div className="flex items-center justify-between text-muted-foreground">
                        <span>오류 코드</span>
                        <span className="font-semibold text-foreground">{code}</span>
                    </div>
                    <div className="rounded-xl border border-border bg-muted p-3 text-xs text-muted-foreground">
                        {canRetry
                            ? "일시적 오류일 수 있습니다. 잠시 후 다시 시도해 주세요."
                            : "반복 실패 시 다른 결제 수단을 선택하거나, 카드 한도/계좌 잔액을 확인한 뒤 다시 시도해 주세요."}
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
                <Button asChild className="rounded-full px-5">
                    <Link to="/checkout">
                        <RefreshCw className="h-4 w-4" />
                        결제 다시 시도
                    </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-5">
                    <Link to="/cart">장바구니로 이동</Link>
                </Button>
                <Button asChild variant="ghost" className="rounded-full px-5">
                    <Link to="/">홈으로 이동</Link>
                </Button>
            </div>
        </div>
    );
}

export default OrderFailPage;
