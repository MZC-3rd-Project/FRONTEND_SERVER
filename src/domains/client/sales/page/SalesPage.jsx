import { useMemo, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, PackageCheck, RefreshCw, Sparkles } from "lucide-react";

import StickySearchPanel from "@/components/search/StickySearchPanel.jsx";
import CatalogSearchResults from "@/components/search/CatalogSearchResults";
import InfiniteListFooter from "@/components/search/InfiniteListFooter";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty.tsx";
import { useInfiniteScrollTrigger } from "@/common/hooks/useInfiniteScrollTrigger";
import { encodeIdPathSegment } from "@/common/utils/id";
import { SALES_IMAGE_PLACEHOLDER } from "@/domains/client/sales/lib/salesMappers";
import { useInfiniteNormalSalesQuery } from "@/domains/client/sales/query/useSalesQueries";
import { useCatalogItemNavigation } from "@/domains/client/search/hooks/useCatalogItemNavigation";
import {
    isSearchCriteriaActive,
    mapSalesStatusLabelToQueryStatus,
} from "@/domains/client/search/lib/searchMappers";
import { useInfiniteCatalogItemsQuery } from "@/domains/client/search/query/useSearchQueries";
import { useTopLevelCategoryOptionsQuery } from "@/domains/client/category/query/useCategoryQueries";

function getSaleStatusVariant(statusCode) {
    if (statusCode === "ON_SALE") return "default";
    if (statusCode === "PAUSED") return "secondary";
    return "destructive";
}

function flattenPages(data) {
    return data?.pages?.flatMap((page) => page.items ?? []) ?? [];
}

