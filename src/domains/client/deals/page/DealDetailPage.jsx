import { Link, useParams } from "react-router";
import { Flame, PackageCheck, Timer } from "lucide-react";

import StickyStoreChat from "@/components/chat/StickyStoreChat.jsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findDealById } from "@/domains/client/deals/mock/dealsData.js";

function ratingText(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function DealDetailPage() {
    const { dealId } = useParams();
    const deal = findDealById(dealId);

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

    const product = deal.product ?? {
        title: deal.title,
        thumbnail: deal.thumbnail,
        summary: deal.description,
        features: deal.features ?? [],
        detailSections: [],
        reviews: deal.reviews ?? [],
    };

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <div className="order-2 space-y-6 lg:order-1">
                <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                        <img src={product.thumbnail} alt={product.title} className="h-56 w-full rounded-2xl object-cover sm:h-64" />
                        <div className="space-y-3">
                            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-destructive">
                                <Flame className="h-3.5 w-3.5" />
                                Hot Deal Product
                            </p>
                            <h2 className="text-2xl font-black tracking-tight text-foreground">{product.title}</h2>
                            <p className="text-sm text-muted-foreground">판매 스토어: {deal.storeName}</p>
                            <p className="text-sm text-muted-foreground">{product.summary}</p>

                            <div className="rounded-2xl border border-border bg-accent/40 p-3">
                                <p className="text-xs text-muted-foreground">핫딜 가격</p>
                                <p className="text-xs text-muted-foreground line-through">{deal.originalPrice}</p>
                                <p className="text-2xl font-bold text-foreground">{deal.price}</p>
                                <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    <Timer className="h-3.5 w-3.5" />
                                    남은 시간 {deal.left} · 할인율 {deal.discount}
                                </p>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <Button asChild className="rounded-full px-5">
                                    <Link to="/checkout">지금 구매</Link>
                                </Button>
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
                        <div className="flex flex-wrap gap-2">
                            {product.features.map((feature) => (
                                <Badge key={feature} variant="outline">{feature}</Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <section className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Product Story</p>
                        <h3 className="mt-1 text-xl font-bold text-foreground">상품 상세 소개</h3>
                    </div>
                    {product.detailSections.map((section) => (
                        <Card key={section.title} className="overflow-hidden">
                            <img src={section.image} alt={section.title} className="h-64 w-full object-cover sm:h-80" />
                            <CardContent className="space-y-3 pt-5">
                                <h4 className="text-lg font-bold text-foreground">{section.title}</h4>
                                <p className="text-sm text-muted-foreground">{section.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {section.highlights.map((highlight) => (
                                        <Badge key={highlight} variant="outline">{highlight}</Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <PackageCheck className="h-4 w-4 text-primary" />
                            구매 후기
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {product.reviews.map((review) => (
                            <div key={`${deal.id}-${review.user}`} className="rounded-xl border border-border bg-accent/40 p-3 text-sm">
                                <p className="font-semibold text-foreground">
                                    {review.user} <span className="ml-1 text-yellow-400">{ratingText(review.rating)}</span>
                                </p>
                                <p className="mt-1 text-muted-foreground">{review.comment}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">핫딜 안내</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-muted-foreground">
                        <p>핫딜은 남은 시간/수량 기준으로 종료될 수 있습니다.</p>
                        <p>종료 후 동일 상품은 일반 판매 가격이 적용됩니다.</p>
                    </CardContent>
                </Card>
                <div className="mt-4">
                    <StickyStoreChat storeName={deal.storeName} />
                </div>
            </aside>
        </div>
    );
}

export default DealDetailPage;