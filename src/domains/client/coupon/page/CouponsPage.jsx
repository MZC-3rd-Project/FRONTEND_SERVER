import { Gift, Wallet } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { coupons } from "@/domains/client/order/mock/orderData.js";

function couponAmountText(coupon) {
    if (coupon.discountType === "amount") return `${coupon.amount.toLocaleString()}원 할인`;
    if (coupon.discountType === "shipping") return "배송비 할인";
    if (coupon.discountType === "percent") return `${coupon.amount}% 할인`;
    return "쿠폰";
}

function CouponsPage() {
    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Coupons & Points</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">쿠폰 / 포인트</h2>
                <p className="mt-2 text-sm text-muted-foreground">보유한 할인 쿠폰과 포인트 잔액을 확인하고 결제 시 적용할 수 있습니다.</p>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
                <Card>
                    <CardContent className="p-4 text-sm">
                        <p className="inline-flex items-center gap-1 text-muted-foreground">
                            <Gift className="h-3.5 w-3.5" />
                            사용 가능 쿠폰
                        </p>
                        <p className="text-2xl font-bold text-foreground">{coupons.length}장</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4 text-sm">
                        <p className="inline-flex items-center gap-1 text-muted-foreground">
                            <Wallet className="h-3.5 w-3.5" />
                            보유 포인트
                        </p>
                        <p className="text-2xl font-bold text-foreground">18,500P</p>
                    </CardContent>
                </Card>
            </section>

            <section className="space-y-3">
                {coupons.map((coupon) => (
                    <Card key={coupon.id}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base">{coupon.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-1 text-sm text-muted-foreground">
                            <p className="font-semibold text-foreground">{couponAmountText(coupon)}</p>
                            <p>최소 주문금액 {coupon.minimumAmount.toLocaleString()}원</p>
                            {coupon.maximumDiscount && <p>최대 할인 {coupon.maximumDiscount.toLocaleString()}원</p>}
                            <p>만료일 {coupon.expiresAt}</p>
                        </CardContent>
                    </Card>
                ))}
            </section>
        </div>
    );
}

export default CouponsPage;
