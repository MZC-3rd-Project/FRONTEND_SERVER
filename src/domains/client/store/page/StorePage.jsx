import { Link } from "react-router";
import { ArrowRight, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StickySearchPanel from "@/components/search/StickySearchPanel.jsx";
import { stores } from "@/domains/client/store/mock/storeData.js";

const storeSearchCategories = [
    "전체",
    ...new Set([
        ...stores.map((store) => store.category),
        ...stores.flatMap((store) => [
            ...store.ticketProducts.map((product) => product.category),
            ...store.stockProducts.map((product) => product.category),
        ]),
    ]),
];

function StorePage() {
    return (
        <div className="grid items-start gap-4 md:grid-cols-[1fr_320px]">
            <div className="order-2 space-y-6 md:order-1">
                <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Store Discovery</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900">가게 둘러보기</h2>
                    <p className="mt-2 max-w-2xl text-sm text-zinc-600">
                        가게별 판매 이력, 운영 활동, 리뷰를 확인하고 신뢰할 수 있는 스토어를 선택해 보세요.
                    </p>
                </section>

                <section className="grid gap-4 lg:grid-cols-2">
                    {stores.map((store) => (
                        <Card key={store.id} className="overflow-hidden border-zinc-200/80 bg-white/95">
                            <img src={store.thumbnail} alt={store.name} className="h-48 w-full object-cover" />
                            <CardHeader className="space-y-2 pb-1">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="rounded-full border border-zinc-300 bg-zinc-50 px-2 py-0.5 font-semibold text-zinc-700">
                                        {store.category}
                                    </span>
                                    <span className="inline-flex items-center gap-1 text-zinc-500">
                                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                        {store.rating} ({store.reviewCount.toLocaleString()})
                                    </span>
                                </div>
                                <CardTitle className="text-lg text-zinc-900">{store.name}</CardTitle>
                                <p className="text-sm text-zinc-600">{store.tagline}</p>
                            </CardHeader>

                            <CardContent className="space-y-3 text-sm">
                                <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-zinc-500">판매 이력</p>
                                    <div className="flex flex-wrap gap-2">
                                        {store.soldSummary.map((summary) => (
                                            <span key={summary} className="rounded-full border border-zinc-300 bg-white px-2 py-1 text-xs text-zinc-700">
                                                {summary}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-zinc-500">티켓형/재고형 상품 모두 운영</p>
                                    <Button asChild className="rounded-full bg-zinc-900 px-4 text-white hover:bg-zinc-700">
                                        <Link to={`/store/${store.id}`}>
                                            가게 보기
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>
            </div>

            <aside className="order-1 md:order-2 md:sticky md:top-24 md:self-start">
                <StickySearchPanel
                    scope="store"
                    title="스토어/상품 검색"
                    description="가게명, 상품명, 카테고리로 검색 후 결과 페이지로 이동합니다."
                    placeholder="가게명, 상품명, 카테고리"
                    categories={storeSearchCategories}
                />
            </aside>
        </div>
    );
}

export default StorePage;
