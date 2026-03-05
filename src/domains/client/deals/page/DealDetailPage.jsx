import { Link, useParams } from "react-router";
import { Flame, PackageCheck, Timer } from "lucide-react";

import StickyStoreChat from "@/components/chat/StickyStoreChat.jsx";
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
                <Card className="w-full max-w-md border-zinc-200/80 bg-white/95">
                    <CardHeader>
                        <CardTitle className="text-zinc-900">핫딜 상품을 찾을 수 없습니다</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
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
                <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                    <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                        <img src={product.thumbnail} alt={product.title} className="h-56 w-full rounded-2xl object-cover sm:h-64" />
                        <div className="space-y-3">
                            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.18em] text-rose-600">
                                <Flame className="h-3.5 w-3.5" />
                                Hot Deal Product
                            </p>
                            <h2 className="text-2xl font-black tracking-tight text-zinc-900">{product.title}</h2>
                            <p className="text-sm text-zinc-500">판매 스토어: {deal.storeName}</p>
                            <p className="text-sm text-zinc-600">{product.summary}</p>

                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                                <p className="text-xs text-zinc-500">핫딜 가격</p>
                                <p className="text-xs text-zinc-400 line-through">{deal.originalPrice}</p>
                                <p className="text-2xl font-bold text-zinc-900">{deal.price}</p>
                                <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-500">
                                    <Timer className="h-3.5 w-3.5" />
                                    남은 시간 {deal.left} · 할인율 {deal.discount}
                                </p>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <Button asChild className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
                                    <Link to="/checkout">지금 구매</Link>
                                </Button>
                                <Button asChild variant="outline" className="rounded-full border-zinc-300 bg-white px-5 text-zinc-700 hover:bg-zinc-100">
                                    <Link to="/deals">목록으로</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <Card className="border-zinc-200/80 bg-white/95">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base text-zinc-900">상품 핵심 포인트</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-zinc-600">
                        <div className="flex flex-wrap gap-2">
                            {product.features.map((feature) => (
                                <span key={feature} className="rounded-full border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs text-zinc-700">
                                    {feature}
                                </span>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <section className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Product Story</p>
                        <h3 className="mt-1 text-xl font-bold text-zinc-900">상품 상세 소개</h3>
                    </div>
                    {product.detailSections.map((section) => (
                        <Card key={section.title} className="overflow-hidden border-zinc-200/80 bg-white/95">
                            <img src={section.image} alt={section.title} className="h-64 w-full object-cover sm:h-80" />
                            <CardContent className="space-y-3 pt-5">
                                <h4 className="text-lg font-bold text-zinc-900">{section.title}</h4>
                                <p className="text-sm text-zinc-600">{section.description}</p>
                                <div className="flex flex-wrap gap-2">
                                    {section.highlights.map((highlight) => (
                                        <span key={highlight} className="rounded-full border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs text-zinc-700">
                                            {highlight}
                                        </span>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>

                <Card className="border-zinc-200/80 bg-white/95">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
                            <PackageCheck className="h-4 w-4 text-cyan-700" />
                            구매 후기
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {product.reviews.map((review) => (
                            <div key={`${deal.id}-${review.user}`} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm">
                                <p className="font-semibold text-zinc-900">
                                    {review.user} <span className="ml-1 text-amber-500">{ratingText(review.rating)}</span>
                                </p>
                                <p className="mt-1 text-zinc-600">{review.comment}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>

            <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
                <Card className="border-zinc-200/80 bg-white/95">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base text-zinc-900">핫딜 안내</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-zinc-600">
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
