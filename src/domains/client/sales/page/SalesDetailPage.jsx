import { useState } from "react";
import { Link, useParams } from "react-router";
import { AlertCircle, PackageCheck, RefreshCw, ShoppingCart, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import StickyStoreChat from "@/components/chat/StickyStoreChat.jsx";
import { buildSaleCartItemInput } from "@/domains/client/cart/lib/cartEntryBuilders";
import { useAddCartItemMutation } from "@/domains/client/cart/query/useCartQueries";
import { SALES_IMAGE_PLACEHOLDER } from "@/domains/client/sales/lib/salesMappers";
import { useNormalSaleDetailQuery } from "@/domains/client/sales/query/useSalesQueries";

function ratingText(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function SalesDetailSkeleton() {
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

function SalesDetailPage() {
    const { saleId } = useParams();
    const { data: sale, isLoading, isError, error, refetch, isFetching } = useNormalSaleDetailQuery(saleId);
    const addCartItemMutation = useAddCartItemMutation();
    const [cartFeedback, setCartFeedback] = useState(null);

    if (isLoading) {
        return <SalesDetailSkeleton />;
    }

    if (isError) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>{error?.status === 401 ? "로그인이 필요합니다" : "일반판매 상품을 불러오지 못했습니다"}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{error?.status === 401 ? "세션 로그인 필요" : "상세 조회 실패"}</AlertTitle>
                            <AlertDescription>{error?.message ?? "잠시 후 다시 시도해 주세요."}</AlertDescription>
                        </Alert>
                        <div className="flex flex-wrap gap-2">
                            {error?.status === 401 ? (
                                <Button asChild>
                                    <Link to="/auth/login">로그인하러 가기</Link>
                                </Button>
                            ) : null}
                            <Button type="button" onClick={() => refetch()} disabled={isFetching}>
                                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                                다시 시도
                            </Button>
                            <Button asChild variant="outline">
                                <Link to="/sales">판매 목록으로 이동</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!sale) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>상품을 찾을 수 없습니다</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="rounded-full px-5">
                            <Link to="/sales">판매 목록으로 이동</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const product = sale.item;
    const store = sale.store;
    const reviews = sale.reviews;
    const canPurchase = sale.canPurchase;

    const handleAddToCart = async () => {
        setCartFeedback(null);

        try {
            await addCartItemMutation.mutateAsync(buildSaleCartItemInput(sale));
            setCartFeedback({
                type: "success",
                message: "장바구니에 상품을 담았습니다.",
            });
        } catch (mutationError) {
            setCartFeedback({
                type: "error",
                message: mutationError?.message ?? "장바구니 담기에 실패했습니다.",
            });
        }
    };

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <div className="order-2 space-y-6 lg:order-1">
                <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                        {renderProductImage(
                            product.thumbnailUrl || sale.thumbnailUrl || SALES_IMAGE_PLACEHOLDER,
                            product.title,
                            "h-56 w-full rounded-2xl object-cover sm:h-64"
                        )}
                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary">General Sale Product</p>
                            <h2 className="text-2xl font-black tracking-tight text-foreground">{product.title}</h2>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">{sale.itemTypeLabel}</Badge>
                                <Badge>{sale.status}</Badge>
                                <Badge variant="outline">{sale.category}</Badge>
                            </div>
                            {sale.originFunding?.title ? (
                                <p className="text-sm text-muted-foreground">원 프로젝트: {sale.originFunding.title}</p>
                            ) : sale.fundingTitle ? (
                                <p className="text-sm text-muted-foreground">원 프로젝트: {sale.fundingTitle}</p>
                            ) : null}
                            {store.name ? (
                                <p className="text-sm text-muted-foreground">판매 스토어: {store.name}</p>
                            ) : null}
                            <p className="text-sm text-muted-foreground">{sale.summary}</p>

                            <div className="rounded-2xl border border-border bg-accent/40 p-3">
                                <p className="text-xs text-muted-foreground">현재 판매가</p>
                                <p className="text-2xl font-bold text-foreground">{sale.priceText}</p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    남은 수량 {sale.stock.availableQuantity.toLocaleString()}개 · 판매 {sale.stock.soldQuantity.toLocaleString()}개 · {sale.status}
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                                {canPurchase ? (
                                    <>
                                        <Button
                                            type="button"
                                            onClick={handleAddToCart}
                                            disabled={addCartItemMutation.isPending}
                                            className="rounded-full px-5"
                                        >
                                            <ShoppingCart className="h-4 w-4" />
                                            {addCartItemMutation.isPending ? "담는 중..." : "장바구니 담기"}
                                        </Button>
                                        <Button asChild variant="outline" className="rounded-full px-5">
                                            <Link to="/cart">장바구니 보기</Link>
                                        </Button>
                                    </>
                                ) : (
                                    <Button disabled className="rounded-full px-5">구매 불가</Button>
                                )}
                                <Button asChild variant="ghost" className="rounded-full px-5">
                                    <Link to="/sales">목록으로</Link>
                                </Button>
                            </div>
                            {cartFeedback ? (
                                <Alert variant={cartFeedback.type === "error" ? "destructive" : "default"}>
                                    {cartFeedback.type === "error" ? (
                                        <AlertCircle className="h-4 w-4" />
                                    ) : (
                                        <ShoppingCart className="h-4 w-4" />
                                    )}
                                    <AlertTitle>{cartFeedback.type === "error" ? "장바구니 담기 실패" : "장바구니 담기 완료"}</AlertTitle>
                                    <AlertDescription>{cartFeedback.message}</AlertDescription>
                                </Alert>
                            ) : null}
                        </div>
                    </div>
                </section>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">상품 설명</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        <p>{product.description || sale.summary}</p>
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
                                    section.image || SALES_IMAGE_PLACEHOLDER,
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
                            판매 안내
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-muted-foreground">
                        <p>{store.name || "스토어 정보 준비 중"}</p>
                        {store.tagline ? <p>{store.tagline}</p> : null}
                        <p>현재 재고 {sale.stock.availableQuantity.toLocaleString()}개 기준으로 바로 구매가 가능합니다.</p>
                        <p>핫딜 할인 대상 여부는 별도 딜 편성 여부에 따라 달라집니다.</p>
                    </CardContent>
                </Card>
                <div className="mt-4">
                    <StickyStoreChat
                        storeName={store.name || "스토어"}
                        itemId={sale.itemId}
                    />
                </div>
            </aside>
        </div>
    );
}

export default SalesDetailPage;
