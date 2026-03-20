import { Link } from "react-router";
import { AlertCircle, ArrowUpRight, MapPin, Search, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import InfiniteListFooter from "@/components/search/InfiniteListFooter";

function StoreSearchSkeleton() {
    return (
        <section className="grid gap-4 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
                <Card key={`store-search-skeleton-${index}`} className="overflow-hidden">
                    <div className="h-44 w-full animate-pulse bg-muted" />
                    <CardContent className="space-y-3 p-4">
                        <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-full animate-pulse rounded bg-muted" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}

export default function StoreSearchResults({
    items,
    isLoading,
    isError,
    error,
    onRetry,
    hasNextPage,
    isFetchingNextPage,
    sentinelRef,
}) {
    if (isLoading) {
        return <StoreSearchSkeleton />;
    }

    if (isError) {
        return (
            <Card className="border-destructive/40">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle className="h-5 w-5" />
                        스토어 검색 결과를 불러오지 못했습니다
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
                        일치하는 스토어가 없습니다
                    </CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                    다른 키워드나 상태로 다시 찾아보세요.
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <section className="grid gap-4 lg:grid-cols-2">
                {items.map((store) => (
                    <Card key={store.id} className="overflow-hidden border-border bg-card">
                        <img
                            src={store.thumbnailUrl}
                            alt={store.name}
                            className="h-44 w-full object-cover"
                        />
                        <CardContent className="space-y-3 p-4">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                                <span className="rounded-full border border-border bg-muted px-2 py-0.5 font-semibold text-foreground">
                                    스토어
                                </span>
                                <span className="rounded-full border border-border bg-background px-2 py-0.5 text-muted-foreground">
                                    {store.status}
                                </span>
                            </div>

                            <div className="space-y-1">
                                <p className="text-lg font-semibold text-foreground">{store.name}</p>
                                <p className="line-clamp-2 text-sm text-muted-foreground">{store.description}</p>
                                <div className="space-y-1 text-xs text-muted-foreground">
                                    <p className="inline-flex items-center gap-1.5">
                                        <Store className="h-3.5 w-3.5" />
                                        운영자 {store.ownerNickname}
                                    </p>
                                    <p className="inline-flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {store.address}
                                    </p>
                                </div>
                            </div>

                            <Button asChild className="rounded-full px-4">
                                <Link to={`/store/${store.id}`}>
                                    스토어 보기
                                    <ArrowUpRight className="h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <InfiniteListFooter
                sentinelRef={sentinelRef}
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                endMessage="조건에 맞는 스토어를 모두 확인했습니다."
            />
        </div>
    );
}
