import { useMemo, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, Flame, RefreshCw, Timer } from "lucide-react";

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
import { DEAL_IMAGE_PLACEHOLDER } from "@/domains/client/deals/lib/dealsMappers";
import { useInfiniteHotDealsQuery } from "@/domains/client/deals/query/useDealsQueries";
import { useCatalogItemNavigation } from "@/domains/client/search/hooks/useCatalogItemNavigation";
import { isSearchCriteriaActive } from "@/domains/client/search/lib/searchMappers";
import { useInfiniteCatalogItemsQuery } from "@/domains/client/search/query/useSearchQueries";

function flattenPages(data) {
    return data?.pages?.flatMap((page) => page.items ?? []) ?? [];
}

function DealsListSkeleton() {
    return (
        <section className="grid gap-4 sm:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
                <Card key={`deals-skeleton-${index}`} className="overflow-hidden border-border bg-card">
                    <div className="h-40 w-full animate-pulse bg-muted" />
                    <CardHeader className="space-y-3 pb-2">
                        <div className="flex items-center justify-between gap-2">
                            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                        </div>
                        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                        <div className="h-6 w-28 animate-pulse rounded bg-muted" />
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

function DealsPage() {
    const [appliedSearch, setAppliedSearch] = useState({
        keyword: "",
        category: "전체",
        status: "전체",
    });
    const { pendingItemId, openItem } = useCatalogItemNavigation();
    const dealsQuery = useInfiniteHotDealsQuery({ size: 12 });
    const hotDeals = useMemo(() => flattenPages(dealsQuery.data), [dealsQuery.data]);
    const isInlineSearchActive = isSearchCriteriaActive(appliedSearch);
    const inlineSearchQuery = useInfiniteCatalogItemsQuery(
        {
            q: appliedSearch.keyword,
            channel: "HOT_DEAL",
            size: 12,
        },
        {
            enabled: isInlineSearchActive,
        }
    );
    const inlineItems = useMemo(() => flattenPages(inlineSearchQuery.data), [inlineSearchQuery.data]);

    const listSentinelRef = useInfiniteScrollTrigger({
        enabled: !isInlineSearchActive && dealsQuery.hasNextPage && !dealsQuery.isFetchingNextPage,
        onIntersect: () => dealsQuery.fetchNextPage(),
    });
    const searchSentinelRef = useInfiniteScrollTrigger({
        enabled: isInlineSearchActive && inlineSearchQuery.hasNextPage && !inlineSearchQuery.isFetchingNextPage,
        onIntersect: () => inlineSearchQuery.fetchNextPage(),
    });

    return (
        <div className="grid items-start gap-4 md:grid-cols-[1fr_320px]">
            <div className="order-2 space-y-6 md:order-1">
                <section className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-foreground shadow-sm sm:p-8">
                    <div className="relative z-10 flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                                <Flame className="h-3.5 w-3.5" />
                                Flash Deal
                            </p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight">지금 진행 중인 타임세일</h2>
                            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                                한정 재고 특가 상품을 남은 시간 안에 구매하세요.
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
                                dealsQuery.refetch();
                            }}
                            disabled={isInlineSearchActive ? inlineSearchQuery.isFetching : dealsQuery.isFetching}
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    (isInlineSearchActive ? inlineSearchQuery.isFetching : dealsQuery.isFetching)
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
                        <p className="font-semibold text-foreground">핫딜 검색 결과를 현재 페이지 안에서 바로 보여주는 중입니다.</p>
                        <p className="mt-1 text-muted-foreground">
                            키워드를 바꾸면 타임세일 라인업을 다른 페이지로 이동하지 않고 다시 탐색할 수 있습니다.
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
                        emptyTitle="조건에 맞는 핫딜이 없습니다"
                        emptyDescription="상품명 키워드를 바꿔 다시 검색해 보세요."
                        endMessage="핫딜 검색 결과를 모두 확인했습니다."
                    />
                ) : (
                    <>
                        {dealsQuery.isPending ? <DealsListSkeleton /> : null}

                        {!dealsQuery.isPending && dealsQuery.isError ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>핫딜 목록을 불러오지 못했습니다.</AlertTitle>
                                <AlertDescription className="mt-2 flex flex-wrap items-center gap-2">
                                    <span>{dealsQuery.error?.message ?? "잠시 후 다시 시도해 주세요."}</span>
                                    <Button type="button" size="sm" variant="outline" onClick={() => dealsQuery.refetch()}>
                                        다시 시도
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        {!dealsQuery.isPending && !dealsQuery.isError && hotDeals.length === 0 ? (
                            <Empty className="rounded-3xl border border-border bg-card">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Flame className="size-5" />
                                    </EmptyMedia>
                                    <EmptyTitle>진행 중인 핫딜이 없습니다</EmptyTitle>
                                    <EmptyDescription>
                                        현재 활성화된 타임세일이 없습니다. 잠시 후 다시 확인해 주세요.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Button type="button" variant="outline" onClick={() => dealsQuery.refetch()}>
                                        목록 다시 불러오기
                                    </Button>
                                </EmptyContent>
                            </Empty>
                        ) : null}

                        {!dealsQuery.isPending && !dealsQuery.isError && hotDeals.length > 0 ? (
                            <div className="space-y-4">
                                <section className="grid gap-4 sm:grid-cols-2">
                                    {hotDeals.map((deal) => (
                                        <Card key={deal.id} className="overflow-hidden border-border bg-card">
                                            <img
                                                src={deal.thumbnailUrl || DEAL_IMAGE_PLACEHOLDER}
                                                alt={deal.title}
                                                className="h-40 w-full object-cover"
                                            />
                                            <CardHeader className="pb-2">
                                                <div className="flex items-center justify-between gap-2 text-xs">
                                                    <Badge variant="outline">{deal.status}</Badge>
                                                    <Badge variant="destructive">{deal.discountLabel}</Badge>
                                                </div>
                                                <CardTitle className="text-base">{deal.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div>
                                                    {deal.originalPrice ? (
                                                        <p className="text-xs text-muted-foreground/60 line-through">{deal.originalPriceText}</p>
                                                    ) : null}
                                                    <p className="text-lg font-bold text-foreground">{deal.discountedPriceText}</p>
                                                    <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Timer className="h-3.5 w-3.5" />
                                                        {deal.leftLabel}
                                                    </p>
                                                    <p className="mt-1 text-xs text-muted-foreground">
                                                        남은 수량 {deal.remainingQuantity.toLocaleString()}개 · 판매 {deal.soldQuantity.toLocaleString()}개
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-xs text-muted-foreground">진행률 {deal.progressRateText}%</p>
                                                    <Button asChild size="sm" className="rounded-full px-4">
                                                        <Link
                                                            to={`/deals/${encodeIdPathSegment(deal.hotDealId)}?itemId=${encodeURIComponent(
                                                                String(deal.itemId ?? "")
                                                            )}&itemType=${encodeURIComponent(String(deal.itemType ?? ""))}`}
                                                        >
                                                            상세 보기
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </section>

                                <InfiniteListFooter
                                    sentinelRef={listSentinelRef}
                                    hasNextPage={dealsQuery.hasNextPage}
                                    isFetchingNextPage={dealsQuery.isFetchingNextPage}
                                    endMessage="진행 중인 핫딜을 모두 확인했습니다."
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
                    scope="deals"
                    title="딜 검색"
                    description="상품명을 기준으로 타임세일 라인업을 현재 페이지 안에서 바로 필터링합니다."
                    placeholder="딜 상품명"
                    categories={["전체"]}
                    statuses={["전체"]}
                />
            </aside>
        </div>
    );
}

export default DealsPage;
