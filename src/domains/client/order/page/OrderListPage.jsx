import { Link } from "react-router";
import { ArrowRight, PackageCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orderHistory } from "@/domains/client/order/mock/orderData.js";
import { formatPrice } from "@/domains/client/common/utils/format.js";

const statusFilters = ["전체", ...new Set(orderHistory.map((order) => order.status))];

function statusClassName(status) {
    if (status === "배송완료") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    if (status === "배송중") return "bg-primary/10 text-primary";
    if (status === "결제취소") return "bg-destructive/10 text-destructive";
    return "bg-muted text-muted-foreground";
}

function OrderListPage() {
    const shippingCount = orderHistory.filter((order) => order.status === "배송중").length;
    const completeCount = orderHistory.filter((order) => order.status === "배송완료").length;

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">My Orders</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">주문내역</h2>
                <p className="mt-2 text-sm text-muted-foreground">결제/배송/취소 상태를 주문번호 단위로 확인할 수 있습니다.</p>
            </section>

            <section className="grid gap-3 sm:grid-cols-3">
                <Card>
                    <CardContent className="p-4 text-sm">
                        <p className="text-muted-foreground">전체 주문</p>
                        <p className="text-2xl font-bold text-foreground">{orderHistory.length}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-sm">
                        <p className="inline-flex items-center gap-1 text-muted-foreground">
                            <Truck className="h-3.5 w-3.5" />
                            배송중
                        </p>
                        <p className="text-2xl font-bold text-foreground">{shippingCount}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-sm">
                        <p className="inline-flex items-center gap-1 text-muted-foreground">
                            <PackageCheck className="h-3.5 w-3.5" />
                            배송완료
                        </p>
                        <p className="text-2xl font-bold text-foreground">{completeCount}</p>
                    </CardContent>
                </Card>
            </section>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-base">주문 상태 필터</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {statusFilters.map((status) => (
                        <span key={status} className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                            {status}
                        </span>
                    ))}
                </CardContent>
            </Card>

            <section className="space-y-3">
                {orderHistory.map((order) => (
                    <Card key={order.id}>
                        <CardContent className="space-y-3 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <p className="text-xs text-muted-foreground">{order.orderedAt}</p>
                                    <p className="text-sm font-semibold text-foreground">{order.id}</p>
                                </div>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClassName(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="space-y-1 text-sm text-muted-foreground">
                                {order.items.slice(0, 2).map((item) => (
                                    <p key={item.id} className="line-clamp-1">
                                        {item.name} · {item.option}
                                    </p>
                                ))}
                                {order.items.length > 2 && <p className="text-xs text-muted-foreground">외 {order.items.length - 2}건</p>}
                            </div>

                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-foreground">{formatPrice(order.totalAmount)}</p>
                                <Button asChild size="sm" className="rounded-full px-4">
                                    <Link to={`/my/orders/${order.id}`}>
                                        상세 보기
                                        <ArrowRight className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>
        </div>
    );
}

export default OrderListPage;
