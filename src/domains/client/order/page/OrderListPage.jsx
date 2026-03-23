import { useState } from "react";
import { Link } from "react-router";
import { ArrowRight, Loader2, PackageCheck, Truck } from "lucide-react";

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
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">My Orders</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">주문내역</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    결제/배송/취소 상태를 주문번호 단위로 확인할 수 있습니다.
                </p>
            </section>

            <section className="grid gap-3 sm:grid-cols-3">
                <Card>
                    <CardContent className="p-4 text-sm">
                        <p className="text-muted-foreground">전체 주문</p>
                        <p className="text-2xl font-bold text-foreground">{data?.totalCount ?? 0}</p>
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
                    {STATUS_FILTERS.map((filter) => (
                        <button
                            key={filter.value}
                            type="button"
                            onClick={() => {
                                setStatusFilter(filter.value);
                                setPage(0);
                            }}
                            className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                                statusFilter === filter.value
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : "border-border bg-muted text-muted-foreground hover:border-primary"
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
                        <Card key={order.id}>
                            <CardContent className="space-y-3 p-4">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-xs text-muted-foreground">{order.orderedAt}</p>
                                        <p className="text-sm font-semibold text-foreground">{order.id}</p>
                                    </div>
                                    <span
                                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${order.statusClassName}`}
                                    >
                                        {order.statusLabel}
                                    </span>
                                </div>

                                <div className="space-y-1 text-sm text-muted-foreground">
                                    {order.items.slice(0, 2).map((item) => (
                                        <p key={item.id} className="line-clamp-1">
                                            {item.name} · {item.option}
                                        </p>
                                    ))}
                                    {order.items.length > 2 && (
                                        <p className="text-xs">외 {order.items.length - 2}건</p>
                                    )}
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-foreground">
                                        {order.totalAmountText}
                                    </p>
                                    <Button asChild size="sm" className="rounded-full px-4">
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
                    <Card>
                        <CardContent className="p-8 text-center text-sm text-muted-foreground">
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
