import { ArrowRight, PackageCheck } from "lucide-react";
import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StickySearchPanel from "@/components/search/StickySearchPanel.jsx";
import { salesItems } from "@/domains/client/sales/mock/salesData.js";

const salesCategories = ["전체", ...new Set(salesItems.map((item) => item.category))];
const salesStatuses = ["전체", ...new Set(salesItems.map((item) => item.status))];

function SalesPage() {
    return (
        <div className="grid items-start gap-4 md:grid-cols-[1fr_320px]">
            <div className="order-2 space-y-6 md:order-1">
                <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">After Funding Sale</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900">펀딩 완료 상품 일반판매</h2>
                    <p className="mt-2 max-w-2xl text-sm text-zinc-600">
                        펀딩에서 검증된 상품 중 남은 재고를 일반 판매로 전환한 라인업입니다. 수량이 적은 제품은 빠르게 마감될 수 있어요.
                    </p>
                </section>

                <section className="grid gap-4 md:grid-cols-2">
                    {salesItems.map((item) => (
                        <Card key={item.id} className="overflow-hidden border-zinc-200/80 bg-white/95">
                            <img src={item.thumbnail} alt={item.title} className="h-44 w-full object-cover" />
                            <CardHeader className="pb-2">
                                <div className="mb-2 flex items-center justify-between gap-2 text-xs">
                                    <span className="rounded-full border border-zinc-300 bg-zinc-50 px-2 py-0.5 font-semibold text-zinc-700">
                                        {item.category}
                                    </span>
                                    <span className="rounded-full border border-zinc-300 bg-white px-2 py-0.5 text-zinc-600">{item.status}</span>
                                </div>
                                <CardTitle className="text-base text-zinc-900">{item.title}</CardTitle>
                                <p className="line-clamp-1 text-xs text-zinc-500">원 프로젝트: {item.fundingTitle}</p>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-xs text-zinc-500">정가 판매</p>
                                        <p className="text-lg font-bold text-zinc-900">{item.price}</p>
                                    </div>
                                    <div className="text-right text-xs text-zinc-500">
                                        <p>남은 수량 {item.stockLeft}개</p>
                                        <p>판매 {item.soldCount}개</p>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="inline-flex items-center gap-1 text-xs text-zinc-500">
                                        <PackageCheck className="h-3.5 w-3.5" />
                                        재고 소진 시 판매 종료
                                    </p>
                                    <Button asChild size="sm" className="rounded-full bg-zinc-900 px-4 text-white hover:bg-zinc-700">
                                        <Link to={`/sales/${item.id}`}>
                                            상품 상세
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
                    scope="sales"
                    title="판매 검색"
                    description="펀딩 완료 후 전환된 일반판매 상품을 카테고리/상태로 찾아보세요."
                    placeholder="판매 상품명, 카테고리"
                    categories={salesCategories}
                    statuses={salesStatuses}
                />
            </aside>
        </div>
    );
}

export default SalesPage;
