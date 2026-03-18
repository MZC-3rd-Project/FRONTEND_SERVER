import { Link } from "react-router";
import { Bell, MapPin, MessageCircleMore, Package, ReceiptText, TicketPercent, WalletCards } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orderHistory } from "@/domains/client/order/mock/orderData.js";
import { coupons, wishlistItems } from "@/domains/client/order/mock/orderData.js";

const quickMenus = [
    { name: "주문내역", to: "/my/orders", icon: ReceiptText, desc: "주문/배송/취소 상태" },
    { name: "쿠폰/포인트", to: "/my/coupons", icon: TicketPercent, desc: "할인 쿠폰, 포인트" },
    { name: "배송지 관리", to: "/my/addresses", icon: MapPin, desc: "기본 배송지, 추가 배송지" },
    { name: "찜한 상품", to: "/wishlist", icon: WalletCards, desc: "관심 상품 모아보기" },
    { name: "채팅", to: "/my/messages", icon: MessageCircleMore, desc: "스토어 문의 대화 확인" },
    { name: "알림", to: "/my/notifications", icon: Bell, desc: "주문/펀딩 소식 확인" },
];

function MyPage() {
    const shippingCount = orderHistory.filter((order) => order.status === "배송중").length;

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">My Dashboard</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">내 활동</h2>
                <p className="mt-2 text-sm text-muted-foreground">구매, 후원, 배송, 쿠폰 상태를 한 화면에서 빠르게 확인하세요.</p>
            </section>

            <section className="grid gap-3 sm:grid-cols-3">
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">최근 30일 주문</p>
                        <p className="text-2xl font-bold text-foreground">{orderHistory.length}건</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">배송중</p>
                        <p className="text-2xl font-bold text-foreground">{shippingCount}건</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">보유 쿠폰 / 찜</p>
                        <p className="text-2xl font-bold text-foreground">
                            {coupons.length} / {wishlistItems.length}
                        </p>
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {quickMenus.map((menu) => {
                    const Icon = menu.icon;
                    return (
                        <Card key={menu.name}>
                            <CardContent className="p-4">
                                <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Icon className="h-4 w-4 text-primary" />
                                    {menu.name}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">{menu.desc}</p>
                                <Button asChild variant="ghost" className="mt-2 h-8 rounded-full px-3">
                                    <Link to={menu.to}>
                                        이동
                                        <Package className="h-3.5 w-3.5" />
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </section>
        </div>
    );
}

export default MyPage;
