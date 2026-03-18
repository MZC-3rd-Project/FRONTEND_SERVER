import { Link, useParams, useSearchParams } from "react-router";
import { AlertCircle, Flame, PackageCheck, RefreshCw, Store, Timer } from "lucide-react";

import StickyStoreChat from "@/components/chat/StickyStoreChat.jsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { DEAL_IMAGE_PLACEHOLDER } from "@/domains/client/deals/lib/dealsMappers";
import { useHotDealDetailQuery } from "@/domains/client/deals/query/useDealsQueries";

function ratingText(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function DealDetailSkeleton() {
    return (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <div className="order-2 space-y-6 lg:order-1">
                <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                        <div className="h-56 animate-pulse rounded-2xl bg-muted sm:h-64" />
                        <div className="space-y-3">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
                            <div className="h-4 w-full animate-pulse rounded bg-muted" />
                            <div className="h-20 w-full animate-pulse rounded-2xl bg-muted" />
                        </div>
                    </div>
                </section>
                <Card className="h-48 animate-pulse bg-card" />
                <Card className="h-48 animate-pulse bg-card" />
            </div>
            <aside className="order-1 lg:order-2">
                <Card className="h-48 animate-pulse bg-card" />
            </aside>
        </div>
    );
}

function renderProductImage(imageUrl, title, className) {
    if (!imageUrl) {
        return (
            <div className={`${className} grid place-items-center rounded-2xl bg-muted text-sm text-muted-foreground`}>
                이미지 준비 중
            </div>
        );
    }

    return <img src={imageUrl} alt={title} className={className} />;
}

function DealDetailPage() {
    const { dealId } = useParams();
    const [searchParams] = useSearchParams();
    const itemId = searchParams.get("itemId") ?? "";
    const itemType = searchParams.get("itemType") ?? "PRODUCT";
    const { data: deal, isLoading, isError, error, refetch, isFetching } = useHotDealDetailQuery({
        hotDealId: dealId,
        itemId,
        itemType,
    });

    if (isLoading) {
        return <DealDetailSkeleton />;
    }

    if (isError) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>핫딜 상품을 불러오지 못했습니다</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>상세 조회 실패</AlertTitle>
                            <AlertDescription>{error?.message ?? "잠시 후 다시 시도해 주세요."}</AlertDescription>
                        </Alert>
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" onClick={() => refetch()} disabled={isFetching}>
                                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                                다시 시도
                            </Button>
                            <Button asChild variant="outline">
                                <Link to="/deals">핫딜 목록으로 이동</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!deal) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>핫딜 상품을 찾을 수 없습니다</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="rounded-full px-5">
                            <Link to="/deals">핫딜 목록으로 이동</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const product = deal.item;
    const store = deal.store;
    const reviews = deal.reviews;

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <div className="order-2 space-y-6 lg:order-1">
                <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                        {renderProductImage(
                            product.thumbnailUrl || deal.thumbnailUrl || DEAL_IMAGE_PLACEHOLDER,
                            product.title,
                            "h-56 w-full rounded-2xl object-cover sm:h-64"
                        )}
                        <div className="space-y-3">
                            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-destructive">
                                <Flame className="h-3.5 w-3.5" />
                                Hot Deal Product
                            </p>
                            <h2 className="text-2xl font-black tracking-tight text-foreground">{product.title}</h2>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="destructive">{deal.discountLabel}</Badge>
                                <Badge>{deal.status}</Badge>
                                <Badge variant="outline">{deal.category}</Badge>
                            </div>
                            {store.name ? <p className="text-sm text-muted-foreground">판매 스토어: {store.name}</p> : null}
                            <p className="text-sm text-muted-foreground">{deal.summary}</p>

                            <div className="rounded-2xl border border-border bg-accent/40 p-3">
                                <p className="text-xs text-muted-foreground">핫딜 가격</p>
                                {deal.originalPrice ? (
                                    <p className="text-xs text-muted-foreground line-through">{deal.originalPriceText}</p>
                                ) : null}
                                <p className="text-2xl font-bold text-foreground">{deal.discountedPriceText}</p>
                                <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    <Timer className="h-3.5 w-3.5" />
                                    남은 시간 {deal.leftLabel} · 할인율 {deal.discountLabel}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    남은 수량 {deal.remainingQuantity.toLocaleString()}개 · 판매 {deal.soldQuantity.toLocaleString()}개
                                </p>
                                {deal.maxPerUser ? (
                                    <p className="mt-1 text-xs text-muted-foreground">1인당 최대 {deal.maxPerUser}개 구매 가능</p>
                                ) : null}
                            </div>

                            <div className="flex gap-2 pt-1">
                                {deal.canPurchase ? (
                                    <Button asChild className="rounded-full px-5">
                                        <Link to="/checkout">지금 구매</Link>
                                    </Button>
                                ) : (
                                    <Button disabled className="rounded-full px-5">구매 불가</Button>
                                )}
                                <Button asChild variant="outline" className="rounded-full px-5">
                                    <Link to="/deals">목록으로</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">상품 핵심 포인트</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        {product.features.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {product.features.map((feature) => (
                                    <Badge key={feature} variant="outline">{feature}</Badge>
                                ))}
                            </div>
                        ) : (
                            <p>등록된 핵심 포인트가 없습니다.</p>
                        )}
                    </CardContent>
                </Card>

                <section className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Product Story</p>
                        <h3 className="mt-1 text-xl font-bold text-foreground">상품 상세 소개</h3>
                    </div>
                    {product.detailSections.length > 0 ? (
                        product.detailSections.map((section) => (
                            <Card key={section.id} className="overflow-hidden">
                                {renderProductImage(
                                    section.image || DEAL_IMAGE_PLACEHOLDER,
                                    section.title,
                                    "h-64 w-full object-cover sm:h-80"
                                )}
                                <CardContent className="space-y-3 pt-5">
                                    <h4 className="text-lg font-bold text-foreground">{section.title}</h4>
                                    <p className="text-sm text-muted-foreground">{section.description}</p>
                                    {section.highlights.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {section.highlights.map((highlight) => (
                                                <Badge key={highlight} variant="outline">{highlight}</Badge>
                                            ))}
                                        </div>
                                    ) : null}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="pt-6 text-sm text-muted-foreground">
                                상품 상세 소개는 준비 중입니다.
                            </CardContent>
                        </Card>
                    )}
                </section>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <PackageCheck className="h-4 w-4 text-primary" />
                            구매 후기
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review.id} className="rounded-xl border border-border bg-accent/40 p-3 text-sm">
                                    <p className="font-semibold text-foreground">
                                        {review.user} <span className="ml-1 text-yellow-400">{ratingText(review.rating)}</span>
                                    </p>
                                    <p className="mt-1 text-muted-foreground">{review.comment}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">등록된 구매 후기가 없습니다.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Store className="h-4 w-4 text-primary" />
                            핫딜 안내
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-muted-foreground">
                        {store.name ? <p>{store.name}</p> : null}
                        {store.tagline ? <p>{store.tagline}</p> : null}
                        <p>핫딜은 남은 시간/수량 기준으로 종료될 수 있습니다.</p>
                        <p>현재 재고 {deal.stock.availableQuantity.toLocaleString()}개 기준으로 바로 구매가 가능합니다.</p>
                        <p>종료 후 동일 상품은 일반 판매 가격이 적용됩니다.</p>
                    </CardContent>
                </Card>
                <div className="mt-4">
                    <StickyStoreChat storeName={store.name || "스토어"} />
                </div>
            </aside>
        </div>
    );
}

export default DealDetailPage;
