import { useMemo, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, ArrowRight, Clock3, RefreshCw, Users } from "lucide-react";

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
import { FUNDING_IMAGE_PLACEHOLDER } from "@/domains/client/funding/lib/fundingMappers";
import { useInfiniteFundingCampaignsQuery } from "@/domains/client/funding/query/useFundingQueries";
import { useCatalogItemNavigation } from "@/domains/client/search/hooks/useCatalogItemNavigation";
import {
    isSearchCriteriaActive,
    mapFundingStatusLabelToQueryStatus,
} from "@/domains/client/search/lib/searchMappers";
import { useInfiniteCatalogItemsQuery } from "@/domains/client/search/query/useSearchQueries";
import { useTopLevelCategoryNamesQuery } from "@/domains/client/category/query/useCategoryQueries";

function getStatusVariant(statusCode) {
    if (statusCode === "ACTIVE") return "default";
    if (statusCode === "SUCCEEDED") return "secondary";
    return "destructive";
}

function flattenPages(data) {
    return data?.pages?.flatMap((page) => page.items ?? []) ?? [];
}

function FundingListSkeleton() {
    return (
        <section className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
                <Card key={`funding-skeleton-${index}`} className="overflow-hidden border-border bg-card">
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
                        <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
                        <div className="flex items-center justify-between">
                            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                            <div className="h-5 w-12 animate-pulse rounded bg-muted" />
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

export default function FundingListPage() {
    const [appliedSearch, setAppliedSearch] = useState({
        keyword: "",
        category: "전체",
        status: "전체",
    });
    const { pendingItemId, openItem } = useCatalogItemNavigation();
    const fundingListQuery = useInfiniteFundingCampaignsQuery({ size: 12 });
    const campaigns = useMemo(() => flattenPages(fundingListQuery.data), [fundingListQuery.data]);
    const { data: topLevelCategories } = useTopLevelCategoryNamesQuery();

    const fundingCategories = useMemo(() => {
        const source = (topLevelCategories?.length ? topLevelCategories : campaigns.map((campaign) => campaign.category))
            .filter(Boolean);
        return ["전체", ...new Set(source)];
    }, [campaigns, topLevelCategories]);
    const fundingStatuses = useMemo(
        () => ["전체", ...new Set(campaigns.map((campaign) => campaign.status).filter(Boolean))],
        [campaigns]
    );

    const isInlineSearchActive = isSearchCriteriaActive(appliedSearch);
    const inlineSearchQuery = useInfiniteCatalogItemsQuery(
        {
            q: appliedSearch.keyword,
            channel: "FUNDING",
            category: appliedSearch.category !== "전체" ? appliedSearch.category : undefined,
            status: mapFundingStatusLabelToQueryStatus(appliedSearch.status),
            size: 12,
        },
        {
            enabled: isInlineSearchActive,
        }
    );
    const inlineItems = useMemo(() => flattenPages(inlineSearchQuery.data), [inlineSearchQuery.data]);

    const listSentinelRef = useInfiniteScrollTrigger({
        enabled: !isInlineSearchActive && fundingListQuery.hasNextPage && !fundingListQuery.isFetchingNextPage,
        onIntersect: () => fundingListQuery.fetchNextPage(),
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
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                Funding
                            </p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight text-card-foreground">
                                지금 주목받는 펀딩
                            </h2>
                            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                                프로젝트별 마감시간과 진행 상태를 확인하고, 원하는 캠페인으로 이동하세요.
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
                                fundingListQuery.refetch();
                            }}
                            disabled={isInlineSearchActive ? inlineSearchQuery.isFetching : fundingListQuery.isFetching}
                        >
                            <RefreshCw
                                className={`h-4 w-4 ${
                                    (isInlineSearchActive ? inlineSearchQuery.isFetching : fundingListQuery.isFetching)
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
                        <p className="font-semibold text-foreground">현재 페이지에서 통합 검색 결과를 바로 보여주는 중입니다.</p>
                        <p className="mt-1 text-muted-foreground">
                            키워드와 필터를 바꾸면 라우트 이동 없이 펀딩 검색 결과가 즉시 갱신됩니다.
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
                        emptyTitle="조건에 맞는 펀딩 검색 결과가 없습니다"
                        emptyDescription="펀딩명이나 카테고리를 바꿔 다시 찾아보세요."
                        endMessage="펀딩 검색 결과를 모두 확인했습니다."
                    />
                ) : (
                    <>
                        {fundingListQuery.isPending ? <FundingListSkeleton /> : null}

                        {!fundingListQuery.isPending && fundingListQuery.isError ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>펀딩 목록을 불러오지 못했습니다.</AlertTitle>
                                <AlertDescription className="mt-2 flex flex-wrap items-center gap-2">
                                    <span>{fundingListQuery.error?.message ?? "잠시 후 다시 시도해 주세요."}</span>
                                    <Button type="button" size="sm" variant="outline" onClick={() => fundingListQuery.refetch()}>
                                        다시 시도
                                    </Button>
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        {!fundingListQuery.isPending && !fundingListQuery.isError && campaigns.length === 0 ? (
                            <Empty className="rounded-3xl border border-border bg-card">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <Users className="size-5" />
                                    </EmptyMedia>
                                    <EmptyTitle>노출 중인 펀딩이 없습니다</EmptyTitle>
                                    <EmptyDescription>
                                        현재 조건에 맞는 캠페인이 없습니다. 잠시 후 다시 확인해 주세요.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Button type="button" variant="outline" onClick={() => fundingListQuery.refetch()}>
                                        목록 다시 불러오기
                                    </Button>
                                </EmptyContent>
                            </Empty>
                        ) : null}

                        {!fundingListQuery.isPending && !fundingListQuery.isError && campaigns.length > 0 ? (
                            <div className="space-y-4">
                                <section className="grid gap-4 md:grid-cols-2">
                                    {campaigns.map((campaign) => (
                                        <Card key={campaign.id} className="overflow-hidden border-border bg-card">
                                            <img
                                                src={campaign.thumbnailUrl || FUNDING_IMAGE_PLACEHOLDER}
                                                alt={campaign.title}
                                                className="h-44 w-full object-cover"
                                            />
                                            <CardHeader className="pb-2">
                                                <div className="mb-2 flex items-center justify-between gap-2">
                                                    <Badge className="rounded-full px-2 py-0.5 text-xs font-semibold">
                                                        {campaign.category}
                                                    </Badge>
                                                    <Badge
                                                        variant={getStatusVariant(campaign.statusCode)}
                                                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                                                    >
                                                        {campaign.status}
                                                    </Badge>
                                                </div>
                                                <CardTitle className="text-base leading-snug text-card-foreground">
                                                    {campaign.title}
                                                </CardTitle>
                                                <p className="line-clamp-2 text-sm text-muted-foreground">
                                                    {campaign.summary || "프로젝트 소개가 준비 중입니다."}
                                                </p>
                                                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                    <Clock3 className="h-3.5 w-3.5" />
                                                    {campaign.deadlineText} · {campaign.leftLabel}
                                                </p>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                                    <div
                                                        className="h-full rounded-full bg-primary transition-all duration-500"
                                                        style={{ width: `${Math.min(campaign.progressRate, 100)}%` }}
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold text-card-foreground">
                                                        {campaign.currentAmountText}
                                                    </p>
                                                    <p className="text-sm font-bold text-primary">
                                                        {campaign.progressRateText}%
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                                        <Users className="h-3.5 w-3.5" />
                                                        {campaign.supporterCount.toLocaleString()}명 참여
                                                    </p>
                                                    <Button asChild size="sm" className="rounded-full px-4">
                                                        <Link to={`/funding/${encodeIdPathSegment(campaign.id)}`}>
                                                            자세히
                                                            <ArrowRight className="h-3.5 w-3.5" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </section>

                                <InfiniteListFooter
                                    sentinelRef={listSentinelRef}
                                    hasNextPage={fundingListQuery.hasNextPage}
                                    isFetchingNextPage={fundingListQuery.isFetchingNextPage}
                                    endMessage="노출 중인 펀딩을 모두 확인했습니다."
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
                    scope="funding"
                    title="펀딩 검색"
                    description="카테고리와 상태로 필터링하면 현재 페이지에서 바로 결과를 확인할 수 있습니다."
                    placeholder="펀딩명, 카테고리, 상태"
                    categories={fundingCategories.length > 0 ? fundingCategories : ["전체"]}
                    statuses={fundingStatuses.length > 0 ? fundingStatuses : ["전체"]}
                />
            </aside>
        </div>
    );
}
