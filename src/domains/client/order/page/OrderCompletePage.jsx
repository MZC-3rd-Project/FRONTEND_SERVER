import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router";
import { AlertCircle, CheckCircle2, Loader2, ReceiptText, Truck } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/domains/client/common/utils/format.js";
import { useOrderDetailQuery } from "@/domains/client/order/query/useOrderQueries";
import { useConfirmPayment } from "@/domains/client/payment/query/usePaymentQueries";

function OrderCompletePage() {
    const [params] = useSearchParams();
    const orderId = params.get("orderId") ?? "";
    const fallbackAmount = Number(params.get("amount") ?? 0);
    const paymentKey = params.get("paymentKey") ?? "";

    // 결제 확인 API 호출 (토스 리다이렉트 후 1회만 실행)
    const confirmMutation = useConfirmPayment();
    const confirmedRef = useRef(false);

    useEffect(() => {
        if (paymentKey && orderId && fallbackAmount > 0 && !confirmedRef.current) {
            confirmedRef.current = true;
            confirmMutation.mutate({
                paymentKey,
                orderId,
                amount: fallbackAmount,
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paymentKey, orderId, fallbackAmount]);

    // 결제 확인 완료 후 주문 상세 조회
    const { data: order, isLoading: isOrderLoading } = useOrderDetailQuery(orderId);

    const isConfirming = confirmMutation.isPending;
    const confirmError = confirmMutation.error;
    const isLoading = isConfirming || isOrderLoading;

    const displayAmount = order?.totalAmount ?? fallbackAmount;
    const displayPayment = order?.paymentMethod ?? "토스페이먼츠";
    const displayStatus = order?.statusLabel ?? (isConfirming ? "결제 확인 중..." : "결제완료");
    const orderItems = order?.items ?? [];

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <section className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6 text-emerald-900 shadow-[0_14px_45px_rgba(16,185,129,0.15)] sm:p-8 dark:border-emerald-300/30 dark:bg-emerald-400/10 dark:text-emerald-100">
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">Payment Success</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">
                    {isConfirming ? "결제를 확인하고 있습니다..." : "결제가 완료되었습니다"}
                </h2>
                <p className="mt-2 text-sm">
                    {isConfirming
                        ? "토스페이먼츠 결제 승인을 처리 중입니다. 잠시만 기다려 주세요."
                        : "주문이 정상 접수되었고, 배송/티켓 발급 상태는 주문내역에서 확인할 수 있습니다."}
                </p>
            </section>

            {/* 결제 확인 에러 */}
            {confirmError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>결제 승인 실패</AlertTitle>
                    <AlertDescription>
                        {confirmError?.message ?? "결제 승인 중 오류가 발생했습니다. 주문 상세에서 상태를 확인해 주세요."}
                    </AlertDescription>
                </Alert>
            )}

            {isLoading ? (
                <div className="grid place-items-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <p className="mt-2 text-sm text-muted-foreground">
                        {isConfirming ? "결제 승인 처리 중..." : "주문 정보를 불러오는 중..."}
                    </p>
                </div>
            ) : (
                <>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                                주문 정보
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>주문번호</span>
                                <span className="font-semibold text-foreground">{orderId}</span>
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>결제금액</span>
                                <span className="font-semibold text-foreground">{formatPrice(displayAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>결제수단</span>
                                <span className="font-semibold text-foreground">{displayPayment}</span>
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>주문상태</span>
                                <span className="font-semibold text-foreground">{displayStatus}</span>
                            </div>
                            {paymentKey && (
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span>결제 키</span>
                                    <span className="max-w-[200px] truncate font-mono text-xs text-foreground">
                                        {paymentKey}
                                    </span>
                                </div>
                            )}

                            {orderItems.length > 0 && (
                                <div className="space-y-2 pt-2">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                        주문 상품
                                    </p>
                                    {orderItems.slice(0, 3).map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-center gap-3 rounded-xl border border-border bg-muted p-3"
                                        >
                                            {item.thumbnail && (
                                                <img
                                                    src={item.thumbnail}
                                                    alt={item.name}
                                                    className="h-12 w-12 rounded-lg object-cover"
                                                />
                                            )}
                                            <div className="min-w-0 flex-1">
                                                <p className="line-clamp-1 text-sm font-semibold text-foreground">
                                                    {item.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.option} · x{item.quantity}
                                                </p>
                                            </div>
                                            <p className="text-sm font-semibold text-foreground">
                                                {formatPrice(item.unitPrice * item.quantity)}
                                            </p>
                                        </div>
                                    ))}
                                    {orderItems.length > 3 && (
                                        <p className="text-xs text-muted-foreground">
                                            외 {orderItems.length - 3}건
                                        </p>
                                    )}
                                </div>
                            )}

                            <div className="rounded-xl border border-border bg-muted p-3 text-xs text-muted-foreground">
                                티켓형 상품은 결제 즉시 마이페이지에서 확인 가능하며, 재고형 상품은 발송 후 송장 정보가 업데이트됩니다.
                            </div>
                        </CardContent>
                    </Card>

                    {order && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">결제 상세</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span>상품 금액</span>
                                    <span>{order.subtotalText}</span>
                                </div>
                                {order.discountAmount > 0 && (
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span>할인</span>
                                        <span className="text-primary">- {order.discountAmountText}</span>
                                    </div>
                                )}
                                {order.usedPoint > 0 && (
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span>포인트</span>
                                        <span className="text-primary">- {order.usedPointText}</span>
                                    </div>
                                )}
                                <div className="flex items-center justify-between text-muted-foreground">
                                    <span>배송비</span>
                                    <span>{order.shippingFeeText}</span>
                                </div>
                                <div className="my-1 h-px bg-border" />
                                <div className="flex items-center justify-between text-base font-bold text-foreground">
                                    <span>총 결제금액</span>
                                    <span>{order.totalAmountText}</span>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            <section className="grid gap-3 sm:grid-cols-2">
                <Card>
                    <CardContent className="p-4 text-sm">
                        <p className="inline-flex items-center gap-1 font-semibold text-foreground">
                            <ReceiptText className="h-4 w-4 text-primary" />
                            주문내역 확인
                        </p>
                        <p className="mt-1 text-muted-foreground">주문 상태, 결제 정보, 취소/교환 신청을 한 곳에서 확인하세요.</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-sm">
                        <p className="inline-flex items-center gap-1 font-semibold text-foreground">
                            <Truck className="h-4 w-4 text-primary" />
                            배송 상태 추적
                        </p>
                        <p className="mt-1 text-muted-foreground">송장 번호 연동 시 실시간 배송 위치와 도착 예정일을 제공합니다.</p>
                    </CardContent>
                </Card>
            </section>

            <div className="flex flex-wrap gap-2">
                <Button asChild className="rounded-full px-5">
                    <Link to={`/my/orders/${orderId}`}>주문 상세 보기</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-5">
                    <Link to="/my/orders">주문내역 이동</Link>
                </Button>
                <Button asChild variant="ghost" className="rounded-full px-5">
                    <Link to="/">홈으로 이동</Link>
                </Button>
            </div>
        </div>
    );
}

export default OrderCompletePage;
