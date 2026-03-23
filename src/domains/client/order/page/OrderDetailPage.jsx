import { useState } from "react";
import { Link, useParams } from "react-router";
import { Loader2, PackageSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/domains/client/common/utils/format.js";
import {
    useOrderDetailQuery,
    useCancelOrderMutation,
    useRefundOrderMutation,
} from "@/domains/client/order/query/useOrderQueries";
import { canCancelOrder, canRefundOrder } from "@/domains/client/order/lib/orderMappers";

function OrderDetailPage() {
    const { orderId } = useParams();
    const { data: order, isLoading, isError, error } = useOrderDetailQuery(orderId);
    const cancelMutation = useCancelOrderMutation();
    const refundMutation = useRefundOrderMutation();

    const [showCancelConfirm, setShowCancelConfirm] = useState(false);
    const [showRefundConfirm, setShowRefundConfirm] = useState(false);

    const handleCancel = async () => {
        await cancelMutation.mutateAsync(orderId);
        setShowCancelConfirm(false);
    };

    const handleRefund = async () => {
        await refundMutation.mutateAsync(orderId);
        setShowRefundConfirm(false);
    };

    if (isLoading) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError || !order) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-foreground">주문 정보를 찾을 수 없습니다</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            {error?.message ?? "주문 정보를 불러올 수 없습니다."}
                        </p>
                        <Button asChild className="rounded-full px-5">
                            <Link to="/my/orders">주문내역으로 이동</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Order Detail</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">주문 상세</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    주문번호 <span className="font-semibold text-foreground">{order.id}</span> ·{" "}
                    {order.orderedAt}
                </p>
                <span
                    className={`mt-2 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${order.statusClassName}`}
                >
                    {order.statusLabel}
                </span>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                    {/* 주문 상품 */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">주문 상품</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {order.items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex gap-3 rounded-xl border border-border bg-muted p-3"
                                >
                                    <img
                                        src={item.thumbnail}
                                        alt={item.name}
                                        className="h-16 w-16 rounded-lg object-cover"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-muted-foreground">{item.storeName}</p>
                                        <p className="line-clamp-1 text-sm font-semibold text-foreground">
                                            {item.name}
                                        </p>
                                        <p className="line-clamp-1 text-xs text-muted-foreground">
                                            {item.option}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">x {item.quantity}</p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {formatPrice(item.unitPrice * item.quantity)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* 배송 정보 */}
                    {order.shipping && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-base">배송 정보</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm text-muted-foreground">
                                <p>
                                    수령인:{" "}
                                    <span className="text-foreground">{order.shipping.receiver}</span>
                                </p>
                                <p>
                                    연락처:{" "}
                                    <span className="text-foreground">{order.shipping.phone}</span>
                                </p>
                                <p>
                                    주소:{" "}
                                    <span className="text-foreground">
                                        ({order.shipping.zipCode}) {order.shipping.address1}{" "}
                                        {order.shipping.address2}
                                    </span>
                                </p>
                                {order.shipping.message && (
                                    <p>
                                        요청사항:{" "}
                                        <span className="text-foreground">{order.shipping.message}</span>
                                    </p>
                                )}
                                {order.shipping.courier && (
                                    <p>
                                        택배사:{" "}
                                        <span className="text-foreground">{order.shipping.courier}</span>
                                    </p>
                                )}
                                {order.shipping.trackingNo && (
                                    <p>
                                        송장번호:{" "}
                                        <span className="text-foreground">{order.shipping.trackingNo}</span>
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-4 md:sticky md:top-24 md:self-start">
                    {/* 결제 정보 */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">결제 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <span>결제 수단</span>
                                <span className="font-semibold text-foreground">
                                    {order.paymentMethod}
                                </span>
                            </div>
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
                            <div className="my-2 h-px bg-border" />
                            <div className="flex items-center justify-between text-base font-bold text-foreground">
                                <span>총 결제금액</span>
                                <span>{order.totalAmountText}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 처리 상태 타임라인 */}
                    {order.timeline.length > 0 && (
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <PackageSearch className="h-4 w-4 text-primary" />
                                    처리 상태
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2">
                                {order.timeline.map((step) => (
                                    <div
                                        key={step.label}
                                        className="rounded-xl border border-border bg-muted p-3 text-sm"
                                    >
                                        <p
                                            className={`font-semibold ${step.done ? "text-foreground" : "text-muted-foreground"}`}
                                        >
                                            {step.label}
                                        </p>
                                        <p
                                            className={`text-xs ${step.done ? "text-muted-foreground" : "text-muted-foreground/50"}`}
                                        >
                                            {step.at}
                                        </p>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    )}

                    {/* 주문 액션 */}
                    <div className="space-y-2">
                        {canCancelOrder(order.status) && !showCancelConfirm && (
                            <Button
                                variant="outline"
                                className="h-10 w-full rounded-full border-destructive text-destructive hover:bg-destructive/10"
                                onClick={() => setShowCancelConfirm(true)}
                            >
                                주문 취소
                            </Button>
                        )}
                        {showCancelConfirm && (
                            <Card className="border-destructive/30 bg-destructive/5">
                                <CardContent className="space-y-3 p-4">
                                    <p className="text-sm font-semibold text-destructive">
                                        정말 주문을 취소하시겠습니까?
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            className="rounded-full"
                                            disabled={cancelMutation.isPending}
                                            onClick={handleCancel}
                                        >
                                            {cancelMutation.isPending ? "취소 중..." : "확인"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-full"
                                            onClick={() => setShowCancelConfirm(false)}
                                        >
                                            돌아가기
                                        </Button>
                                    </div>
                                    {cancelMutation.isError && (
                                        <p className="text-xs text-destructive">
                                            {cancelMutation.error?.message}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {canRefundOrder(order.status) && !showRefundConfirm && (
                            <Button
                                variant="outline"
                                className="h-10 w-full rounded-full"
                                onClick={() => setShowRefundConfirm(true)}
                            >
                                환불 요청
                            </Button>
                        )}
                        {showRefundConfirm && (
                            <Card className="border-amber-300/30 bg-amber-50 dark:bg-amber-900/10">
                                <CardContent className="space-y-3 p-4">
                                    <p className="text-sm font-semibold text-foreground">
                                        환불을 요청하시겠습니까?
                                    </p>
                                    <div className="flex gap-2">
                                        <Button
                                            size="sm"
                                            className="rounded-full"
                                            disabled={refundMutation.isPending}
                                            onClick={handleRefund}
                                        >
                                            {refundMutation.isPending ? "처리 중..." : "환불 요청"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="rounded-full"
                                            onClick={() => setShowRefundConfirm(false)}
                                        >
                                            돌아가기
                                        </Button>
                                    </div>
                                    {refundMutation.isError && (
                                        <p className="text-xs text-destructive">
                                            {refundMutation.error?.message}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        <Button asChild variant="ghost" className="h-10 w-full rounded-full">
                            <Link to="/my/orders">주문내역으로 돌아가기</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default OrderDetailPage;
