import { useState } from "react";
import { Link } from "react-router";
import { AlertCircle, Minus, Plus, RefreshCw, ShoppingBag, ShoppingCart, Trash2 } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
    useCartQuery,
    useChangeCartSelectionMutation,
    useRemoveCartItemMutation,
    useUpdateCartItemQuantityMutation,
} from "@/domains/client/cart/query/useCartQueries";

function CartPageSkeleton() {
    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <div className="h-3 w-16 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-8 w-40 animate-pulse rounded bg-muted" />
                <div className="mt-3 h-4 w-72 animate-pulse rounded bg-muted" />
            </section>

            <Card>
                <CardHeader>
                    <div className="h-5 w-24 animate-pulse rounded bg-muted" />
                </CardHeader>
                <CardContent className="space-y-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="h-28 animate-pulse rounded-2xl border border-border bg-muted" />
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

function EmptyCart() {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">장바구니가 비어 있습니다</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
                <p>판매, 핫딜, 펀딩 리워드에서 원하는 상품을 담아 보세요.</p>
                <div className="flex flex-wrap gap-2">
                    <Button asChild className="rounded-full px-5">
                        <Link to="/sales">판매 상품 보러가기</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full px-5">
                        <Link to="/deals">핫딜 보러가기</Link>
                    </Button>
                    <Button asChild variant="ghost" className="rounded-full px-5">
                        <Link to="/funding">펀딩 보러가기</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

function CartPage() {
    const { data: cart, isLoading, isError, error, refetch, isFetching } = useCartQuery();
    const changeSelectionMutation = useChangeCartSelectionMutation();
    const updateQuantityMutation = useUpdateCartItemQuantityMutation();
    const removeCartItemMutation = useRemoveCartItemMutation();
    const [actionFeedback, setActionFeedback] = useState(null);

    if (isLoading) {
        return <CartPageSkeleton />;
    }

    if (isError) {
        return (
            <div className="space-y-6">
                <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Cart</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">장바구니</h2>
                    <p className="mt-2 text-sm text-muted-foreground">선택한 상품을 확인하고 결제를 진행하세요.</p>
                </section>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-base">장바구니를 불러오지 못했습니다</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>조회 실패</AlertTitle>
                            <AlertDescription>{error?.message ?? "잠시 후 다시 시도해 주세요."}</AlertDescription>
                        </Alert>
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" onClick={() => refetch()} disabled={isFetching}>
                                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                                다시 시도
                            </Button>
                            <Button asChild variant="outline">
                                <Link to="/sales">판매 목록으로 이동</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const resolvedCart = cart ?? {
        itemCount: 0,
        selectedItemCount: 0,
        items: [],
        totalPriceText: "0원",
        selectedTotalPriceText: "0원",
        isEmpty: true,
    };

    const isActionPending =
        changeSelectionMutation.isPending ||
        updateQuantityMutation.isPending ||
        removeCartItemMutation.isPending;

    const handleToggleSelection = async (item, selected) => {
        setActionFeedback(null);

        try {
            await changeSelectionMutation.mutateAsync([
                {
                    itemId: item.itemId,
                    referenceId: item.referenceId,
                    channelType: item.channelType,
                    channelRefId: item.channelRefId || undefined,
                    selected,
                },
            ]);
        } catch (mutationError) {
            setActionFeedback({
                type: "error",
                message: mutationError?.message ?? "선택 상태를 변경하지 못했습니다.",
            });
        }
    };

    const handleChangeQuantity = async (item, nextQuantity) => {
        if (nextQuantity < 1) {
            return;
        }

        setActionFeedback(null);

        try {
            await updateQuantityMutation.mutateAsync({
                itemId: item.itemId,
                referenceId: item.referenceId,
                channelType: item.channelType,
                channelRefId: item.channelRefId || undefined,
                quantity: nextQuantity,
            });
        } catch (mutationError) {
            setActionFeedback({
                type: "error",
                message: mutationError?.message ?? "수량을 변경하지 못했습니다.",
            });
        }
    };

    const handleRemoveItem = async (item) => {
        setActionFeedback(null);

        try {
            await removeCartItemMutation.mutateAsync({
                itemId: item.itemId,
                referenceId: item.referenceId,
                channelType: item.channelType,
                channelRefId: item.channelRefId || undefined,
            });
        } catch (mutationError) {
            setActionFeedback({
                type: "error",
                message: mutationError?.message ?? "상품을 삭제하지 못했습니다.",
            });
        }
    };

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Cart</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">장바구니</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    담아 둔 상품 {resolvedCart.itemCount}건 중 {resolvedCart.selectedItemCount}건이 결제 대상으로 선택되어 있습니다.
                </p>
            </section>

            {resolvedCart.isEmpty ? (
                <EmptyCart />
            ) : (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">선택 상품</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {actionFeedback ? (
                            <Alert variant={actionFeedback.type === "error" ? "destructive" : "default"}>
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>장바구니 상태 반영 실패</AlertTitle>
                                <AlertDescription>{actionFeedback.message}</AlertDescription>
                            </Alert>
                        ) : null}

                        {resolvedCart.items.map((item) => (
                            <div
                                key={item.lineKey}
                                className="flex flex-col gap-4 rounded-2xl border border-border px-4 py-4 sm:flex-row sm:items-center"
                            >
                                <div className="flex items-start gap-3">
                                    <Checkbox
                                        checked={item.selected}
                                        disabled={isActionPending}
                                        onCheckedChange={(checked) => handleToggleSelection(item, checked === true)}
                                        aria-label={`${item.itemTitle} 선택`}
                                        className="mt-1"
                                    />
                                    {item.thumbnailUrl ? (
                                        <img src={item.thumbnailUrl} alt={item.itemTitle} className="h-20 w-20 rounded-xl object-cover" />
                                    ) : (
                                        <div className="grid h-20 w-20 place-items-center rounded-xl bg-muted text-xs text-muted-foreground">
                                            이미지 없음
                                        </div>
                                    )}
                                    <div className="space-y-1">
                                        <p className="font-semibold text-foreground">{item.itemTitle}</p>
                                        <p className="text-xs text-muted-foreground">{item.subtitle}</p>
                                        <p className="text-xs text-muted-foreground">단가 {item.unitPriceText}</p>
                                    </div>
                                </div>

                                <div className="flex flex-1 flex-wrap items-center justify-between gap-3 sm:justify-end">
                                    <div className="flex items-center gap-2 rounded-full border border-border px-2 py-1">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full"
                                            onClick={() => handleChangeQuantity(item, item.quantity - 1)}
                                            disabled={isActionPending || item.quantity <= 1}
                                            aria-label="수량 감소"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="min-w-8 text-center text-sm font-semibold text-foreground">{item.quantity}</span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 rounded-full"
                                            onClick={() => handleChangeQuantity(item, item.quantity + 1)}
                                            disabled={isActionPending}
                                            aria-label="수량 증가"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    <p className="min-w-24 text-right text-sm font-semibold text-foreground">{item.totalPriceText}</p>

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-9 w-9 rounded-full text-muted-foreground"
                                        onClick={() => handleRemoveItem(item)}
                                        disabled={isActionPending}
                                        aria-label="상품 삭제"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        <div className="space-y-3 rounded-2xl border border-border bg-muted px-4 py-4 text-sm">
                            <div className="flex items-center justify-between text-muted-foreground">
                                <p className="font-semibold">전체 상품 금액</p>
                                <p className="font-semibold text-foreground">{resolvedCart.totalPriceText}</p>
                            </div>
                            <div className="flex items-center justify-between text-muted-foreground">
                                <p className="font-semibold">선택 상품 금액</p>
                                <p className="text-base font-bold text-foreground">{resolvedCart.selectedTotalPriceText}</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap justify-end gap-2 pt-2">
                            <Button asChild variant="ghost" className="rounded-full px-5">
                                <Link to="/wishlist">찜 목록</Link>
                            </Button>
                            <Button asChild variant="outline" className="rounded-full px-5">
                                <Link to="/sales">쇼핑 계속하기</Link>
                            </Button>
                            {resolvedCart.selectedItemCount > 0 ? (
                                <Button asChild className="rounded-full px-5">
                                    <Link to="/checkout">
                                        <ShoppingBag className="h-4 w-4" />
                                        선택 상품 결제하기
                                    </Link>
                                </Button>
                            ) : (
                                <Button disabled className="rounded-full px-5">
                                    <ShoppingBag className="h-4 w-4" />
                                    선택 상품 결제하기
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            {!resolvedCart.isEmpty ? (
                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4 text-xs text-foreground">
                        <p className="inline-flex items-center gap-1 font-semibold">
                            <ShoppingCart className="h-3.5 w-3.5" />
                            장바구니 안내
                        </p>
                        <p className="mt-1">
                            현재 응답에는 옵션명/리워드명이 내려오지 않아 장바구니에서는 상품명 중심으로 표시합니다.
                        </p>
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
}

export default CartPage;
