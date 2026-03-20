import { AlertCircle, ArrowUpRight, BadgeDollarSign, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InfiniteListFooter from "@/components/search/InfiniteListFooter";
import { formatCatalogMeta } from "@/domains/client/search/lib/searchMappers";

function CatalogResultSkeleton() {
    return (
        <section className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
                <Card key={`catalog-search-skeleton-${index}`} className="overflow-hidden">
                    <div className="h-44 w-full animate-pulse bg-muted" />
                    <CardContent className="space-y-3 p-4">
                        <div className="flex gap-2">
                            <div className="h-6 w-14 animate-pulse rounded-full bg-muted" />
                            <div className="h-6 w-14 animate-pulse rounded-full bg-muted" />
                        </div>
                        <div className="h-5 w-2/3 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}

export default function CatalogSearchResults({
    items,
    isLoading,
    isError,
    error,
    onRetry,
    onOpenItem,
    pendingItemId,
    hasNextPage,
    isFetchingNextPage,
    sentinelRef,
    emptyTitle = "검색 결과가 없습니다",
    emptyDescription = "키워드나 필터를 바꿔 다시 검색해 주세요.",
    endMessage = "조건에 맞는 결과를 모두 확인했습니다.",
}) {
    if (isLoading) {
        return <CatalogResultSkeleton />;
    }

    if (isError) {
        return (
            <Card className="border-destructive/40">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        검색 결과를 불러오지 못했습니다
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                        {error?.message ?? "잠시 후 다시 시도해 주세요."}
                    </p>
                    <Button type="button" variant="outline" onClick={onRetry}>
                        다시 시도
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!items.length) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-muted-foreground" />
                        {emptyTitle}
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    {emptyDescription}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <section className="grid gap-4 md:grid-cols-2">
                {items.map((item) => {
                    const meta = formatCatalogMeta(item);
                    return (
                        <Card key={`${item.salesChannel}-${item.itemId}`} className="overflow-hidden border-border bg-card">
                            <img
                                src={item.thumbnailUrl}
                                alt={item.title}
                                className="h-44 w-full object-cover"
                            />
                            <CardContent className="space-y-3 p-4">
                                <div className="flex flex-wrap items-center gap-2 text-xs">
                                    <span className="rounded-full border border-border bg-muted px-2 py-0.5 font-semibold text-foreground">
                                        {item.channelLabel}
                                    </span>
                                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-muted-foreground">
                                        {item.itemTypeLabel}
                                    </span>
                                    <span className="rounded-full border border-border bg-background px-2 py-0.5 text-muted-foreground">
                                        {item.statusLabel}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-lg font-semibold text-foreground">{item.title}</p>
                                    <p className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                                        <BadgeDollarSign className="h-4 w-4" />
                                        {item.priceText}
                                    </p>
                                    {meta.length > 0 ? (
                                        <p className="text-xs text-muted-foreground">{meta.join(" · ")}</p>
                                    ) : null}
                                </div>

                                <Button
                                    type="button"
                                    className="rounded-full px-4"
                                    onClick={() => onOpenItem?.(item)}
                                    disabled={pendingItemId === item.itemId}
                                >
                                    {pendingItemId === item.itemId ? "이동 중..." : "상세 보기"}
                                    <ArrowUpRight className="h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </section>

            <InfiniteListFooter
                sentinelRef={sentinelRef}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                endMessage={endMessage}
            />
        </div>
    );
}
