import { Link } from "react-router";
import { Flame, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StickySearchPanel from "@/components/search/StickySearchPanel.jsx";
import { hotDeals } from "@/domains/client/deals/mock/dealsData.js";

const dealCategories = ["전체", ...new Set(hotDeals.map((deal) => deal.category))];

function DealsPage() {
    return (
        <div className="grid items-start gap-4 md:grid-cols-[1fr_320px]">
            <div className="order-2 space-y-6 md:order-1">
                <section className="relative overflow-hidden rounded-3xl border border-zinc-200/70 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-800 p-6 text-white sm:p-8">
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.26),transparent_55%)]" />
                    <div className="relative z-10">
                        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-300">
                            <Flame className="h-3.5 w-3.5" />
                            Flash Deal
                        </p>
                        <h2 className="mt-2 text-3xl font-black tracking-tight">지금 진행 중인 타임세일</h2>
                        <p className="mt-2 max-w-2xl text-sm text-zinc-300">한정 재고 특가 상품을 남은 시간 안에 구매하세요.</p>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2">
                    {hotDeals.map((deal) => (
                        <Card key={deal.id} className="overflow-hidden border-zinc-200/80 bg-white/95">
                            <img src={deal.thumbnail} alt={deal.title} className="h-40 w-full object-cover" />
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="rounded-full border border-zinc-300 bg-zinc-50 px-2 py-0.5 font-semibold text-zinc-700">{deal.category}</span>
                                    <span className="rounded-full bg-rose-100 px-2 py-0.5 font-semibold text-rose-700">{deal.discount}</span>
                                </div>
                                <CardTitle className="text-base text-zinc-900">{deal.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-zinc-400 line-through">{deal.originalPrice}</p>
                                        <p className="text-lg font-bold text-zinc-900">{deal.price}</p>
                                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-zinc-500">
                                            <Timer className="h-3.5 w-3.5" />
                                            {deal.left}
                                        </p>
                                    </div>
                                    <Button asChild size="sm" className="rounded-full bg-zinc-900 px-4 text-white hover:bg-zinc-700">
                                        <Link to={`/deals/${deal.id}`}>상세 보기</Link>
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </section>
            </div>

            <aside className="order-1 md:order-2 md:sticky md:top-24 md:self-start">
                <StickySearchPanel
                    scope="deals"
                    title="딜 검색"
                    description="카테고리/상품명으로 타임세일을 검색하고 결과 페이지에서 확인하세요."
                    placeholder="딜 상품명, 카테고리"
                    categories={dealCategories}
                />
            </aside>
        </div>
    );
}

export default DealsPage;
