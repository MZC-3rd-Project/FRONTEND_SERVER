import { useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import { Calendar, MapPin, Package, Star, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StickyStoreChat from "@/components/chat/StickyStoreChat.jsx";
import { findStoreProduct } from "@/domains/client/store/mock/storeData.js";

function ratingText(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function ProductDetailPage() {
    const { storeId, productType, productId } = useParams();
    const [searchParams] = useSearchParams();
    const result = findStoreProduct(storeId, productType, productId);
    const isTicket = result?.productType === "ticket";
    const product = result?.product;
    const tiers = product?.tiers ?? [];
    const preferredTicketGrade = searchParams.get("ticketGrade") ?? "";
    const [selectedTierGrade, setSelectedTierGrade] = useState(preferredTicketGrade);
    const resolvedTierGrade =
        tiers.find((tier) => tier.grade === selectedTierGrade)?.grade ??
        tiers.find((tier) => tier.grade === preferredTicketGrade)?.grade ??
        tiers[0]?.grade ??
        "";
    const selectedTier = isTicket
        ? tiers.find((tier) => tier.grade === resolvedTierGrade) ?? null
        : null;

    if (!result) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-md border-zinc-200/80 bg-white/95">
                    <CardHeader>
                        <CardTitle className="text-zinc-900">상품을 찾을 수 없습니다</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                        <Button asChild className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
                            <Link to="/store">스토어 목록으로 이동</Link>
                        </Button>
                        <Button asChild variant="outline" className="rounded-full border-zinc-300 bg-white px-5 text-zinc-700 hover:bg-zinc-100">
                            <Link to={`/store/${storeId}`}>가게로 돌아가기</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { store } = result;

    const ticketQuery = isTicket && selectedTier ? `&ticketGrade=${encodeURIComponent(selectedTier.grade)}` : "";
    const directCheckoutLink = `/checkout?mode=direct&storeId=${store.id}&productType=${result.productType}&productId=${product.id}${ticketQuery}`;
    const detailSections = isTicket
        ? [
            {
                title: "현장 몰입도를 높이는 좌석/동선 설계",
                description: "입장부터 착석까지 흐름이 끊기지 않도록 좌석 가이드와 동선을 최적화했습니다.",
                image:
                    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80",
                highlights: ["모바일 티켓 원클릭 확인", "좌석 시야 정보 사전 제공", "현장 입장 대기 최소화"],
            },
            {
                title: "공연 퀄리티를 위한 사운드/연출 포인트",
                description: "라이브 환경에 맞춘 오디오 튜닝과 조명 연출로 곡별 분위기를 극대화합니다.",
                image:
                    "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1400&q=80",
                highlights: ["고해상도 사운드 믹싱", "곡별 라이팅 프리셋", "구간별 카메라 워크 연동"],
            },
            {
                title: "사후 콘텐츠까지 이어지는 팬 경험",
                description: "공연 후에도 리플레이/비하인드 콘텐츠로 참여 경험을 이어갈 수 있습니다.",
                image:
                    "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1400&q=80",
                highlights: ["하이라이트 클립 제공", "공연 후기 커뮤니티", "추가 굿즈 연계 구매"],
            },
        ]
        : [
            {
                title: "핵심 기능을 중심으로 설계된 제품 구조",
                description: "실사용에서 자주 쓰는 기능을 앞세워, 첫 사용부터 편하게 적응할 수 있게 구성했습니다.",
                image:
                    "https://images.unsplash.com/photo-1491933382434-500287f9b54b?auto=format&fit=crop&w=1400&q=80",
                highlights: ["직관적인 조작 방식", "내구성 높은 소재", "사용 환경별 최적화"],
            },
            {
                title: "디테일한 소재 선택과 마감 품질",
                description: "촉감, 밀도, 마감까지 품질 편차를 줄이기 위해 생산 공정을 세분화했습니다.",
                image:
                    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=1400&q=80",
                highlights: ["기능성 소재 적용", "모서리/이음부 마감 강화", "장기 사용 테스트 완료"],
            },
            {
                title: "배송/보관/재구매까지 고려한 운영",
                description: "재고형 상품 특성에 맞춰 포장 안정성과 재입고 안내 체계를 함께 제공합니다.",
                image:
                    "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1400&q=80",
                highlights: ["완충 포장 기준 통일", "재고/품절 상태 실시간 반영", "재구매 고객 우선 알림"],
            },
        ];

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <div className="order-2 space-y-6 lg:order-1">
                <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                    <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                        <img src={product.thumbnail} alt={product.name} className="h-56 w-full rounded-2xl object-cover sm:h-64" />
                        <div className="space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">
                                {isTicket ? "Ticket Product" : "Stock Product"}
                            </p>
                            <h2 className="text-2xl font-black tracking-tight text-zinc-900">{product.name}</h2>
                            <p className="text-sm text-zinc-500">{store.name}</p>

                            {isTicket ? (
                                <div className="space-y-1 text-sm text-zinc-600">
                                    <p className="inline-flex items-center gap-1">
                                        <Calendar className="h-3.5 w-3.5" />
                                        {product.eventDate}
                                    </p>
                                    <p className="inline-flex items-center gap-1">
                                        <MapPin className="h-3.5 w-3.5" />
                                        {product.venue}
                                    </p>
                                    {selectedTier && (
                                        <p className="text-xs font-semibold text-zinc-800">
                                            선택 좌석: {selectedTier.grade} · {selectedTier.price} ({selectedTier.remaining}석 남음)
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="space-y-1 text-sm text-zinc-600">
                                    <p className="font-semibold text-zinc-900">{product.price}</p>
                                    <p>
                                        재고 {product.stock}개 · {product.status}
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2 pt-1">
                                {isTicket ? (
                                    <Button
                                        asChild
                                        disabled={!selectedTier || selectedTier.remaining <= 0}
                                        className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700 disabled:cursor-not-allowed disabled:bg-zinc-300 disabled:text-zinc-600"
                                    >
                                        <Link to={directCheckoutLink}>선택 좌석으로 구매</Link>
                                    </Button>
                                ) : (
                                    <Button asChild className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
                                        <Link to={directCheckoutLink}>바로 구매</Link>
                                    </Button>
                                )}
                                <Button asChild variant="outline" className="rounded-full border-zinc-300 bg-white px-5 text-zinc-700 hover:bg-zinc-100">
                                    <Link to={`/store/${store.id}`}>가게로 이동</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                {isTicket && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Ticket className="h-5 w-5 text-cyan-700" />
                            <h3 className="text-xl font-bold text-zinc-900">티켓 정보</h3>
                        </div>

                        <Card className="border-zinc-200/80 bg-white/95">
                            <CardContent className="space-y-3 pt-5 text-sm text-zinc-600">
                                <p className="inline-flex items-center gap-1">
                                    <Calendar className="h-4 w-4" />
                                    공연 일정: {product.eventDate}
                                </p>
                                <p className="inline-flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    공연 장소: {product.venue}
                                </p>
                                <div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">좌석 선택</p>
                                    <div className="flex flex-wrap gap-2">
                                        {product.tiers.map((tier) => (
                                            <button
                                                key={tier.grade}
                                                type="button"
                                                onClick={() => setSelectedTierGrade(tier.grade)}
                                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                                    resolvedTierGrade === tier.grade
                                                        ? "border-zinc-900 bg-zinc-900 text-white"
                                                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-500"
                                                }`}
                                            >
                                                {tier.grade} · {tier.price}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white">
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
                                            {product.tiers.map((tier) => (
                                                <tr
                                                    key={tier.grade}
                                                    className={`border-b text-zinc-700 ${
                                                        resolvedTierGrade === tier.grade ? "border-cyan-200 bg-cyan-50/60" : "border-zinc-100"
                                                    }`}
                                                >
                                                    <td className="px-2 py-2 font-semibold text-zinc-900">{tier.grade}</td>
                                                    <td className="px-2 py-2">{tier.price}</td>
                                                    <td className="px-2 py-2">{tier.remaining}석</td>
                                                    <td className="px-2 py-2">{tier.total}석</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                )}

                <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                    <Card className="border-zinc-200/80 bg-white/95">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-zinc-900">가게 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-zinc-600">
                            <p className="text-base font-semibold text-zinc-900">{store.name}</p>
                            <p>{store.tagline}</p>
                            <p className="inline-flex items-center gap-1 text-xs">
                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                평점 {store.rating} / 리뷰 {store.reviewCount.toLocaleString()}개
                            </p>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {store.soldSummary.slice(0, 3).map((summary) => (
                                    <span key={summary} className="rounded-full border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs text-zinc-600">
                                        {summary}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-200/80 bg-white/95">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base text-zinc-900">상품 핵심 정보</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-zinc-600">
                            <p>카테고리: {product.category}</p>
                            {isTicket ? (
                                <>
                                    <p>운영 형태: 티켓형 상품</p>
                                    <p>현장 입장 전 모바일 티켓 확인 필수</p>
                                </>
                            ) : (
                                <>
                                    <p>운영 형태: 재고형 상품</p>
                                    <p>재고 소진 시 일시 품절될 수 있습니다.</p>
                                </>
                            )}
                            <Button asChild variant="ghost" className="h-8 rounded-full px-3 text-zinc-700 hover:bg-zinc-100">
                                <Link to={`/store/${store.id}`}>가게 상세 더보기</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Product Story</p>
                        <h3 className="mt-1 text-xl font-bold text-zinc-900">상세 소개</h3>
                    </div>
                    {detailSections.map((section) => (
                        <Card key={section.title} className="overflow-hidden border-zinc-200/80 bg-white/95">
                            <img src={section.image} alt={section.title} className="h-60 w-full object-cover sm:h-72" />
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

                {!isTicket && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-violet-700" />
                            <h3 className="text-xl font-bold text-zinc-900">재고/배송 정보</h3>
                        </div>
                        <Card className="border-zinc-200/80 bg-white/95">
                            <CardContent className="space-y-2 pt-5 text-sm text-zinc-600">
                                <p>판매가: <span className="font-semibold text-zinc-900">{product.price}</span></p>
                                <p>재고 상태: {product.status}</p>
                                <p>남은 수량: {product.stock}개</p>
                                <p>배송 안내: 결제 후 1~2영업일 내 출고</p>
                            </CardContent>
                        </Card>
                    </section>
                )}

                <section>
                    <Card className="border-zinc-200/80 bg-white/95">
                        <CardHeader>
                            <CardTitle className="text-base text-zinc-900">상품 리뷰</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
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
                </section>
            </div>

            <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
                <StickyStoreChat storeName={store.name} />
            </aside>
        </div>
    );
}

export default ProductDetailPage;
