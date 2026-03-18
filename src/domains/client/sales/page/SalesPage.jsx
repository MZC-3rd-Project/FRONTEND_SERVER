import { useMemo } from "react";
import { Link } from "react-router";
import { AlertCircle, ArrowRight, PackageCheck, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty.tsx";
import StickySearchPanel from "@/components/search/StickySearchPanel.jsx";
import { SALES_IMAGE_PLACEHOLDER } from "@/domains/client/sales/lib/salesMappers";
import { useNormalSalesQuery } from "@/domains/client/sales/query/useSalesQueries";

function getSaleStatusVariant(statusCode) {
    if (statusCode === "ON_SALE") return "default";
    if (statusCode === "PAUSED") return "secondary";
    return "destructive";
}

function SalesListSkeleton() {
    return (
        <section className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
                <Card key={`sales-skeleton-${index}`} className="overflow-hidden border-border bg-card">
                    <div className="h-44 w-full animate-pulse bg-muted" />
                    <CardHeader className="space-y-3 pb-2">
                        <div className="flex items-center justify-between gap-2">
                            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                        </div>
                        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-end justify-between">
                            <div className="space-y-2">
                                <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                                <div className="h-6 w-28 animate-pulse rounded bg-muted" />
                            </div>
                            <div className="space-y-2 text-right">
                                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                                <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                            <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}

function SalesPage() {
    const { data, isLoading, isError, error, refetch, isFetching } = useNormalSalesQuery({ size: 12 });
    const salesItems = useMemo(() => data?.items ?? [], [data?.items]);
    const salesCategories = useMemo(
        () => ["전체", ...new Set(salesItems.map((item) => item.itemTypeLabel).filter(Boolean))],
        [salesItems]
    );
    const salesStatuses = useMemo(
        () => ["전체", ...new Set(salesItems.map((item) => item.status).filter(Boolean))],
        [salesItems]
    );

    return (
        <div className="grid items-start gap-4 md:grid-cols-[1fr_320px]">
            <div className="order-2 space-y-6 md:order-1">
                <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">After Funding Sale</p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">펀딩 완료 상품 일반판매</h2>
                            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                                펀딩에서 검증된 상품 중 남은 재고를 일반 판매로 전환한 라인업입니다. 수량이 적은 제품은 빠르게 마감될 수 있어요.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => refetch()}
                            disabled={isFetching}
                        >
                            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                            새로고침
                        </Button>
                    </div>
                </section>

                {isLoading ? <SalesListSkeleton /> : null}

                {!isLoading && isError ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>{error?.status === 401 ? "로그인이 필요합니다." : "일반판매 목록을 불러오지 못했습니다."}</AlertTitle>
                        <AlertDescription className="mt-2 flex flex-wrap items-center gap-2">
                            <span>{error?.message ?? "잠시 후 다시 시도해 주세요."}</span>
                            {error?.status === 401 ? (
                                <Button asChild type="button" size="sm" variant="outline">
                                    <Link to="/auth/login">로그인하러 가기</Link>
                                </Button>
                            ) : null}
                            <Button type="button" size="sm" variant="outline" onClick={() => refetch()}>
                                다시 시도
                            </Button>
                        </AlertDescription>
                    </Alert>
                ) : null}

                {!isLoading && !isError && salesItems.length === 0 ? (
                    <Empty className="rounded-3xl border border-border bg-card">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <PackageCheck className="size-5" />
                            </EmptyMedia>
                            <EmptyTitle>노출 중인 일반판매 상품이 없습니다</EmptyTitle>
                            <EmptyDescription>
                                현재 일반판매로 전환된 상품이 없습니다. 잠시 후 다시 확인해 주세요.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button type="button" variant="outline" onClick={() => refetch()}>
                                목록 다시 불러오기
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : null}

                {!isLoading && !isError && salesItems.length > 0 ? (
                    <section className="grid gap-4 md:grid-cols-2">
                        {salesItems.map((item) => (
                            <Card key={item.id} className="overflow-hidden border-border bg-card">
                                <img
                                    src={item.thumbnailUrl || SALES_IMAGE_PLACEHOLDER}
                                    alt={item.title}
                                    className="h-44 w-full object-cover"
                                />
                                <CardHeader className="pb-2">
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <Badge variant="outline">{item.itemTypeLabel}</Badge>
                                        <Badge variant={getSaleStatusVariant(item.statusCode)}>{item.status}</Badge>
                                    </div>
                                    <CardTitle className="text-base">{item.title}</CardTitle>
                                    <p className="line-clamp-1 text-xs text-muted-foreground">
                                        {item.fundingTitle || (item.activeCampaignId ? `원 펀딩 #${item.activeCampaignId}` : "일반판매 전용 상품")}
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="flex items-end justify-between gap-3">
                                        <div>
                                            <p className="text-xs text-muted-foreground">현재 판매가</p>
                                            <p className="text-lg font-bold text-foreground">{item.priceText}</p>
                                            {item.basePriceText ? (
                                                <p className="text-xs text-muted-foreground line-through">{item.basePriceText}</p>
                                            ) : null}
                                        </div>
                                        <div className="text-right text-xs text-muted-foreground">
                                            <p>남은 수량 {item.stock.toLocaleString()}개</p>
                                            <p>{item.soldOut ? "재고 소진 시 종료" : "즉시 구매 가능"}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                            <PackageCheck className="h-3.5 w-3.5" />
                                            {item.soldOut ? "재고 소진" : "재고 소진 시 판매 종료"}
                                        </p>
                                        <Button asChild size="sm" className="rounded-full px-4">
                                            <Link to={`/sales/${item.saleId}`}>
                                                상품 상세
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </section>
                ) : null}
            </div>

            <aside className="order-1 md:order-2 md:sticky md:top-24 md:self-start">
                <StickySearchPanel
                    scope="sales"
                    title="판매 검색"
                    description="일반판매 상품을 상품 타입과 상태 기준으로 빠르게 찾아보세요."
                    placeholder="판매 상품명, 상태"
                    categories={salesCategories}
                    statuses={salesStatuses}
                />
            </aside>
        </div>
    );
}

export default SalesPage;
