import { Link, useSearchParams } from "react-router";
import { ArrowLeft, ArrowUpRight, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fundingCampaigns } from "@/domains/client/funding/mock/fundingData.js";
import { buildFundingCampaignPath } from "@/domains/client/funding/lib/fundingPaths";
import { hotDeals } from "@/domains/client/deals/mock/dealsData.js";
import { salesItems } from "@/domains/client/sales/mock/salesData.js";
import { stores } from "@/domains/client/store/mock/storeData.js";

const scopeLabels = {
    all: "전체",
    funding: "펀딩",
    sales: "판매",
    store: "스토어/상품",
    deals: "딜",
};

const searchResults = [
    ...fundingCampaigns.map((campaign) => ({
        id: `funding-${campaign.id}`,
        scope: "funding",
        kind: "펀딩",
        title: campaign.name,
        category: campaign.category,
        status: campaign.status,
        thumbnail: campaign.thumbnail,
        subtitle: `${campaign.raised} · ${campaign.progress}% · ${campaign.supporters.toLocaleString()}명 참여`,
        meta: `마감 ${campaign.deadline} · ${campaign.leftLabel}`,
        to: buildFundingCampaignPath(campaign.id),
        badge: "펀딩",
        searchText: `${campaign.name} ${campaign.category} ${campaign.status}`,
    })),
    ...stores.map((store) => ({
        id: `store-${store.id}`,
        scope: "store",
        kind: "가게",
        title: store.name,
        category: store.category,
        thumbnail: store.thumbnail,
        subtitle: store.tagline,
        meta: `평점 ${store.rating} · 리뷰 ${store.reviewCount.toLocaleString()}개`,
        to: `/store/${store.id}`,
        badge: "가게",
        searchText: `${store.name} ${store.tagline} ${store.category}`,
    })),
    ...stores.flatMap((store) => [
        ...store.ticketProducts.map((product) => ({
            id: `ticket-${store.id}-${product.id}`,
            scope: "store",
            kind: "티켓형",
            title: product.name,
            category: product.category,
            thumbnail: product.thumbnail,
            subtitle: `${store.name} · 티켓형`,
            meta: `${product.eventDate} · ${product.venue}`,
            to: `/store/${store.id}/product/ticket/${product.id}`,
            badge: "티켓형",
            searchText: `${product.name} ${product.category} ${store.name} ${product.venue}`,
        })),
        ...store.stockProducts.map((product) => ({
            id: `stock-${store.id}-${product.id}`,
            scope: "store",
            kind: "재고형",
            title: product.name,
            category: product.category,
            thumbnail: product.thumbnail,
            subtitle: `${store.name} · 재고형`,
            meta: `${product.price} · 재고 ${product.stock}개 · ${product.status}`,
            to: `/store/${store.id}/product/stock/${product.id}`,
            badge: "재고형",
            searchText: `${product.name} ${product.category} ${store.name} ${product.status}`,
        })),
    ]),
    ...salesItems.map((item) => ({
        id: `sales-${item.id}`,
        scope: "sales",
        kind: "판매",
        title: item.title,
        category: item.category,
        status: item.status,
        thumbnail: item.thumbnail,
        subtitle: `${item.price} · 정가 판매`,
        meta: `원 프로젝트 ${item.fundingTitle} · 남은 수량 ${item.stockLeft}개`,
        to: `/sales/${item.id}`,
        badge: "일반판매",
        searchText: `${item.title} ${item.category} ${item.fundingTitle} ${item.status}`,
    })),
    ...hotDeals.map((deal) => ({
        id: `deal-${deal.id}`,
        scope: "deals",
        kind: "딜",
        title: deal.title,
        category: deal.category,
        thumbnail: deal.thumbnail,
        subtitle: `${deal.price} · ${deal.discount}`,
        meta: `남은 시간 ${deal.left}`,
        to: `/deals/${deal.id}`,
        badge: "타임세일",
        searchText: `${deal.title} ${deal.category} ${deal.discount}`,
    })),
];

function SearchResultPage() {
    const [searchParams] = useSearchParams();

    const scope = searchParams.get("scope") ?? "all";
    const keyword = (searchParams.get("keyword") ?? "").trim();
    const category = searchParams.get("category") ?? "전체";
    const status = searchParams.get("status") ?? "전체";
    const kind = searchParams.get("kind") ?? "전체";

    const normalizedKeyword = keyword.toLowerCase();

    const results = searchResults.filter((result) => {
        const scopeMatch = scope === "all" || result.scope === scope;
        const keywordMatch =
            normalizedKeyword.length === 0 || result.searchText.toLowerCase().includes(normalizedKeyword);
        const categoryMatch = category === "전체" || result.category === category;
        const statusMatch = status === "전체" || result.status === status;
        const kindMatch = kind === "전체" || result.kind === kind;

        return scopeMatch && keywordMatch && categoryMatch && statusMatch && kindMatch;
    });

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Search Result</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">검색 결과</h2>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full border border-border bg-muted px-2 py-1 text-muted-foreground">범위: {scopeLabels[scope] ?? scope}</span>
                    <span className="rounded-full border border-border bg-muted px-2 py-1 text-muted-foreground">카테고리: {category}</span>
                    {status !== "전체" && (
                        <span className="rounded-full border border-border bg-muted px-2 py-1 text-muted-foreground">상태: {status}</span>
                    )}
                    {kind !== "전체" && (
                        <span className="rounded-full border border-border bg-muted px-2 py-1 text-muted-foreground">상품 타입: {kind}</span>
                    )}
                    {keyword && (
                        <span className="rounded-full border border-border bg-muted px-2 py-1 text-muted-foreground">
                            키워드: {keyword}
                        </span>
                    )}
                    <span className="rounded-full border border-primary bg-primary px-2 py-1 font-semibold text-primary-foreground">
                        {results.length}건
                    </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild variant="outline" className="rounded-full px-4">
                        <Link to="/">
                            <ArrowLeft className="h-4 w-4" />
                            홈으로
                        </Link>
                    </Button>
                    <Button asChild className="rounded-full px-4">
                        <Link to="/store">스토어로 이동</Link>
                    </Button>
                </div>
            </section>

            <section className="grid gap-3">
                {results.length > 0 ? (
                    results.map((result) => (
                        <Card key={result.id} className="overflow-hidden">
                            <div className="grid gap-0 sm:grid-cols-[180px_1fr]">
                                <img src={result.thumbnail} alt={result.title} className="h-40 w-full object-cover sm:h-full" />
                                <CardContent className="flex flex-col justify-between gap-3 p-4">
                                    <div>
                                        <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                                            <span className="rounded-full border border-border bg-muted px-2 py-0.5 font-semibold text-muted-foreground">
                                                {result.badge}
                                            </span>
                                            <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-muted-foreground">
                                                {result.category}
                                            </span>
                                            {result.status && (
                                                <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-muted-foreground">
                                                    {result.status}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-lg font-semibold text-foreground">{result.title}</p>
                                        <p className="mt-1 text-sm text-muted-foreground">{result.subtitle}</p>
                                        <p className="mt-1 text-xs text-muted-foreground">{result.meta}</p>
                                    </div>

                                    <div>
                                        <Button asChild className="rounded-full px-4">
                                            <Link to={result.to}>
                                                상세 보기
                                                <ArrowUpRight className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Search className="h-5 w-5 text-muted-foreground" />
                                검색 결과가 없습니다
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground">
                            키워드 또는 카테고리를 변경해서 다시 검색해 보세요.
                        </CardContent>
                    </Card>
                )}
            </section>
        </div>
    );
}

export default SearchResultPage;
