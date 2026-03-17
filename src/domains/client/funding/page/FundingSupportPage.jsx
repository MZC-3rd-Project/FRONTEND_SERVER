import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { CreditCard, HeartHandshake } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { findFundingById } from "@/domains/client/funding/mock/fundingData.js";
import { paymentMethods } from "@/domains/client/order/mock/orderData.js";

function FundingSupportPage() {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const campaign = findFundingById(campaignId);

    const [supporterName, setSupporterName] = useState("김도윤");
    const [supporterEmail, setSupporterEmail] = useState("donmoa.user@example.com");
    const [selectedRewardId, setSelectedRewardId] = useState(campaign?.rewardOptions[0]?.id ?? "");
    const [selectedPaymentId, setSelectedPaymentId] = useState(paymentMethods[0]?.id ?? "");

    const selectedReward = useMemo(
        () => campaign?.rewardOptions.find((reward) => reward.id === selectedRewardId),
        [campaign, selectedRewardId]
    );

    if (!campaign) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>펀딩 프로젝트를 찾을 수 없습니다</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="rounded-full px-5">
                            <Link to="/funding">펀딩 목록으로 이동</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const submitSupport = () => {
        const orderId = `FD${Date.now()}`;
        navigate(`/funding/support/complete?campaignId=${campaign.id}&orderId=${orderId}`);
    };

    return (
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
                <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Funding Support</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">후원하기</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{campaign.name}</span> 프로젝트를 후원하고 리워드를 선택하세요.
                    </p>
                </section>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">리워드 선택</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {campaign.rewardOptions.map((reward) => (
                            <button
                                key={reward.id}
                                type="button"
                                onClick={() => setSelectedRewardId(reward.id)}
                                className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                                    selectedRewardId === reward.id
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-card text-foreground hover:border-primary hover:bg-accent/40"
                                }`}
                            >
                                <p className="text-sm font-semibold">{reward.title}</p>
                                <p className="mt-1 text-xs opacity-85">{reward.shipping}</p>
                                <p className="mt-2 text-base font-bold">{reward.price}</p>
                            </button>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">후원자 정보</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">이름</p>
                            <Input
                                value={supporterName}
                                onChange={(event) => setSupporterName(event.target.value)}
                                className="h-10"
                            />
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">이메일</p>
                            <Input
                                value={supporterEmail}
                                onChange={(event) => setSupporterEmail(event.target.value)}
                                className="h-10"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-5 md:sticky md:top-24 md:self-start">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CreditCard className="h-4 w-4 text-primary" />
                            결제 수단 (토스페이먼츠)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                type="button"
                                onClick={() => setSelectedPaymentId(method.id)}
                                className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                                    selectedPaymentId === method.id
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-card text-foreground hover:border-primary hover:bg-accent/40"
                                }`}
                            >
                                <p className="text-sm font-semibold">{method.name}</p>
                                <p className="mt-1 text-xs opacity-85">{method.description}</p>
                            </button>
                        ))}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">후원 요약</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>프로젝트</span>
                            <span className="font-semibold text-foreground">{campaign.name}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>선택 리워드</span>
                            <span className="font-semibold text-foreground">{selectedReward?.title}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>결제 수단</span>
                            <span className="font-semibold text-foreground">
                                {paymentMethods.find((method) => method.id === selectedPaymentId)?.name}
                            </span>
                        </div>
                        <div className="my-2 h-px bg-border" />
                        <div className="flex items-center justify-between text-base font-bold text-foreground">
                            <span>총 후원 금액</span>
                            <span>{selectedReward?.price ?? "-"}</span>
                        </div>

                        <Button
                            type="button"
                            onClick={submitSupport}
                            className="mt-2 h-10 w-full rounded-full text-sm font-semibold"
                        >
                            <HeartHandshake className="h-4 w-4" />
                            후원 결제 진행
                        </Button>
                        <Button asChild variant="ghost" className="h-9 w-full rounded-full">
                            <Link to={`/funding/${campaign.id}`}>상세로 돌아가기</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default FundingSupportPage;