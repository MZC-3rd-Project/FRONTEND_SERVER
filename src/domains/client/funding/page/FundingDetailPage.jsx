import { Link, useParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function FundingDetailPage() {
    const { campaignId } = useParams();

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Funding Detail</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900">캠페인 상세</h2>
                <p className="mt-2 text-sm text-zinc-600">
                    선택된 캠페인 ID: <span className="font-semibold text-zinc-900">{campaignId}</span>
                </p>
            </section>

            <Card className="border-zinc-200/80 bg-white/90">
                <CardHeader>
                    <CardTitle className="text-base text-zinc-900">다음 구현 대상</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-zinc-600">
                    <p>1. 스토리/리워드 상세 API 연결</p>
                    <p>2. 후원 버튼 + 결제 플로우 연결</p>
                    <p>3. 공지/댓글 탭 구성</p>
                    <Button asChild className="mt-3 rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
                        <Link to="/funding">목록으로 돌아가기</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default FundingDetailPage;
