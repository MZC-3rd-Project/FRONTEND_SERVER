import { Link } from "react-router";
import { ArrowRight, PackageCheck, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orderHistory } from "@/domains/client/order/mock/orderData.js";
import { formatPrice } from "@/domains/client/common/utils/format.js";

const statusFilters = ["전체", ...new Set(orderHistory.map((order) => order.status))];

function statusClassName(status) {
    if (status === "배송완료") return "bg-emerald-100 text-emerald-700";
    if (status === "배송중") return "bg-blue-100 text-blue-700";
    if (status === "결제취소") return "bg-rose-100 text-rose-700";
    return "bg-zinc-100 text-zinc-700";
}

function OrderListPage() {
    const shippingCount = orderHistory.filter((order) => order.status === "배송중").length;
    const completeCount = orderHistory.filter((order) => order.status === "배송완료").length;

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">My Orders</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900">주문내역</h2>
                <p className="mt-2 text-sm text-zinc-600">결제/배송/취소 상태를 주문번호 단위로 확인할 수 있습니다.</p>
            </section>

            <section className="grid gap-3 sm:grid-cols-3">
                <Card className="border-zinc-200/80 bg-white/95">
                    <CardContent className="p-4 text-sm">
                        <p className="text-zinc-500">전체 주문</p>
                        <p className="text-2xl font-bold text-zinc-900">{orderHistory.length}</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200/80 bg-white/95">
                    <CardContent className="p-4 text-sm">
                        <p className="inline-flex items-center gap-1 text-zinc-500">
                            <Truck className="h-3.5 w-3.5" />
                            배송중
                        </p>
                        <p className="text-2xl font-bold text-zinc-900">{shippingCount}</p>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200/80 bg-white/95">
                    <CardContent className="p-4 text-sm">
                        <p className="inline-flex items-center gap-1 text-zinc-500">
                            <PackageCheck className="h-3.5 w-3.5" />
                            배송완료
                        </p>
                        <p className="text-2xl font-bold text-zinc-900">{completeCount}</p>
                    </CardContent>
                </Card>
            </section>

            <Card className="border-zinc-200/80 bg-white/95">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base text-zinc-900">주문 상태 필터</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {statusFilters.map((status) => (
                        <span key={status} className="rounded-full border border-zinc-300 bg-zinc-50 px-2.5 py-1 text-xs font-semibold text-zinc-700">
                            {status}
                        </span>
                    ))}
                </CardContent>
            </Card>

            <section className="space-y-3">
                {orderHistory.map((order) => (
                    <Card key={order.id} className="border-zinc-200/80 bg-white/95">
                        <CardContent className="space-y-3 p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <div>
                                    <p className="text-xs text-zinc-500">{order.orderedAt}</p>
                                    <p className="text-sm font-semibold text-zinc-900">{order.id}</p>
                                </div>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClassName(order.status)}`}>
                                    {order.status}
                                </span>
                            </div>

                            <div className="space-y-1 text-sm text-zinc-600">
                                {order.items.slice(0, 2).map((item) => (
                                    <p key={item.id} className="line-clamp-1">
                                        {item.name} · {item.option}
                                    </p>
                                ))}
                                {order.items.length > 2 && <p className="text-xs text-zinc-500">외 {order.items.length - 2}건</p>}
                            </div>

                            <div className="flex items-center justify-between">
                                <p className="text-sm font-semibold text-zinc-900">{formatPrice(order.totalAmount)}</p>
                                <Button asChild size="sm" className="rounded-full bg-zinc-900 px-4 text-white hover:bg-zinc-700">
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
