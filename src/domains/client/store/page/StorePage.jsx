import { useMemo, useState } from "react";
import { Link } from "react-router";
import { AlertCircle, ArrowRight, MapPin, Phone, RefreshCw, Store as StoreIcon, UserRound } from "lucide-react";

import StickySearchPanel from "@/components/search/StickySearchPanel.jsx";
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
import {
    isSearchCriteriaActive,
    mapStoreStatusLabelToQueryStatus,
} from "@/domains/client/search/lib/searchMappers";
import { STORE_IMAGE_PLACEHOLDER } from "@/domains/client/store/lib/storeMappers";
import { useInfiniteStoresQuery } from "@/domains/client/store/query/useStoreQueries";

function getStoreStatusVariant(statusCode) {
    if (statusCode === "ACTIVE") return "default";
    if (statusCode === "INACTIVE") return "secondary";
    return "destructive";
}

function flattenPages(data) {
    return data?.pages?.flatMap((page) => page.items ?? []) ?? [];
}

function StoreListSkeleton() {
    return (
        <section className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
                <Card key={`store-skeleton-${index}`} className="overflow-hidden border-border bg-card">
                    <div className="h-48 w-full animate-pulse bg-muted" />
                    <CardHeader className="space-y-3 pb-2">
                        <div className="flex items-center justify-between gap-2">
                            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                        </div>
                        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-28 animate-pulse rounded bg-muted" />
                            <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}

function StorePage() {
    const [appliedSearch, setAppliedSearch] = useState({
        keyword: "",
        category: "전체",
        status: "전체",
    });
    const isInlineSearchActive = isSearchCriteriaActive(appliedSearch);
    const storesQuery = useInfiniteStoresQuery({
        q: appliedSearch.keyword || undefined,
        status: mapStoreStatusLabelToQueryStatus(appliedSearch.status) || undefined,
        size: 12,
    });
    const stores = useMemo(() => flattenPages(storesQuery.data), [storesQuery.data]);
    const storeStatuses = ["전체", "운영중", "비활성", "중지"];

    const sentinelRef = useInfiniteScrollTrigger({
        enabled: storesQuery.hasNextPage && !storesQuery.isFetchingNextPage,
        onIntersect: () => storesQuery.fetchNextPage(),
    });

    return (
        <div className="grid items-start gap-4 md:grid-cols-[1fr_320px]">
            <div className="order-2 space-y-6 md:order-1">
                <section className="rounded-3xl border border-border bg-background p-6 sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Store Discovery</p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">가게 둘러보기</h2>
                            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                                운영자 정보와 기본 소개, 공개된 상품 요약을 기준으로 스토어를 확인하세요.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => storesQuery.refetch()}
                            disabled={storesQuery.isFetching}
                        >
                            <RefreshCw className={`h-4 w-4 ${storesQuery.isFetching ? "animate-spin" : ""}`} />
                            새로고침
                        </Button>
                    </div>
                </section>

                {isInlineSearchActive ? (
                    <section className="rounded-3xl border border-primary/15 bg-primary/5 p-4 text-sm">
                        <p className="font-semibold text-foreground">스토어 목록을 현재 페이지 안에서 바로 필터링하는 중입니다.</p>
                        <p className="mt-1 text-muted-foreground">
                            스토어명과 상태 조건을 적용해 검색 결과를 같은 레이아웃으로 계속 탐색할 수 있습니다.
                        </p>
                    </section>
                ) : null}

                {storesQuery.isPending ? <StoreListSkeleton /> : null}

                {!storesQuery.isPending && storesQuery.isError ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>스토어 목록을 불러오지 못했습니다.</AlertTitle>
                        <AlertDescription className="mt-2 flex flex-wrap items-center gap-2">
                            <span>{storesQuery.error?.message ?? "잠시 후 다시 시도해 주세요."}</span>
                            <Button type="button" size="sm" variant="outline" onClick={() => storesQuery.refetch()}>
                                다시 시도
                            </Button>
                        </AlertDescription>
                    </Alert>
                ) : null}

                {!storesQuery.isPending && !storesQuery.isError && stores.length === 0 ? (
                    <Empty className="rounded-3xl border border-border bg-card">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <StoreIcon className="size-5" />
                            </EmptyMedia>
                            <EmptyTitle>{isInlineSearchActive ? "조건에 맞는 스토어가 없습니다" : "노출 중인 스토어가 없습니다"}</EmptyTitle>
                            <EmptyDescription>
                                {isInlineSearchActive
                                    ? "다른 키워드나 상태로 다시 검색해 보세요."
                                    : "현재 공개된 스토어가 없습니다. 잠시 후 다시 확인해 주세요."}
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button type="button" variant="outline" onClick={() => storesQuery.refetch()}>
                                목록 다시 불러오기
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : null}

                {!storesQuery.isPending && !storesQuery.isError && stores.length > 0 ? (
                    <div className="space-y-4">
                        <section className="grid gap-4 lg:grid-cols-2">
                            {stores.map((store) => (
                                <Card key={store.id} className="overflow-hidden">
                                    <img
                                        src={store.thumbnailUrl || STORE_IMAGE_PLACEHOLDER}
                                        alt={store.name}
                                        className="h-48 w-full object-cover"
                                    />
                                    <CardHeader className="space-y-2 pb-1">
                                        <div className="flex items-center justify-between gap-2 text-xs">
                                            <Badge variant="outline">스토어</Badge>
                                            <Badge variant={getStoreStatusVariant(store.statusCode)}>{store.status}</Badge>
                                        </div>
                                        <CardTitle className="text-lg">{store.name}</CardTitle>
                                        <p className="line-clamp-2 text-sm text-muted-foreground">{store.description}</p>
                                    </CardHeader>

                                    <CardContent className="space-y-3 text-sm">
                                        <div className="rounded-xl border border-border bg-muted p-3">
                                            <div className="space-y-2 text-xs text-muted-foreground">
                                                <p className="inline-flex items-center gap-1.5">
                                                    <UserRound className="h-3.5 w-3.5" />
                                                    운영자 {store.ownerNickname}
                                                </p>
                                                <p className="inline-flex items-center gap-1.5">
                                                    <Phone className="h-3.5 w-3.5" />
                                                    {store.contactValue}
                                                </p>
                                                <p className="inline-flex items-center gap-1.5">
                                                    <MapPin className="h-3.5 w-3.5" />
                                                    {store.address}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <p className="text-xs text-muted-foreground">공개 정보 기준으로 연결된 스토어입니다.</p>
                                            <Button asChild className="rounded-full px-4">
                                                <Link to={`/store/${store.id}`}>
                                                    가게 보기
                                                    <ArrowRight className="h-3.5 w-3.5" />
                                                </Link>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </section>

                        <InfiniteListFooter
                            sentinelRef={sentinelRef}
                            hasNextPage={storesQuery.hasNextPage}
                            isFetchingNextPage={storesQuery.isFetchingNextPage}
                            endMessage={isInlineSearchActive ? "스토어 검색 결과를 모두 확인했습니다." : "노출 중인 스토어를 모두 확인했습니다."}
                        />
                    </div>
                ) : null}
            </div>

            <aside className="order-1 md:order-2 md:sticky md:top-24 md:self-start">
                <StickySearchPanel
                    mode="inline"
                    onSearch={setAppliedSearch}
                    scope="store"
                    title="스토어 검색"
                    description="스토어명과 상태 조건으로 현재 페이지 안에서 바로 결과를 필터링합니다."
                    placeholder="스토어명, 운영자"
                    categories={["전체"]}
                    statuses={storeStatuses}
                />
            </aside>
        </div>
    );
}

export default StorePage;
