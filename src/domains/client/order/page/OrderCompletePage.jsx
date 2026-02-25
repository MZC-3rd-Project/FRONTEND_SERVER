import { Link, useSearchParams } from "react-router";
import { CheckCircle2, ReceiptText, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/domains/client/common/utils/format.js";

function OrderCompletePage() {
    const [params] = useSearchParams();
    const orderId = params.get("orderId") ?? "DM-DEMO-0001";
    const amount = Number(params.get("amount") ?? 0);

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <section className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6 text-emerald-900 shadow-[0_14px_45px_rgba(16,185,129,0.15)] sm:p-8 dark:border-emerald-300/30 dark:bg-emerald-400/10 dark:text-emerald-100">
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">Payment Success</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">결제가 완료되었습니다</h2>
                <p className="mt-2 text-sm">주문이 정상 접수되었고, 배송/티켓 발급 상태는 주문내역에서 확인할 수 있습니다.</p>
            </section>

            <Card className="border-zinc-200/80 bg-white/95">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        주문 정보
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                    <div className="flex items-center justify-between text-zinc-600">
                        <span>주문번호</span>
                        <span className="font-semibold text-zinc-900">{orderId}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-600">
                        <span>결제금액</span>
                        <span className="font-semibold text-zinc-900">{formatPrice(amount)}</span>
                    </div>
                    <div className="flex items-center justify-between text-zinc-600">
                        <span>결제수단</span>
                        <span className="font-semibold text-zinc-900">토스페이먼츠</span>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs text-zinc-600">
                        티켓형 상품은 결제 즉시 마이페이지에서 확인 가능하며, 재고형 상품은 발송 후 송장 정보가 업데이트됩니다.
                    </div>
                </CardContent>
            </Card>

            <section className="grid gap-3 sm:grid-cols-2">
                <Card className="border-zinc-200/80 bg-white/95">
                    <CardContent className="p-4 text-sm">
                        <p className="inline-flex items-center gap-1 font-semibold text-zinc-900">
                            <ReceiptText className="h-4 w-4 text-cyan-700" />
                            주문내역 확인
                        </p>
                        <p className="mt-1 text-zinc-600">주문 상태, 결제 정보, 취소/교환 신청을 한 곳에서 확인하세요.</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200/80 bg-white/95">
                    <CardContent className="p-4 text-sm">
                        <p className="inline-flex items-center gap-1 font-semibold text-zinc-900">
                            <Truck className="h-4 w-4 text-cyan-700" />
                            배송 상태 추적
                        </p>
                        <p className="mt-1 text-zinc-600">송장 번호 연동 시 실시간 배송 위치와 도착 예정일을 제공합니다.</p>
                    </CardContent>
                </Card>
            </section>

            <div className="flex flex-wrap gap-2">
                <Button asChild className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
                    <Link to={`/my/orders/${orderId}`}>주문 상세 보기</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-zinc-300 bg-white px-5 text-zinc-700 hover:bg-zinc-100">
                    <Link to="/my/orders">주문내역 이동</Link>
                </Button>
                <Button asChild variant="ghost" className="rounded-full px-5 text-zinc-700 hover:bg-zinc-100">
                    <Link to="/">홈으로 이동</Link>
                </Button>
            </div>
        </div>
    );
}

export default OrderCompletePage;
