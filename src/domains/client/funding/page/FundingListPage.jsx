import { useMemo } from "react";
import { Link } from "react-router";
import { AlertCircle, ArrowRight, Clock3, RefreshCw, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty.tsx";
import StickySearchPanel from "@/components/search/StickySearchPanel.jsx";
import { FUNDING_IMAGE_PLACEHOLDER } from "@/domains/client/funding/lib/fundingMappers";
import { useFundingCampaignsQuery } from "@/domains/client/funding/query/useFundingQueries";

function getStatusVariant(statusCode) {
    if (statusCode === "ACTIVE") return "default";
    if (statusCode === "SUCCEEDED") return "secondary";
    return "destructive";
}

function FundingListSkeleton() {
    return (
        <section className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
                <Card key={`funding-skeleton-${index}`} className="overflow-hidden border-border bg-card">
                    <div className="h-44 w-full animate-pulse bg-muted" />
                    <CardHeader className="space-y-3 pb-2">
                        <div className="flex items-center justify-between gap-2">
                            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                            <div className="h-6 w-16 animate-pulse rounded-full bg-muted" />
                        </div>
                        <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-2/3 animate-pulse rounded bg-muted" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="h-2 w-full animate-pulse rounded-full bg-muted" />
                        <div className="flex items-center justify-between">
                            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                            <div className="h-5 w-12 animate-pulse rounded bg-muted" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                            <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}

export default function FundingListPage() {
    const { data, isLoading, isError, error, refetch, isFetching } = useFundingCampaignsQuery({ size: 12 });
    const campaigns = useMemo(() => data?.items ?? [], [data?.items]);

    const fundingCategories = useMemo(
        () => ["전체", ...new Set(campaigns.map((campaign) => campaign.category).filter(Boolean))],
        [campaigns]
    );
    const fundingStatuses = useMemo(
        () => ["전체", ...new Set(campaigns.map((campaign) => campaign.status).filter(Boolean))],
        [campaigns]
    );

    return (
        <div className="grid items-start gap-4 md:grid-cols-[1fr_320px]">
            <div className="order-2 space-y-6 md:order-1">
                <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                                Funding
                            </p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight text-card-foreground">
                                지금 주목받는 펀딩
                            </h2>
                            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                                프로젝트별 마감시간과 진행 상태를 확인하고, 원하는 캠페인으로 이동하세요.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full"
                            onClick={() => refetch()}
                            disabled={isFetching}
                        >
                            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                            새로고침
                        </Button>
                    </div>
                </section>

                {isLoading ? (
                    <FundingListSkeleton />
                ) : null}

                {!isLoading && isError ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>펀딩 목록을 불러오지 못했습니다.</AlertTitle>
                        <AlertDescription className="mt-2 flex flex-wrap items-center gap-2">
                            <span>{error?.message ?? "잠시 후 다시 시도해 주세요."}</span>
                            <Button type="button" size="sm" variant="outline" onClick={() => refetch()}>
                                다시 시도
                            </Button>
                        </AlertDescription>
                    </Alert>
                ) : null}

                {!isLoading && !isError && campaigns.length === 0 ? (
                    <Empty className="rounded-3xl border border-border bg-card">
                        <EmptyHeader>
                            <EmptyMedia variant="icon">
                                <Users className="size-5" />
                            </EmptyMedia>
                            <EmptyTitle>노출 중인 펀딩이 없습니다</EmptyTitle>
                            <EmptyDescription>
                                현재 조건에 맞는 캠페인이 없습니다. 잠시 후 다시 확인해 주세요.
                            </EmptyDescription>
                        </EmptyHeader>
                        <EmptyContent>
                            <Button type="button" variant="outline" onClick={() => refetch()}>
                                목록 다시 불러오기
                            </Button>
                        </EmptyContent>
                    </Empty>
                ) : null}

                {!isLoading && !isError && campaigns.length > 0 ? (
                    <section className="grid gap-4 md:grid-cols-2">
                        {campaigns.map((campaign) => (
                            <Card key={campaign.id} className="overflow-hidden border-border bg-card">
                                <img
                                    src={campaign.thumbnailUrl || FUNDING_IMAGE_PLACEHOLDER}
                                    alt={campaign.title}
                                    className="h-44 w-full object-cover"
                                />
                                <CardHeader className="pb-2">
                                    <div className="mb-2 flex items-center justify-between gap-2">
                                        <Badge className="rounded-full px-2 py-0.5 text-xs font-semibold">
                                            {campaign.category}
                                        </Badge>
                                        <Badge
                                            variant={getStatusVariant(campaign.statusCode)}
                                            className="rounded-full px-2 py-0.5 text-xs font-semibold"
                                        >
                                            {campaign.status}
                                        </Badge>
                                    </div>
                                    <CardTitle className="text-base leading-snug text-card-foreground">
                                        {campaign.title}
                                    </CardTitle>
                                    <p className="line-clamp-2 text-sm text-muted-foreground">
                                        {campaign.summary || "프로젝트 소개가 준비 중입니다."}
                                    </p>
                                    <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock3 className="h-3.5 w-3.5" />
                                        {campaign.deadlineText} · {campaign.leftLabel}
                                    </p>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-primary transition-all duration-500"
                                            style={{ width: `${Math.min(campaign.progressRate, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-semibold text-card-foreground">
                                            {campaign.currentAmountText}
                                        </p>
                                        <p className="text-sm font-bold text-primary">
                                            {campaign.progressRateText}%
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                            <Users className="h-3.5 w-3.5" />
                                            {campaign.supporterCount.toLocaleString()}명 참여
                                        </p>
                                        <Button asChild size="sm" className="rounded-full px-4">
                                            <Link to={`/funding/${campaign.id}`}>
                                                자세히
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </section>
                ) : null}
            </div>

            <aside className="order-1 md:order-2 md:sticky md:top-24 md:self-start">
                <StickySearchPanel
                    scope="funding"
                    title="펀딩 검색"
                    description="카테고리와 상태로 캠페인을 필터링하고 검색 결과 페이지에서 확인하세요."
                    placeholder="펀딩명, 카테고리, 상태"
                    categories={fundingCategories.length > 0 ? fundingCategories : ["전체"]}
                    statuses={fundingStatuses.length > 0 ? fundingStatuses : ["전체"]}
                />
            </aside>
        </div>
    );
}
