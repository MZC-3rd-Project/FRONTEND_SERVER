import { Link } from "react-router";
import { ArrowRight, Heart, ShoppingCart, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { wishlistItems } from "@/domains/client/order/mock/orderData.js";
import { formatPrice } from "@/domains/client/common/utils/format.js";

function WishlistPage() {
    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Wishlist</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900">찜한 상품</h2>
                <p className="mt-2 text-sm text-zinc-600">관심 상품을 모아두고 가격/재고 상태를 비교해서 빠르게 구매하세요.</p>
            </section>

            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {wishlistItems.map((item) => (
                    <Card key={item.id} className="overflow-hidden border-zinc-200/80 bg-white/95">
                        <img src={item.thumbnail} alt={item.name} className="h-44 w-full object-cover" />
                        <CardHeader className="pb-2">
                            <div className="mb-1 flex items-center justify-between text-xs">
                                <span className="rounded-full border border-zinc-300 bg-zinc-50 px-2 py-0.5 font-semibold text-zinc-700">
                                    {item.category}
                                </span>
                                <span className="rounded-full border border-zinc-300 bg-white px-2 py-0.5 text-zinc-600">
                                    {item.stockStatus}
                                </span>
                            </div>
                            <CardTitle className="line-clamp-1 text-base text-zinc-900">{item.name}</CardTitle>
                            <p className="text-sm text-zinc-500">{item.storeName}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-end justify-between">
                                <p className="text-lg font-bold text-zinc-900">{formatPrice(item.price)}</p>
                                <p className="inline-flex items-center gap-1 text-xs text-zinc-500">
                                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                    {item.rating} ({item.reviewCount.toLocaleString()})
                                </p>
                            </div>

                            <div className="flex gap-2">
                                <Button asChild className="h-9 flex-1 rounded-full bg-zinc-900 text-white hover:bg-zinc-700">
                                    <Link to="/cart">
                                        <ShoppingCart className="h-4 w-4" />
                                        장바구니
                                    </Link>
                                </Button>
                                <Button asChild variant="outline" className="h-9 flex-1 rounded-full border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100">
                                    <Link to={`/store/${item.storeId}`}>
                                        상세 보기
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>

            <Card className="border-zinc-200/80 bg-white/95">
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                    <p className="inline-flex items-center gap-2 font-medium text-zinc-700">
                        <Heart className="h-4 w-4 text-rose-500" />
                        찜한 상품 {wishlistItems.length}개
                    </p>
                    <Button asChild variant="ghost" className="rounded-full px-4 text-zinc-700 hover:bg-zinc-100">
                        <Link to="/store">스토어 계속 둘러보기</Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}

export default WishlistPage;
