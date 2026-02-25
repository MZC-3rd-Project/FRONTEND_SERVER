import { Link, useParams } from "react-router";
import { Boxes, Calendar, MapPin, Star, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findStoreById } from "@/domains/client/store/mock/storeData.js";

function ratingText(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function StoreDetailPage() {
    const { storeId } = useParams();
    const store = findStoreById(storeId);

    if (!store) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-md border-zinc-200/80 bg-white/95">
                    <CardHeader>
                        <CardTitle className="text-zinc-900">가게를 찾을 수 없습니다</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
                            <Link to="/store">가게 목록으로 이동</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Store Detail</p>
                        <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900">{store.name}</h2>
                        <p className="mt-2 text-sm text-zinc-600">{store.tagline}</p>
                    </div>
                    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                        <p className="inline-flex items-center gap-1 font-semibold text-zinc-900">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            {store.rating} / 5.0
                        </p>
                        <p className="text-xs text-zinc-500">가게 리뷰 {store.reviewCount.toLocaleString()}개</p>
                    </div>
                </div>

                <img
                    src={store.thumbnail}
                    alt={store.name}
                    className="mt-4 h-56 w-full rounded-2xl object-cover sm:h-72"
                />

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">가게 판매 이력</p>
                        <div className="flex flex-wrap gap-2">
                            {store.soldSummary.map((summary) => (
                                <span key={summary} className="rounded-full border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700">
                                    {summary}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">가게 활동</p>
                        <ul className="space-y-1 text-sm text-zinc-600">
                            {store.activities.map((activity) => (
                                <li key={activity}>• {activity}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-cyan-700" />
                    <h3 className="text-xl font-bold text-zinc-900">티켓형 상품</h3>
                </div>
                {store.ticketProducts.map((ticket) => (
                    <Card key={ticket.id} className="overflow-hidden border-zinc-200/80 bg-white/95">
                        <img src={ticket.thumbnail} alt={ticket.name} className="h-44 w-full object-cover" />
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-zinc-900">{ticket.name}</CardTitle>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                                <span className="inline-flex items-center gap-1">
                                    <Calendar className="h-3.5 w-3.5" />
                                    {ticket.eventDate}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    {ticket.venue}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[500px] text-left text-sm">
                                    <thead className="text-xs uppercase tracking-wide text-zinc-500">
                                        <tr className="border-b border-zinc-200">
                                            <th className="px-2 py-2 font-semibold">등급</th>
                                            <th className="px-2 py-2 font-semibold">가격</th>
                                            <th className="px-2 py-2 font-semibold">잔여석</th>
                                            <th className="px-2 py-2 font-semibold">총 좌석</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {ticket.tiers.map((tier) => (
                                            <tr key={tier.grade} className="border-b border-zinc-100 text-zinc-700">
                                                <td className="px-2 py-2 font-semibold text-zinc-900">{tier.grade}</td>
                                                <td className="px-2 py-2">{tier.price}</td>
                                                <td className="px-2 py-2">{tier.remaining}석</td>
                                                <td className="px-2 py-2">{tier.total}석</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">상품 리뷰</p>
                                {ticket.reviews.map((review) => (
                                    <div key={`${ticket.id}-${review.user}`} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm">
                                        <p className="font-semibold text-zinc-900">
                                            {review.user} <span className="ml-1 text-amber-500">{ratingText(review.rating)}</span>
                                        </p>
                                        <p className="mt-1 text-zinc-600">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <section className="space-y-4">
                <div className="flex items-center gap-2">
                    <Boxes className="h-5 w-5 text-violet-700" />
                    <h3 className="text-xl font-bold text-zinc-900">재고형 상품</h3>
                </div>
                {store.stockProducts.map((product) => (
                    <Card key={product.id} className="overflow-hidden border-zinc-200/80 bg-white/95">
                        <img src={product.thumbnail} alt={product.name} className="h-44 w-full object-cover" />
                        <CardHeader className="pb-2">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <CardTitle className="text-base text-zinc-900">{product.name}</CardTitle>
                                <span className="rounded-full border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs text-zinc-700">
                                    {product.status}
                                </span>
                            </div>
                            <p className="text-sm text-zinc-500">{product.price} · 재고 {product.stock}개</p>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">상품 리뷰</p>
                            {product.reviews.map((review) => (
                                <div key={`${product.id}-${review.user}`} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm">
                                    <p className="font-semibold text-zinc-900">
                                        {review.user} <span className="ml-1 text-amber-500">{ratingText(review.rating)}</span>
                                    </p>
                                    <p className="mt-1 text-zinc-600">{review.comment}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </section>

            <section>
                <Card className="border-zinc-200/80 bg-white/95">
                    <CardHeader>
                        <CardTitle className="text-base text-zinc-900">가게 리뷰</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {store.storeReviews.map((review) => (
                            <div key={`store-review-${review.user}`} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm">
                                <p className="font-semibold text-zinc-900">
                                    {review.user} <span className="ml-1 text-amber-500">{ratingText(review.rating)}</span>
                                </p>
                                <p className="mt-1 text-zinc-600">{review.comment}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </section>
        </div>
    );
}

export default StoreDetailPage;
