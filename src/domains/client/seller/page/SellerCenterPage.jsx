import { BadgeCheck, HandCoins, ShoppingCart, Store } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const steps = [
    {
        icon: Store,
        title: "셀러 등록",
        description: "사업자 인증 후 스토어 기본 정보를 등록합니다.",
    },
    {
        icon: ShoppingCart,
        title: "상품 업로드",
        description: "옵션, 재고, 배송 정보를 설정하고 검수 요청을 보냅니다.",
    },
    {
        icon: HandCoins,
        title: "펀딩 개설",
        description: "사전 수요 검증이 필요한 상품은 펀딩으로 먼저 런칭합니다.",
    },
    {
        icon: BadgeCheck,
        title: "운영 최적화",
        description: "판매 데이터와 리뷰를 기반으로 가격/재고를 최적화합니다.",
    },
];

function SellerCenterPage() {
    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Seller Center</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900">판매자 온보딩 가이드</h2>
                <p className="mt-2 max-w-2xl text-sm text-zinc-600">
                    셀러센터는 등록부터 판매/정산까지 전체 운영 플로우를 단계별로 지원합니다.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    <Button className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">입점 신청</Button>
                    <Button variant="outline" className="rounded-full border-zinc-300 bg-white px-5 text-zinc-700 hover:bg-zinc-100">
                        정산 정책 보기
                    </Button>
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
                {steps.map((step) => {
                    const Icon = step.icon;
                    return (
                        <Card key={step.title} className="border-zinc-200/80 bg-white/95">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
                                    <span className="grid h-8 w-8 place-items-center rounded-full bg-cyan-100 text-cyan-700">
                                        <Icon className="h-4 w-4" />
                                    </span>
                                    {step.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-zinc-600">{step.description}</p>
                            </CardContent>
                        </Card>
                    );
                })}
            </section>
        </div>
    );
}

export default SellerCenterPage;
