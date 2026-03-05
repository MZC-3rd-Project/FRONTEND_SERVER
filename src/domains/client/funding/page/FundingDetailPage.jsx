import { Link, useParams } from "react-router";
import { Clock3, HeartHandshake, Star, Store, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StickyStoreChat from "@/components/chat/StickyStoreChat.jsx";
import { findFundingById } from "@/domains/client/funding/mock/fundingData.js";

function statusClassName(status) {
    if (status === "진행중") return "bg-emerald-100 text-emerald-700";
    if (status === "완료") return "bg-blue-100 text-blue-700";
    return "bg-rose-100 text-rose-700";
}

function ratingText(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function FundingDetailPage() {
    const { campaignId } = useParams();
    const campaign = findFundingById(campaignId);

    if (!campaign) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-md border-zinc-200/80 bg-white/95">
                    <CardHeader>
                        <CardTitle className="text-zinc-900">펀딩 프로젝트를 찾을 수 없습니다</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
                            <Link to="/funding">목록으로 돌아가기</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const store = campaign.store ?? {
        name: campaign.maker,
        tagline: "프로젝트를 운영하는 파트너 스토어",
        rating: 4.8,
        reviewCount: 0,
        soldSummary: [],
    };
    const storeLink = store.id ? `/store/${store.id}` : "/store";
    const isSupportable = campaign.status === "진행중";
    const product = campaign.product ?? {
        title: campaign.name,
        thumbnail: campaign.thumbnail,
        summary: campaign.summary,
        detailSections: campaign.detailSections ?? [],
        reviews: campaign.productReviews ?? [],
    };

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <div className="order-2 space-y-6 lg:order-1">
                <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                    <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                        <img src={product.thumbnail} alt={product.title} className="h-56 w-full rounded-2xl object-cover sm:h-64" />
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="rounded-full bg-zinc-900 px-2 py-0.5 text-[11px] font-semibold text-white">{campaign.category}</span>
                                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${statusClassName(campaign.status)}`}>
                                    {campaign.status}
                                </span>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-zinc-900">{product.title}</h2>
                            <p className="text-sm text-zinc-600">{product.summary}</p>
                            <p className="text-xs text-zinc-500">메이커: {campaign.maker}</p>

                            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                                    style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                                />
                            </div>
                            <div className="grid gap-1 text-sm text-zinc-600">
                                <p className="font-semibold text-zinc-900">{campaign.raised}</p>
                                <p>목표 {campaign.goal} · 달성률 {campaign.progress}%</p>
                                <p className="inline-flex items-center gap-1 text-xs">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    {campaign.deadline} · {campaign.leftLabel}
                                </p>
                                <p className="inline-flex items-center gap-1 text-xs">
                                    <Users className="h-3.5 w-3.5" />
                                    {campaign.supporters.toLocaleString()}명 참여
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                                {isSupportable ? (
                                    <Button asChild className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
                                        <Link to={`/funding/${campaign.id}/support`}>
                                            <HeartHandshake className="h-4 w-4" />
                                            후원하기
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button disabled className="rounded-full bg-zinc-300 px-5 text-zinc-600">
                                        마감된 프로젝트
                                    </Button>
                                )}
                                <Button asChild variant="outline" className="rounded-full border-zinc-300 bg-white px-5 text-zinc-700 hover:bg-zinc-100">
                                    <Link to="/funding">목록으로</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                    <Card className="border-zinc-200/80 bg-white/95">
                        <CardHeader>
                            <CardTitle className="text-base text-zinc-900">리워드 구성</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-zinc-600">
                            {campaign.rewardOptions.map((reward) => (
                                <div key={reward.id} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                                    <p className="font-semibold text-zinc-900">{reward.title}</p>
                                    <p className="text-xs text-zinc-500">{reward.shipping}</p>
                                    <p className="mt-1 text-sm font-semibold text-zinc-900">{reward.price}</p>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="border-zinc-200/80 bg-white/95">
                        <CardHeader>
                            <CardTitle className="text-base text-zinc-900">프로젝트 안내</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-zinc-600">
                            <p>1. 결제는 토스페이먼츠 기반으로 진행됩니다.</p>
                            <p>2. 마감 이후 리워드 제작/발송 일정이 확정됩니다.</p>
                            <p>3. 업데이트 공지는 알림 페이지로 전달됩니다.</p>
                            {isSupportable && (
                                <Button asChild className="mt-2 rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
                                    <Link to={`/funding/${campaign.id}/support`}>리워드 선택하고 후원하기</Link>
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Funding Story</p>
                        <h3 className="mt-1 text-xl font-bold text-zinc-900">펀딩 제품 상세 소개</h3>
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

                <section>
                    <Card className="border-zinc-200/80 bg-white/95">
                        <CardHeader>
                            <CardTitle className="text-base text-zinc-900">제품 리뷰</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {product.reviews.map((review) => (
                                <div key={`${campaign.id}-${review.user}`} className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm">
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
                <Card className="border-zinc-200/80 bg-white/95">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
                            <Store className="h-4 w-4 text-cyan-700" />
                            프로젝트 스토어
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-zinc-600">
                        <p className="font-semibold text-zinc-900">{store.name}</p>
                        <p>{store.tagline}</p>
                        <p className="inline-flex items-center gap-1 text-xs">
                            <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                            평점 {store.rating} / 리뷰 {store.reviewCount.toLocaleString()}개
                        </p>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {store.soldSummary.map((summary) => (
                                <span key={summary} className="rounded-full border border-zinc-300 bg-zinc-50 px-2 py-1 text-xs text-zinc-700">
                                    {summary}
                                </span>
                            ))}
                        </div>
                        <Button asChild variant="outline" className="mt-1 w-full rounded-full border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100">
                            <Link to={storeLink}>스토어 이동</Link>
                        </Button>
                    </CardContent>
                </Card>
                <div className="mt-4">
                    <StickyStoreChat storeName={store.name} />
                </div>
            </aside>
        </div>
    );
}

export default FundingDetailPage;
