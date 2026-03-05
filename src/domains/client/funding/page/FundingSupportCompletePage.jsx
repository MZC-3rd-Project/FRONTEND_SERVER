import { Link, useSearchParams } from "react-router";
import { CheckCircle2, HeartHandshake } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { findFundingById } from "@/domains/client/funding/mock/fundingData.js";

function FundingSupportCompletePage() {
    const [params] = useSearchParams();
    const campaignId = params.get("campaignId") ?? "";
    const orderId = params.get("orderId") ?? "FD-DEMO-0001";
    const campaign = findFundingById(campaignId);

    return (
        <div className="mx-auto max-w-3xl space-y-6">
            <section className="rounded-3xl border border-emerald-200 bg-emerald-50/80 p-6 text-emerald-900 shadow-[0_14px_45px_rgba(16,185,129,0.15)] sm:p-8 dark:border-emerald-300/30 dark:bg-emerald-400/10 dark:text-emerald-100">
                <p className="text-xs font-semibold uppercase tracking-[0.18em]">Funding Completed</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight">후원이 완료되었습니다</h2>
                <p className="mt-2 text-sm">후원 내역과 프로젝트 업데이트는 마이페이지에서 확인할 수 있습니다.</p>
            </section>

            <Card className="border-zinc-200/80 bg-white/95">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        후원 정보
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-zinc-600">
                    <div className="flex items-center justify-between">
                        <span>주문번호</span>
                        <span className="font-semibold text-zinc-900">{orderId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>프로젝트</span>
                        <span className="font-semibold text-zinc-900">{campaign?.name ?? "프로젝트"}</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span>메이커</span>
                        <span className="font-semibold text-zinc-900">{campaign?.maker ?? "-"}</span>
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-xs">
                        프로젝트 소식/리워드 발송 일정은 업데이트 탭과 알림으로 전달됩니다.
                    </div>
                </CardContent>
            </Card>

            <div className="flex flex-wrap gap-2">
                <Button asChild className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
                    <Link to="/funding">
                        <HeartHandshake className="h-4 w-4" />
                        다른 펀딩 둘러보기
                    </Link>
                </Button>
                {campaign && (
                    <Button asChild variant="outline" className="rounded-full border-zinc-300 bg-white px-5 text-zinc-700 hover:bg-zinc-100">
                        <Link to={`/funding/${campaign.id}`}>프로젝트로 이동</Link>
                    </Button>
                )}
                <Button asChild variant="ghost" className="rounded-full px-5 text-zinc-700 hover:bg-zinc-100">
                    <Link to="/my">마이페이지로 이동</Link>
                </Button>
            </div>
        </div>
    );
}

export default FundingSupportCompletePage;
