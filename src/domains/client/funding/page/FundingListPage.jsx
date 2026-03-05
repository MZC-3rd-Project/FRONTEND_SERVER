import { Link } from "react-router";
import { ArrowRight, Clock3, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StickySearchPanel from "@/components/search/StickySearchPanel.jsx";
import { fundingCampaigns } from "@/domains/client/funding/mock/fundingData.js";

const fundingCategories = ["전체", ...new Set(fundingCampaigns.map((campaign) => campaign.category))];
const fundingStatuses = ["전체", ...new Set(fundingCampaigns.map((campaign) => campaign.status))];

function statusClassName(status) {
    if (status === "진행중") return "bg-emerald-100 text-emerald-700";
    if (status === "완료") return "bg-blue-100 text-blue-700";
    return "bg-rose-100 text-rose-700";
}

function FundingListPage() {
    return (
        <div className="grid items-start gap-4 md:grid-cols-[1fr_320px]">
            <div className="order-2 space-y-6 md:order-1">
                <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Funding</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900">지금 주목받는 펀딩</h2>
                    <p className="mt-2 max-w-2xl text-sm text-zinc-600">
                        프로젝트별 마감시간과 진행/완료/실패 상태를 확인하고, 원하는 캠페인으로 이동하세요.
                    </p>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                    {fundingCampaigns.map((campaign) => (
                        <Card key={campaign.id} className="overflow-hidden border-zinc-200/80 bg-white/95">
                            <img src={campaign.thumbnail} alt={campaign.name} className="h-44 w-full object-cover" />
                            <CardHeader className="pb-2">
                                <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                                    <span className="rounded-full bg-zinc-900 px-2 py-0.5 font-semibold text-white">{campaign.category}</span>
                                    <span className={`rounded-full px-2 py-0.5 font-semibold ${statusClassName(campaign.status)}`}>
                                        {campaign.status}
                                    </span>
                                </div>
                                <CardTitle className="text-base leading-snug text-zinc-900">{campaign.name}</CardTitle>
                                <p className="inline-flex items-center gap-1 text-xs text-zinc-500">
                                    <Clock3 className="h-3.5 w-3.5" />
                                    {campaign.deadline} · {campaign.leftLabel}
                                </p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
                                    <div
                                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                                        style={{ width: `${Math.min(campaign.progress, 100)}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-semibold text-zinc-900">{campaign.raised}</p>
                                    <p className="text-sm font-bold text-cyan-700">{campaign.progress}%</p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="inline-flex items-center gap-1 text-xs text-zinc-500">
                                        <Users className="h-3.5 w-3.5" />
                                        {campaign.supporters.toLocaleString()}명 참여
                                    </p>
                                    <Button asChild size="sm" className="rounded-full bg-zinc-900 px-4 text-white hover:bg-zinc-700">
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

export default FundingListPage;
