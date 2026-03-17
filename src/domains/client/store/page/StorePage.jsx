import { Link } from "react-router";
import { ArrowRight, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
                <section className="rounded-3xl border border-border bg-background p-6 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">Store Discovery</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">가게 둘러보기</h2>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        가게별 판매 이력, 운영 활동, 리뷰를 확인하고 신뢰할 수 있는 스토어를 선택해 보세요.
                    </p>
                </section>

                <section className="grid gap-4 lg:grid-cols-2">
                    {stores.map((store) => (
                        <Card key={store.id} className="overflow-hidden">
                            <img src={store.thumbnail} alt={store.name} className="h-48 w-full object-cover" />
                            <CardHeader className="space-y-2 pb-1">
                                <div className="flex items-center justify-between text-xs">
                                    <Badge variant="outline">{store.category}</Badge>
                                    <span className="inline-flex items-center gap-1 text-muted-foreground">
                                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                        {store.rating} ({store.reviewCount.toLocaleString()})
                                    </span>
                                </div>
                                <CardTitle className="text-lg">{store.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{store.tagline}</p>
                            </CardHeader>

                            <CardContent className="space-y-3 text-sm">
                                <div className="rounded-xl border border-border bg-muted p-3">
                                    <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">판매 이력</p>
                                    <div className="flex flex-wrap gap-2">
                                        {store.soldSummary.map((summary) => (
                                            <Badge key={summary} variant="outline">{summary}</Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-muted-foreground">티켓형/재고형 상품 모두 운영</p>
                                    <Button asChild className="rounded-full px-4">
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