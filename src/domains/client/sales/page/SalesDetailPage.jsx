import { Link, useParams } from "react-router";
import { PackageCheck, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StickyStoreChat from "@/components/chat/StickyStoreChat.jsx";
import { findSaleById } from "@/domains/client/sales/mock/salesData.js";

function ratingText(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function SalesDetailPage() {
    const { saleId } = useParams();
    const item = findSaleById(saleId);

    if (!item) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-md border-zinc-200/80 bg-white/95">
                    <CardHeader>
                        <CardTitle className="text-zinc-900">상품을 찾을 수 없습니다</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
                            <Link to="/sales">판매 목록으로 이동</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const product = item.product ?? {
        title: item.title,
        thumbnail: item.thumbnail,
        summary: item.description,
        features: item.features ?? [],
        detailSections: [],
        reviews: item.reviews ?? [],
    };

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <div className="order-2 space-y-6 lg:order-1">
                <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                    <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                        <img src={product.thumbnail} alt={product.title} className="h-56 w-full rounded-2xl object-cover sm:h-64" />
                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">General Sale Product</p>
                            <h2 className="text-2xl font-black tracking-tight text-zinc-900">{product.title}</h2>
                            <p className="text-sm text-zinc-500">원 프로젝트: {item.fundingTitle}</p>
                            <p className="text-sm text-zinc-500">판매 스토어: {item.storeName}</p>

                            <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-3">
                                <p className="text-xs text-zinc-500">정가 판매</p>
                                <p className="text-2xl font-bold text-zinc-900">{item.price}</p>
                                <p className="mt-1 text-xs text-zinc-500">
                                    남은 수량 {item.stockLeft}개 · 판매 {item.soldCount}개 · {item.status}
                                </p>
                            </div>

                            <div className="flex gap-2 pt-1">
                                <Button asChild className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
                                    <Link to="/checkout">바로 구매</Link>
                                </Button>
                                <Button asChild variant="outline" className="rounded-full border-zinc-300 bg-white px-5 text-zinc-700 hover:bg-zinc-100">
                                    <Link to="/sales">목록으로</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <Card className="border-zinc-200/80 bg-white/95">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base text-zinc-900">상품 설명</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-zinc-600">
                        <p>{product.summary}</p>
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
                            <div key={`${item.id}-${review.user}`} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm">
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
                        <CardTitle className="text-base text-zinc-900">판매 안내</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-zinc-600">
                        <p>이 페이지의 상품은 핫딜 할인 대상이 아닌 일반 정가 판매 상품입니다.</p>
                        <p>할인은 `핫딜` 탭에서만 적용됩니다.</p>
                    </CardContent>
                </Card>
                <div className="mt-4">
                    <StickyStoreChat storeName={item.storeName} />
                </div>
            </aside>
        </div>
    );
}

export default SalesDetailPage;
