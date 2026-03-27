import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, CreditCard, Loader2, PackageCheck, ShoppingBag, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrdersQuery } from "@/domains/client/order/query/useOrderQueries";

const STATUS_FILTERS = [
    { value: "", label: "전체" },
    { value: "PAYMENT_PENDING", label: "결제대기" },
    { value: "PAID", label: "결제완료" },
    { value: "SHIPPING", label: "배송중" },
    { value: "DELIVERED", label: "배송완료" },
    { value: "COMPLETED", label: "구매확정" },
    { value: "CANCELLED", label: "주문취소" },
    { value: "REFUNDED", label: "환불완료" },
];

function OrderItemPreview({ item }) {
    return (
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-200/80 bg-white/80 p-3 shadow-[0_10px_25px_rgba(15,23,42,0.04)]">
            {item.thumbnail ? (
                <img
                    src={item.thumbnail}
                    alt={item.name}
                    className="h-14 w-14 rounded-xl object-cover ring-1 ring-zinc-200/70"
                />
            ) : (
                <div className="grid h-14 w-14 place-items-center rounded-xl bg-zinc-100 text-[11px] font-semibold text-zinc-400">
                    없음
                </div>
            )}
            <div className="min-w-0 flex-1">
                {item.storeName ? (
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-700">
                        {item.storeName}
                    </p>
                ) : null}
                <p className="line-clamp-1 text-sm font-semibold text-zinc-900">
                    {item.name || `상품 #${item.id}`}
                </p>
                {item.option ? (
                    <p className="line-clamp-1 text-xs text-zinc-500">{item.option}</p>
                ) : null}
            </div>
            <div className="text-right">
                <p className="text-[11px] text-zinc-400">수량</p>
                <p className="text-sm font-bold text-zinc-800">x {item.quantity}</p>
            </div>
        </div>
    );
}

function OrderListPage() {
    const [page, setPage] = useState(0);
    const [statusFilter, setStatusFilter] = useState("");

    const queryParams = { page, size: 10, ...(statusFilter && { status: statusFilter }) };
    const { data, isLoading, isError, error } = useOrdersQuery(queryParams);

    const orders = data?.orders ?? [];
    const totalPages = data?.totalPages ?? 1;

    const shippingCount = orders.filter((o) => o.status === "SHIPPING").length;
    const completeCount = orders.filter(
        (o) => o.status === "DELIVERED" || o.status === "COMPLETED",
    ).length;

    if (isLoading) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive">주문 목록 조회 실패</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            {error?.message ?? "잠시 후 다시 시도해 주세요."}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98),rgba(236,253,245,0.92))] p-6 shadow-[0_24px_90px_rgba(15,23,42,0.08)] sm:p-8">
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.14),transparent_38%)]" />
                <div className="relative space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">My Orders</p>
                    <h2 className="text-3xl font-black tracking-tight text-zinc-950">주문내역</h2>
                    <p className="max-w-2xl text-sm leading-6 text-zinc-600">
                        주문번호만 보는 화면이 아니라, 어떤 상품을 샀는지 바로 다시 떠올릴 수 있게
                        상품 카드 중심으로 정리했습니다.
                    </p>
                </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-3">
                <Card className="border-zinc-200/80 bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                    <CardContent className="flex items-center justify-between p-4 text-sm">
                        <div>
                            <p className="text-zinc-500">전체 주문</p>
                            <p className="text-2xl font-black text-zinc-950">{data?.totalCount ?? 0}</p>
                        </div>
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-zinc-950 text-white">
                            <ShoppingBag className="h-5 w-5" />
                        </span>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200/80 bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                    <CardContent className="flex items-center justify-between p-4 text-sm">
                        <div>
                            <p className="inline-flex items-center gap-1 text-zinc-500">
                            <Truck className="h-3.5 w-3.5" />
                            배송중
                            </p>
                            <p className="text-2xl font-black text-zinc-950">{shippingCount}</p>
                        </div>
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-sky-100 text-sky-700">
                            <Truck className="h-5 w-5" />
                        </span>
                    </CardContent>
                </Card>
                <Card className="border-zinc-200/80 bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                    <CardContent className="flex items-center justify-between p-4 text-sm">
                        <div>
                            <p className="inline-flex items-center gap-1 text-zinc-500">
                            <PackageCheck className="h-3.5 w-3.5" />
                            배송완료
                            </p>
                            <p className="text-2xl font-black text-zinc-950">{completeCount}</p>
                        </div>
                        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
                            <PackageCheck className="h-5 w-5" />
                        </span>
                    </CardContent>
                </Card>
            </section>

            <Card className="border-zinc-200/80 bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                <CardHeader className="pb-2">
                    <CardTitle className="text-base text-zinc-900">주문 상태 필터</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                    {STATUS_FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            type="button"
                            onClick={() => {
                                setStatusFilter(filter.value);
                                setPage(0);
                            }}
                            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                statusFilter === filter.value
                                    ? "border-zinc-950 bg-zinc-950 text-white"
                                    : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-400 hover:bg-white"
                            }`}
                        >
                            {filter.label}
                        </button>
                    ))}
                </CardContent>
            </Card>

            <section className="space-y-3">
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <Card
                            key={order.id}
                            className="overflow-hidden border-zinc-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.98))] shadow-[0_20px_55px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_28px_80px_rgba(15,23,42,0.1)]"
                        >
                            <CardContent className="space-y-4 p-4 sm:p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-400">
                                            Ordered At
                                        </p>
                                        <p className="mt-1 text-sm text-zinc-500">{order.orderedAt}</p>
                                        <p className="mt-2 text-base font-bold text-zinc-950">{order.id}</p>
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-semibold ${order.statusClassName}`}
                                    >
                                        {order.statusLabel}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-500">
                                        상품 {order.items.length}건
                                    </span>
                                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-500">
                                        <CreditCard className="mr-1 inline h-3.5 w-3.5" />
                                        결제금액 {order.totalAmountText}
                                    </span>
                                </div>

                                <div className="space-y-2">
                                    {order.items.slice(0, 3).map((item) => (
                                        <OrderItemPreview key={item.id} item={item} />
                                    ))}
                                    {order.items.length > 3 ? (
                                        <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-3 text-xs font-medium text-zinc-500">
                                            이 주문에는 추가 상품 {order.items.length - 3}건이 더 있습니다.
                                        </div>
                                    ) : null}
                                </div>

                                <div className="flex items-center justify-end">
                                    <Button asChild size="sm" className="rounded-full bg-zinc-950 px-4 text-white hover:bg-zinc-800">
                                        <Link to={`/my/orders/${order.id}`}>
                                            상세 보기
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Card className="border-zinc-200/80 bg-white/95 shadow-[0_14px_40px_rgba(15,23,42,0.05)]">
                        <CardContent className="p-10 text-center text-sm text-muted-foreground">
                            주문 내역이 없습니다.
                        </CardContent>
                    </Card>
                )}
            </section>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={page === 0}
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                    >
                        이전
                    </Button>
                    <span className="text-sm text-muted-foreground">
                        {page + 1} / {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full"
                        disabled={page >= totalPages - 1}
                        onClick={() => setPage((p) => p + 1)}
                    >
                        다음
                    </Button>
                </div>
            )}
        </div>
    );
}

export default OrderListPage;
