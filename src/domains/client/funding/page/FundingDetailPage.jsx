import { Link, useParams } from "react-router";
import { AlertCircle, Clock3, HeartHandshake, RefreshCw, Star, Store, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import StickyStoreChat from "@/components/chat/StickyStoreChat.jsx";
import DetailReviewSection from "@/components/commerce/DetailReviewSection.jsx";
import {
    FUNDING_IMAGE_PLACEHOLDER,
} from "@/domains/client/funding/lib/fundingMappers";
import { useFundingCampaignDetailQuery } from "@/domains/client/funding/query/useFundingQueries";

function statusVariant(statusCode) {
    if (statusCode === "ACTIVE") return "default";
    if (statusCode === "SUCCEEDED") return "secondary";
    return "destructive";
}

function FundingDetailSkeleton() {
    return (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <div className="order-2 space-y-6 lg:order-1">
                <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                        <div className="h-56 animate-pulse rounded-2xl bg-muted sm:h-64" />
                        <div className="space-y-3">
                            <div className="h-6 w-24 animate-pulse rounded-full bg-muted" />
                            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
                            <div className="h-4 w-full animate-pulse rounded bg-muted" />
                            <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
                            <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                        </div>
                    </div>
                </section>
                <section className="grid gap-4 md:grid-cols-2">
                    <Card className="h-52 animate-pulse bg-card" />
                    <Card className="h-52 animate-pulse bg-card" />
                </section>
            </div>
            <aside className="order-1 lg:order-2">
                <Card className="h-52 animate-pulse bg-card" />
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

function FundingDetailPage() {
    const { campaignId } = useParams();
    const { data: campaign, isLoading, isError, error, refetch, isFetching } = useFundingCampaignDetailQuery(campaignId);

    if (isLoading) {
        return <FundingDetailSkeleton />;
    }

    if (isError) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>펀딩 프로젝트를 불러오지 못했습니다</CardTitle>
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
                                <Link to="/funding">목록으로 돌아가기</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!campaign) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>펀딩 프로젝트를 찾을 수 없습니다</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="rounded-full px-5">
                            <Link to="/funding">목록으로 돌아가기</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const store = campaign.store;
    const storeLink = store.id ? `/store/${store.id}` : "/store";
    const product = campaign.item;
    const reviews = campaign.reviews ?? product.reviews ?? [];
    const canSupport = campaign.isSupportable && campaign.rewardOptions.some((reward) => !reward.soldOut);

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <div className="order-2 space-y-6 lg:order-1">
                <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                        {renderProductImage(
                            product.thumbnailUrl || campaign.thumbnailUrl || FUNDING_IMAGE_PLACEHOLDER,
                            product.title,
                            "h-56 w-full rounded-2xl object-cover sm:h-64"
                        )}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <Badge>{campaign.category}</Badge>
                                <Badge variant={statusVariant(campaign.statusCode)}>{campaign.status}</Badge>
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-foreground">{product.title}</h2>
                            <p className="text-sm text-muted-foreground">{campaign.summary}</p>
                            <p className="text-xs text-muted-foreground">메이커: {campaign.makerName}</p>

                            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                <div
                                    className="h-full rounded-full bg-primary transition-all"
                                    style={{ width: `${Math.min(campaign.progressRate, 100)}%` }}
                                />
                            </div>
                            <div className="grid gap-1 text-sm text-muted-foreground">
                                <p className="font-semibold text-foreground">{campaign.currentAmountText}</p>
                                <p>목표 {campaign.goalAmountText} · 달성률 {campaign.progressRateText}%</p>
                                <p className="inline-flex items-center gap-1 text-xs">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    {campaign.deadlineText} · {campaign.leftLabel}
                                </p>
                                <p className="inline-flex items-center gap-1 text-xs">
                                    <Users className="h-3.5 w-3.5" />
                                    {campaign.supporterCount.toLocaleString()}명 참여
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 pt-1">
                                {canSupport ? (
                                    <Button asChild className="rounded-full px-5">
                                        <Link to={`/funding/${campaign.id}/support`}>
                                            <HeartHandshake className="h-4 w-4" />
                                            후원하기
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button disabled className="rounded-full px-5">
                                        {campaign.isSupportable ? "리워드 준비 중" : "마감된 프로젝트"}
                                    </Button>
                                )}
                                <Button asChild variant="outline" className="rounded-full px-5">
                                    <Link to="/funding">목록으로</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">리워드 구성</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            {campaign.rewardOptions.length > 0 ? (
                                campaign.rewardOptions.map((reward) => (
                                    <div key={reward.id} className="rounded-xl border border-border bg-accent/40 p-3">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-semibold text-foreground">{reward.title}</p>
                                            {reward.soldOut ? <Badge variant="secondary">품절</Badge> : null}
                                        </div>
                                        <p className="text-xs text-muted-foreground">{reward.shippingText}</p>
                                        {reward.availableQuantity !== null ? (
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                남은 수량 {reward.availableQuantity.toLocaleString()}개
                                            </p>
                                        ) : null}
                                        <p className="mt-1 text-sm font-semibold text-foreground">{reward.priceText}</p>
                                    </div>
                                ))
                            ) : (
                                <p>현재 선택 가능한 리워드 정보가 없습니다.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base">프로젝트 안내</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p>1. 결제는 체크아웃 단계에서 진행됩니다.</p>
                            <p>2. 마감 이후 리워드 제작/발송 일정이 확정됩니다.</p>
                            <p>3. 업데이트 공지는 알림 페이지로 전달됩니다.</p>
                            {campaign.isSupportable ? (
                                <p className="rounded-xl border border-border bg-accent/40 p-3 text-xs">
                                    현재 남은 재고 {campaign.stock.availableQuantity.toLocaleString()}개
                                </p>
                            ) : null}
                            {canSupport ? (
                                <Button asChild className="mt-2 rounded-full px-5">
                                    <Link to={`/funding/${campaign.id}/support`}>리워드 선택하고 후원하기</Link>
                                </Button>
                            ) : null}
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Funding Story</p>
                        <h3 className="mt-1 text-xl font-bold text-foreground">펀딩 제품 상세 소개</h3>
                    </div>
                    {product.detailSections.length > 0 ? (
                        product.detailSections.map((section) => (
                            <Card key={section.id} className="overflow-hidden">
                                {renderProductImage(
                                    section.image || FUNDING_IMAGE_PLACEHOLDER,
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

                <section>
                    <DetailReviewSection
                        title="제품 리뷰"
                        averageRating={campaign.averageRating}
                        reviewCount={campaign.reviewCount}
                        reviews={reviews}
                        emptyText="등록된 리뷰가 없습니다."
                    />
                </section>
            </div>

            <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Store className="h-4 w-4 text-primary" />
                            프로젝트 스토어
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p className="font-semibold text-foreground">{store.name}</p>
                        <p>{store.tagline}</p>
                        {store.rating > 0 ? (
                            <p className="inline-flex items-center gap-1 text-xs">
                                <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                평점 {store.rating.toFixed(1)} / 리뷰 {store.reviewCount.toLocaleString()}개
                            </p>
                        ) : null}
                        {store.soldSummary.length > 0 ? (
                            <div className="flex flex-wrap gap-2 pt-1">
                                {store.soldSummary.map((summary) => (
                                    <Badge key={summary} variant="outline">{summary}</Badge>
                                ))}
                            </div>
                        ) : null}
                        <Button asChild variant="outline" className="mt-1 w-full rounded-full">
                            <Link to={storeLink}>스토어 이동</Link>
                        </Button>
                    </CardContent>
                </Card>
                <div className="mt-4">
                    <StickyStoreChat
                        storeName={store.name}
                        itemId={campaign.itemId}
                    />
                </div>
            </aside>
        </div>
    );
}

export default FundingDetailPage;
