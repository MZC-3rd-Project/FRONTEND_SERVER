import { Link } from "react-router";
import { ArrowRight, Clock3, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StickySearchPanel from "@/components/search/StickySearchPanel.jsx";
import { fundingCampaigns } from "@/domains/client/funding/mock/fundingData.js";
import { cn } from "@/lib/utils";

const fundingCategories = ["전체", ...new Set(fundingCampaigns.map((c) => c.category))];
const fundingStatuses = ["전체", ...new Set(fundingCampaigns.map((c) => c.status))];

// 진행률을 구간별 Tailwind 클래스로 변환
function getFundingProgressClass(progress) {
    const clamped = Math.min(progress, 100);
    if (clamped >= 100) return "w-full";
    if (clamped >= 90) return "w-11/12";
    if (clamped >= 75) return "w-3/4";
    if (clamped >= 50) return "w-1/2";
    if (clamped >= 25) return "w-1/4";
    return "w-1/6";
}

// 상태별 shadcn Badge variant 매핑
function getStatusVariant(status) {
    if (status === "진행중") return "default";
    if (status === "완료") return "secondary";
    return "destructive";
}

export default function FundingListPage() {
    return (
        <div className="grid items-start gap-4 md:grid-cols-[1fr_320px]">
            <div className="order-2 space-y-6 md:order-1">

                {/* 헤더 섹션 */}
                <section className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                        Funding
                    </p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-card-foreground">
                        지금 주목받는 펀딩
                    </h2>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        프로젝트별 마감시간과 진행/완료/실패 상태를 확인하고, 원하는 캠페인으로 이동하세요.
                    </p>
                </section>

                {/* 캠페인 카드 그리드 */}
                <section className="grid gap-4 md:grid-cols-2">
                    {fundingCampaigns.map((campaign) => (
                        <Card key={campaign.id} className="overflow-hidden border-border bg-card">
                            <img
                                src={campaign.thumbnail}
                                alt={campaign.name}
                                className="h-44 w-full object-cover"
                            />
                            <CardHeader className="pb-2">
                                <div className="mb-2 flex items-center justify-between gap-2">
                                    <Badge className="rounded-full px-2 py-0.5 text-xs font-semibold">
                                        {campaign.category}
                                    </Badge>
                                    <Badge
                                        variant={getStatusVariant(campaign.status)}
                                        className="rounded-full px-2 py-0.5 text-xs font-semibold"
                                    >
                                        {campaign.status}
                                    </Badge>
                                </div>
                                <CardTitle className="text-base leading-snug text-card-foreground">
                                    {campaign.name}
                                </CardTitle>
                                <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    {campaign.deadline} · {campaign.leftLabel}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {/* 진행률 바 */}
                                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                    <div
                                        className={cn(
                                            "h-full rounded-full bg-primary transition-all duration-500",
                                            getFundingProgressClass(campaign.progress)
                                        )}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-card-foreground">
                                        {campaign.raised}
                                    </p>
                                    <p className="text-sm font-bold text-primary">
                                        {campaign.progress}%
                                    </p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                        <Users className="h-3.5 w-3.5" />
                                        {campaign.supporters.toLocaleString()}명 참여
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
            </div>

            {/* 사이드바 검색 패널 */}
            <aside className="order-1 md:order-2 md:sticky md:top-24 md:self-start">
                <StickySearchPanel
                    scope="funding"
                    title="펀딩 검색"
                    description="카테고리와 상태로 캠페인을 필터링하고 검색 결과 페이지에서 확인하세요."
                    placeholder="펀딩명, 카테고리, 상태"
                    categories={fundingCategories}
                    statuses={fundingStatuses}
                />
            </aside>
        </div>
    );
}