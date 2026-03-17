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
                <section
                    className="relative overflow-hidden rounded-3xl border border-border bg-background p-6 text-foreground sm:p-8">
                    <div className="relative z-10">
                        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                            <Flame className="h-3.5 w-3.5"/>
                            Flash Deal
                        </p>
                        <h2 className="mt-2 text-3xl font-black tracking-tight">지금 진행 중인 타임세일</h2>
                        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">한정 재고 특가 상품을 남은 시간 안에 구매하세요.</p>
                    </div>
                </section>

                <section className="grid gap-4 sm:grid-cols-2">
                    {hotDeals.map((deal) => (
                        <Card key={deal.id} className="overflow-hidden">
                            <img src={deal.thumbnail} alt={deal.title} className="h-40 w-full object-cover"/>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between text-xs">
                                    <span
                                        className="rounded-full border border-border bg-muted px-2 py-0.5 font-semibold text-muted-foreground">{deal.category}</span>
                                    <span
                                        className="rounded-full bg-destructive/10 px-2 py-0.5 font-semibold text-destructive">{deal.discount}</span>
                                </div>
                                <CardTitle className="text-base">{deal.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs text-muted-foreground/60 line-through">{deal.originalPrice}</p>
                                        <p className="text-lg font-bold text-foreground">{deal.price}</p>
                                        <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                            <Timer className="h-3.5 w-3.5" />
                                            {deal.left}
                                        </p>
                                    </div>
                                    <Button asChild size="sm" className="rounded-full px-4">
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
