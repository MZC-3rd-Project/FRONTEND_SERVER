import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AlertCircle, CreditCard, HeartHandshake, RefreshCw, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { buildFundingRewardCartItemInput } from "@/domains/client/cart/lib/cartEntryBuilders";
import { useAddCartItemMutation } from "@/domains/client/cart/query/useCartQueries";
import { useReserveSalesCheckout } from "@/domains/client/checkout/query/useCheckoutQueries";
import {
    buildCartCheckoutReservationPayload,
    buildCheckoutIdempotencyKey,
    createFundingCheckoutReservationState,
    persistFundingCheckoutReservation,
} from "@/domains/client/checkout/lib/checkoutReservation.js";
import { useFundingCampaignDetailQuery } from "@/domains/client/funding/query/useFundingQueries";
import { paymentMethods } from "@/domains/client/order/mock/orderData.js";

function FundingSupportPage() {
    const { campaignId } = useParams();
    const navigate = useNavigate();
    const { data: campaign, isLoading, isError, error, refetch, isFetching } = useFundingCampaignDetailQuery(campaignId);
    const addCartItemMutation = useAddCartItemMutation();
    const reserveCheckoutMutation = useReserveSalesCheckout();

    const [supporterName, setSupporterName] = useState("김도윤");
    const [supporterEmail, setSupporterEmail] = useState("donmoa.user@example.com");
    const [selectedRewardId, setSelectedRewardId] = useState("");
    const [selectedPaymentId, setSelectedPaymentId] = useState(paymentMethods[0]?.id ?? "");
    const [cartFeedback, setCartFeedback] = useState(null);

    const activeRewardId = useMemo(() => {
        if (!campaign?.rewardOptions?.length) {
            return "";
        }

        const hasSelectedReward = campaign.rewardOptions.some(
            (reward) => String(reward.id) === String(selectedRewardId)
        );

        return hasSelectedReward ? String(selectedRewardId) : String(campaign.rewardOptions[0].id);
    }, [campaign, selectedRewardId]);

    const selectedReward = useMemo(
        () => campaign?.rewardOptions.find((reward) => String(reward.id) === activeRewardId),
        [activeRewardId, campaign]
    );
    const selectedRewardStock = selectedReward?.availableQuantity ?? campaign?.stock?.availableQuantity ?? 0;

    if (isLoading) {
        return (
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                <Card className="h-48 animate-pulse bg-card" />
                <Card className="h-48 animate-pulse bg-card" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>후원 정보를 준비하지 못했습니다</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertTitle>조회 실패</AlertTitle>
                            <AlertDescription>{error?.message ?? "잠시 후 다시 시도해 주세요."}</AlertDescription>
                        </Alert>
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" onClick={() => refetch()} disabled={isFetching}>
                                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                                다시 시도
                            </Button>
                            <Button asChild variant="outline">
                                <Link to="/funding">펀딩 목록으로 이동</Link>
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
                            <Link to="/funding">펀딩 목록으로 이동</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const canSubmit = Boolean(selectedReward) && !selectedReward?.soldOut;

    const submitSupport = async () => {
        if (!campaign || !selectedReward) {
            return;
        }

        setCartFeedback(null);

        try {
            const lineItem = buildFundingRewardCartItemInput(campaign, selectedReward);
            const quantity = lineItem.quantity ?? 1;
            const payload = buildCartCheckoutReservationPayload([lineItem]);
            const reservation = await reserveCheckoutMutation.mutateAsync(payload);
            const reservationState = createFundingCheckoutReservationState({
                reservation,
                campaign,
                reward: selectedReward,
                quantity,
                idempotencyKey: payload.idempotencyKey ?? buildCheckoutIdempotencyKey(),
            });

            persistFundingCheckoutReservation(reservationState);
            navigate(`/checkout?mode=funding&campaignId=${encodeURIComponent(String(campaign.id ?? ""))}`, {
                state: { fundingReservation: reservationState },
            });
        } catch (reservationError) {
            setCartFeedback({
                type: "error",
                message: reservationError?.message ?? "펀딩 결제 예약에 실패했습니다.",
            });
        }
    };

    const handleAddToCart = async () => {
        if (!campaign || !selectedReward) {
            return;
        }

        setCartFeedback(null);

        try {
            await addCartItemMutation.mutateAsync(buildFundingRewardCartItemInput(campaign, selectedReward));
            setCartFeedback({
                type: "success",
                message: "선택한 리워드를 장바구니에 담았습니다.",
            });
        } catch (mutationError) {
            setCartFeedback({
                type: "error",
                message: mutationError?.message ?? "장바구니 담기에 실패했습니다.",
            });
        }
    };

    return (
        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-5">
                <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Funding Support</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">후원하기</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        <span className="font-semibold text-foreground">{campaign.title}</span> 프로젝트를 후원하고 리워드를 선택하세요.
                    </p>
                </section>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">리워드 선택</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {campaign.rewardOptions.length > 0 ? (
                            campaign.rewardOptions.map((reward) => (
                                <button
                                    key={reward.id}
                                    type="button"
                                    onClick={() => setSelectedRewardId(String(reward.id))}
                                    disabled={reward.soldOut}
                                    className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                                        activeRewardId === String(reward.id)
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border bg-card text-foreground hover:border-primary hover:bg-accent/40"
                                    } ${reward.soldOut ? "cursor-not-allowed opacity-50" : ""}`}
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <p className="text-sm font-semibold">{reward.title}</p>
                                        {reward.soldOut ? <span className="text-xs">품절</span> : null}
                                    </div>
                                    <p className="mt-1 text-xs opacity-85">{reward.shippingText}</p>
                                    {reward.availableQuantity !== null ? (
                                        <p className="mt-1 text-xs opacity-85">남은 수량 {reward.availableQuantity.toLocaleString()}개</p>
                                    ) : null}
                                    <p className="mt-2 text-base font-bold">{reward.priceText}</p>
                                </button>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">현재 선택 가능한 리워드가 없습니다.</p>
                        )}
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
                            <span className="font-semibold text-foreground">{campaign.title}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>선택 리워드</span>
                            <span className="font-semibold text-foreground">{selectedReward?.title ?? "-"}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>결제 수단</span>
                            <span className="font-semibold text-foreground">
                                {paymentMethods.find((method) => method.id === selectedPaymentId)?.name}
                            </span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>남은 재고</span>
                            <span className="font-semibold text-foreground">
                                {selectedRewardStock.toLocaleString()}개
                            </span>
                        </div>
                        <div className="my-2 h-px bg-border" />
                        <div className="flex items-center justify-between text-base font-bold text-foreground">
                            <span>총 후원 금액</span>
                            <span>{selectedReward?.priceText ?? "-"}</span>
                        </div>

                        <Button
                            type="button"
                            onClick={handleAddToCart}
                            disabled={!canSubmit || addCartItemMutation.isPending}
                            className="mt-2 h-10 w-full rounded-full text-sm font-semibold"
                        >
                            <ShoppingCart className="h-4 w-4" />
                            {addCartItemMutation.isPending ? "담는 중..." : "장바구니 담기"}
                        </Button>
                        <Button asChild variant="outline" className="h-10 w-full rounded-full text-sm font-semibold">
                            <Link to="/cart">장바구니 보기</Link>
                        </Button>
                        <Button
                            type="button"
                            onClick={submitSupport}
                            disabled={!canSubmit || reserveCheckoutMutation.isPending}
                            className="h-10 w-full rounded-full text-sm font-semibold"
                        >
                            <HeartHandshake className="h-4 w-4" />
                            {reserveCheckoutMutation.isPending ? "결제 페이지 준비 중..." : (canSubmit ? "후원 결제 진행" : "후원 준비 중")}
                        </Button>
                        {cartFeedback ? (
                            <Alert variant={cartFeedback.type === "error" ? "destructive" : "default"}>
                                {cartFeedback.type === "error" ? (
                                    <AlertCircle className="h-4 w-4" />
                                ) : (
                                    <ShoppingCart className="h-4 w-4" />
                                )}
                                <AlertTitle>{cartFeedback.type === "error" ? "장바구니 담기 실패" : "장바구니 담기 완료"}</AlertTitle>
                                <AlertDescription>{cartFeedback.message}</AlertDescription>
                            </Alert>
                        ) : null}
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
