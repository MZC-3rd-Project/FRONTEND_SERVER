import { Link, useSearchParams } from "react-router";
import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const reasonMessages = {
    PAY_PROCESS_ERROR: "결제 처리 중 오류가 발생했습니다.",
    CARD_DECLINED: "카드 승인이 거절되었습니다.",
    USER_CANCELED: "사용자가 결제를 취소했습니다.",
};

function OrderFailPage() {
    const [params] = useSearchParams();
    const orderId = params.get("orderId") ?? "DM-DEMO-0001";
    const code = params.get("code") ?? "PAY_PROCESS_ERROR";

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <section className="rounded-3xl border border-rose-200 bg-rose-50/80 p-6 text-rose-900 shadow-[0_14px_45px_rgba(244,63,94,0.15)] sm:p-8 dark:border-rose-300/30 dark:bg-rose-400/10 dark:text-rose-100">
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">Payment Failed</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">결제에 실패했습니다</h2>
                <p className="mt-2 text-sm">{reasonMessages[code] ?? "알 수 없는 오류가 발생했습니다."}</p>
            </section>

            <Card className="border-zinc-200/80 bg-white/95">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
                        <AlertTriangle className="h-4 w-4 text-rose-600" />
                        오류 정보
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-zinc-600">
                    <div className="flex items-center justify-between">
                        <span>주문번호</span>
                        <span className="font-semibold text-zinc-900">{orderId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>오류 코드</span>
                        <span className="font-semibold text-zinc-900">{code}</span>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs">
                        반복 실패 시 다른 결제 수단을 선택하거나, 카드 한도/계좌 잔액을 확인한 뒤 다시 시도해 주세요.
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
                <Button asChild className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
                    <Link to="/checkout">
                        <RefreshCw className="h-4 w-4" />
                        결제 다시 시도
                    </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-zinc-300 bg-white px-5 text-zinc-700 hover:bg-zinc-100">
                    <Link to="/cart">장바구니로 이동</Link>
                </Button>
                <Button asChild variant="ghost" className="rounded-full px-5 text-zinc-700 hover:bg-zinc-100">
                    <Link to="/">홈으로 이동</Link>
                </Button>
            </div>
        </div>
    );
}

export default OrderFailPage;
