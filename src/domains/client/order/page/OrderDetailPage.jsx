import { Link, useParams } from "react-router";
import { PackageSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findOrderById } from "@/domains/client/order/mock/orderData.js";
import { formatPrice } from "@/domains/client/common/utils/format.js";

function OrderDetailPage() {
    const { orderId } = useParams();
    const order = findOrderById(orderId);

    if (!order) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-md border-zinc-200/80 bg-white/95">
                    <CardHeader>
                        <CardTitle className="text-zinc-900">주문 정보를 찾을 수 없습니다</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-zinc-600">새로 생성된 주문은 아직 목데이터에 없을 수 있습니다.</p>
                        <Button asChild className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
                            <Link to="/my/orders">주문내역으로 이동</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Order Detail</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900">주문 상세</h2>
                <p className="mt-2 text-sm text-zinc-600">
                    주문번호 <span className="font-semibold text-zinc-900">{order.id}</span> · {order.orderedAt}
                </p>
            </section>

            <section className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="space-y-4">
                    <Card className="border-zinc-200/80 bg-white/95">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-zinc-900">주문 상품</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {order.items.map((item) => (
                                <div key={item.id} className="flex gap-3 rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                                    <img src={item.thumbnail} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-zinc-500">{item.storeName}</p>
                                        <p className="line-clamp-1 text-sm font-semibold text-zinc-900">{item.name}</p>
                                        <p className="line-clamp-1 text-xs text-zinc-500">{item.option}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-zinc-500">x {item.quantity}</p>
                                        <p className="text-sm font-semibold text-zinc-900">{formatPrice(item.unitPrice * item.quantity)}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-200/80 bg-white/95">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-zinc-900">배송 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-zinc-600">
                            <p>수령인: {order.shipping.receiver}</p>
                            <p>연락처: {order.shipping.phone}</p>
                            <p>
                                주소: ({order.shipping.zipCode}) {order.shipping.address1} {order.shipping.address2}
                            </p>
                            <p>요청사항: {order.shipping.message}</p>
                            <p>택배사: {order.shipping.courier}</p>
                            <p>송장번호: {order.shipping.trackingNo}</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-4 md:sticky md:top-24 md:self-start">
                    <Card className="border-zinc-200/80 bg-white/95">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-zinc-900">결제 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                            <div className="flex items-center justify-between text-zinc-600">
                                <span>결제 수단</span>
                                <span className="font-semibold text-zinc-900">{order.paymentMethod}</span>
                            </div>
                            <div className="flex items-center justify-between text-zinc-600">
                                <span>상품 금액</span>
                                <span>{formatPrice(order.totalAmount + order.discountAmount + order.usedPoint - order.shippingFee)}</span>
                            </div>
                            <div className="flex items-center justify-between text-zinc-600">
                                <span>할인</span>
                                <span>- {formatPrice(order.discountAmount)}</span>
                            </div>
                            <div className="flex items-center justify-between text-zinc-600">
                                <span>포인트</span>
                                <span>- {formatPrice(order.usedPoint)}</span>
                            </div>
                            <div className="flex items-center justify-between text-zinc-600">
                                <span>배송비</span>
                                <span>{formatPrice(order.shippingFee)}</span>
                            </div>
                            <div className="my-2 h-px bg-zinc-200" />
                            <div className="flex items-center justify-between text-base font-bold text-zinc-900">
                                <span>총 결제금액</span>
                                <span>{formatPrice(order.totalAmount)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-200/80 bg-white/95">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
                                <PackageSearch className="h-4 w-4 text-cyan-700" />
                                처리 상태
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {order.timeline.map((step) => (
                                <div key={step.label} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm">
                                    <p className={`font-semibold ${step.done ? "text-zinc-900" : "text-zinc-400"}`}>{step.label}</p>
                                    <p className={`text-xs ${step.done ? "text-zinc-500" : "text-zinc-400"}`}>{step.at}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Button asChild variant="outline" className="h-10 w-full rounded-full border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100">
                        <Link to="/my/orders">주문내역으로 돌아가기</Link>
                    </Button>
                </div>
            </section>
        </div>
    );
}

export default OrderDetailPage;
