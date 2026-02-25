import { Link } from "react-router";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const cartItems = [
    { name: "프리미엄 에어러너", quantity: 1, price: "129,000원" },
    { name: "울트라 슬림 보틀", quantity: 2, price: "46,000원" },
];

function CartPage() {
    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Cart</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900">장바구니</h2>
                <p className="mt-2 text-sm text-zinc-600">선택한 상품을 확인하고 결제를 진행하세요.</p>
            </section>

            <Card className="border-zinc-200/80 bg-white/95">
                <CardHeader>
                    <CardTitle className="text-base text-zinc-900">선택 상품</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {cartItems.map((item) => (
                        <div key={item.name} className="flex items-center justify-between rounded-xl border border-zinc-200 px-4 py-3 text-sm">
                            <div>
                                <p className="font-semibold text-zinc-900">{item.name}</p>
                                <p className="text-xs text-zinc-500">수량 {item.quantity}</p>
                            </div>
                            <p className="font-semibold text-zinc-900">{item.price}</p>
                        </div>
                    ))}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button asChild variant="outline" className="rounded-full border-zinc-300 bg-white px-5 text-zinc-700 hover:bg-zinc-100">
                            <Link to="/store">쇼핑 계속하기</Link>
                        </Button>
                        <Button className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
                            <ShoppingBag className="h-4 w-4" />
                            결제하기
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default CartPage;