function buildSalesDetailPath(item) {
    const params = new URLSearchParams({
        itemType: item.itemType,
        salesChannel: "NORMAL",
    });

    return `/sales/${encodeIdPathSegment(item.saleId)}?${params.toString()}`;
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
    const [appliedSearch, setAppliedSearch] = useState({
        keyword: "",
        category: "전체",
        status: "전체",
    });
    const { pendingItemId, openItem } = useCatalogItemNavigation();
    const salesQuery = useInfiniteNormalSalesQuery({ size: 12 });
    const salesItems = useMemo(() => flattenPages(salesQuery.data), [salesQuery.data]);
    const { data: topLevelCategories } = useTopLevelCategoryOptionsQuery();
    const salesCategories = useMemo(() => {
        const source = (topLevelCategories ?? []).map((category) => category.label);
        return source.length > 0 ? ["전체", ...new Set(source)] : ["전체"];
    }, [topLevelCategories]);
    const salesCategoryIdByLabel = useMemo(
        () =>
            new Map(
                (topLevelCategories ?? []).map((category) => [category.label, category.value])
            ),
        [topLevelCategories]
    );
    const salesStatuses = useMemo(() => {
        const source = salesItems
            .map((item) => item.status)
            .filter((status) => mapSalesStatusLabelToQueryStatus(status).length > 0);
        return ["전체", ...new Set(source)];
    }, [salesItems]);
    const isInlineSearchActive = isSearchCriteriaActive(appliedSearch);
    const inlineSearchQuery = useInfiniteCatalogItemsQuery(
        {
            q: appliedSearch.keyword,
            channel: "NORMAL",
            category: appliedSearch.category !== "전체"
                ? (salesCategoryIdByLabel.get(appliedSearch.category) ?? undefined)
                : undefined,
            status: mapSalesStatusLabelToQueryStatus(appliedSearch.status),
            size: 12,
        },
        {
            enabled: isInlineSearchActive,
        }
    );
    const inlineItems = useMemo(
        () => flattenPages(inlineSearchQuery.data).filter((item) => item.statusCode === "ON_SALE"),
        [inlineSearchQuery.data]
    );

    const listSentinelRef = useInfiniteScrollTrigger({
        enabled: !isInlineSearchActive && salesQuery.hasNextPage && !salesQuery.isFetchingNextPage,
        onIntersect: () => salesQuery.fetchNextPage(),
    });
    const searchSentinelRef = useInfiniteScrollTrigger({
        enabled: isInlineSearchActive && inlineSearchQuery.hasNextPage && !inlineSearchQuery.isFetchingNextPage,
        onIntersect: () => inlineSearchQuery.fetchNextPage(),
    });

    return (
        <div className="grid items-start gap-4 md:grid-cols-[1fr_320px]">
            <div className="order-2 space-y-6 md:order-1">
                <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Product Sale</p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">지금 바로 살 수 있는 상품</h2>
                            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                                카테고리별 상품을 한 번에 둘러보고, 원하는 상품을 바로 구매할 수 있습니다.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => {
                                if (isInlineSearchActive) {
                                    inlineSearchQuery.refetch();
                                    return;
                                }
                                salesQuery.refetch();
                            }}
                            disabled={isInlineSearchActive ? inlineSearchQuery.isFetching : salesQuery.isFetching}
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    (isInlineSearchActive ? inlineSearchQuery.isFetching : salesQuery.isFetching)
                                        ? "animate-spin"
                                        : ""
                                }`}
                            />
                            새로고침
                        </Button>
                    </div>
                </section>

                {isInlineSearchActive ? (
                    <section className="rounded-3xl border border-primary/15 bg-primary/5 p-4 text-sm">
                        <p className="font-semibold text-foreground">판매 검색 결과를 현재 페이지에서 바로 탐색하는 중입니다.</p>
                        <p className="mt-1 text-muted-foreground">
                            상품명, 카테고리, 상태 조건을 바꾸면 결과가 즉시 갱신됩니다.
                        </p>
                    </section>
                ) : null}

                {isInlineSearchActive ? (
                    <CatalogSearchResults
                        items={inlineItems}
                        isLoading={inlineSearchQuery.isPending}
                        isError={inlineSearchQuery.isError}
                        error={inlineSearchQuery.error}
                        onRetry={() => inlineSearchQuery.refetch()}
                        onOpenItem={openItem}
                        pendingItemId={pendingItemId}
                        hasNextPage={inlineSearchQuery.hasNextPage}
                        isFetchingNextPage={inlineSearchQuery.isFetchingNextPage}
                        sentinelRef={searchSentinelRef}
                        emptyTitle="조건에 맞는 일반판매 상품이 없습니다"
                        emptyDescription="상품명이나 카테고리 조건을 바꿔 다시 검색해 보세요."
                        endMessage="판매 검색 결과를 모두 확인했습니다."
                    />
                ) : (
                    <>
                        {salesQuery.isPending ? <SalesListSkeleton /> : null}

                        {!salesQuery.isPending && salesQuery.isError ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>일반판매 목록을 불러오지 못했습니다.</AlertTitle>
                                <AlertDescription className="mt-2 flex flex-wrap items-center gap-2">
                                    <span>{salesQuery.error?.message ?? "잠시 후 다시 시도해 주세요."}</span>
                                    <Button type="button" size="sm" variant="outline" onClick={() => salesQuery.refetch()}>
                                        다시 시도
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        {!salesQuery.isPending && !salesQuery.isError && salesItems.length === 0 ? (
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
                                    <Button type="button" variant="outline" onClick={() => salesQuery.refetch()}>
                                        목록 다시 불러오기
                                    </Button>
                                </EmptyContent>
                            </Empty>
                        ) : null}

                        {!salesQuery.isPending && !salesQuery.isError && salesItems.length > 0 ? (
                            <div className="space-y-4">
                                <section className="grid gap-4 md:grid-cols-2">
                                    {salesItems.map((item) => (
                                        <Link
                                            key={item.id}
                                            to={buildSalesDetailPath(item)}
                                            className="group relative block overflow-hidden rounded-[1.6rem] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                                        >
                                            <Card className="overflow-hidden border-border/70 bg-card/95 transition duration-300 group-hover:-translate-y-1 group-hover:border-cyan-300/60 group-hover:shadow-[0_24px_65px_rgba(8,145,178,0.18)] dark:group-hover:border-cyan-300/30">
                                                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.12),transparent_38%)]" />
                                                    <div className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-[420%]" />
                                                </div>

                                                <div className="relative">
                                                    <img
                                                        src={item.thumbnailUrl || SALES_IMAGE_PLACEHOLDER}
                                                        alt={item.title}
                                                        className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                                    />
                                                    <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-zinc-950/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                                                        <Sparkles className="h-3 w-3" />
                                                        클릭해서 보기
                                                    </div>
                                                </div>

                                                <CardHeader className="relative pb-2">
                                                    <div className="mb-2 flex items-center justify-between gap-2">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            <Badge>{item.category}</Badge>
                                                            <Badge variant="outline">{item.itemTypeLabel}</Badge>
                                                        </div>
                                                        <Badge variant={getSaleStatusVariant(item.statusCode)}>{item.status}</Badge>
                                                    </div>
                                                    <CardTitle className="text-base">{item.title}</CardTitle>
                                                    <p className="line-clamp-1 text-xs text-muted-foreground">
                                                        {item.storeName || "바로 구매 가능한 상품"}
                                                    </p>
                                                </CardHeader>
                                                <CardContent className="relative space-y-3">
                                                    <div className="flex items-end justify-between gap-3">
                                                        <div>
                                                            <p className="text-xs text-muted-foreground">현재 판매가</p>
                                                            <p className="text-lg font-bold text-foreground">{item.priceText}</p>
                                                            {item.basePriceText ? (
                                                                <p className="text-xs text-muted-foreground line-through">{item.basePriceText}</p>
                                                            ) : null}
                                                        </div>
                                                        <div className="text-right text-xs text-muted-foreground">
                                                            <p>
                                                                {item.stock !== null
                                                                    ? `남은 수량 ${item.stock.toLocaleString()}개`
                                                                    : "재고 확인 필요"}
                                                            </p>
                                                            <p>
                                                                {item.stock !== null
                                                                    ? (item.soldOut ? "재고 소진" : "즉시 구매 가능")
                                                                    : "재고 정보 준비 중"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <p className="inline-flex items-center gap-1 text-xs text-cyan-700 transition-colors group-hover:text-cyan-800 dark:text-cyan-300 dark:group-hover:text-cyan-200">
                                                        <PackageCheck className="h-3.5 w-3.5" />
                                                        {item.stock !== null
                                                            ? (item.soldOut ? "재고 소진" : "즉시 구매 가능")
                                                            : "재고 정보 준비 중"}
                                                    </p>
                                                </CardContent>
                                            </Card>
                                        </Link>
                                    ))}
                                </section>

                                <InfiniteListFooter
                                    sentinelRef={listSentinelRef}
                                    hasNextPage={salesQuery.hasNextPage}
                                    isFetchingNextPage={salesQuery.isFetchingNextPage}
                                    endMessage="일반판매 상품을 모두 확인했습니다."
                                />
                            </div>
                        ) : null}
                    </>
                )}
            </div>

            <aside className="order-1 md:order-2 md:sticky md:top-24 md:self-start">
                <StickySearchPanel
                    mode="inline"
                    onSearch={setAppliedSearch}
                    scope="sales"
                    title="판매 검색"
                    description="상품명, 카테고리, 상태 조건으로 현재 페이지에서 바로 결과를 필터링합니다."
                    placeholder="판매 상품명"
                    categories={salesCategories}
                    statuses={salesStatuses}
                />
            </aside>
        </div>
    );
}

export default SalesPage;
