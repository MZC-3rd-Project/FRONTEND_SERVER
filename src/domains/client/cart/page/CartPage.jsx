import { Link } from "react-router";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cartItems } from "@/domains/client/order/mock/orderData.js";
import { formatPrice } from "@/domains/client/common/utils/format.js";

function CartPage() {
    const totalPrice = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Cart</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">장바구니</h2>
                <p className="mt-2 text-sm text-muted-foreground">선택한 상품을 확인하고 결제를 진행하세요.</p>
            </section>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">선택 상품</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
                            <div>
                                <p className="font-semibold text-foreground">{item.name}</p>
                                <p className="text-xs text-muted-foreground">
                                    {item.storeName} · {item.option} · 수량 {item.quantity}
                                </p>
                            </div>
                            <p className="font-semibold text-foreground">{formatPrice(item.unitPrice * item.quantity)}</p>
                        </div>
                    ))}
                    <div className="flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3 text-sm">
                        <p className="font-semibold text-muted-foreground">합계</p>
                        <p className="text-base font-bold text-foreground">{formatPrice(totalPrice)}</p>
                    </div>
                    <div className="flex flex-wrap justify-end gap-2 pt-2">
                        <Button asChild variant="ghost" className="rounded-full px-5">
                            <Link to="/wishlist">찜 목록</Link>
                        </Button>
                        <Button asChild variant="outline" className="rounded-full px-5">
                            <Link to="/store">쇼핑 계속하기</Link>
                        </Button>
                        <Button asChild className="rounded-full px-5">
                            <Link to="/checkout">
                                <ShoppingBag className="h-4 w-4" />
                                결제하기
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default CartPage;
