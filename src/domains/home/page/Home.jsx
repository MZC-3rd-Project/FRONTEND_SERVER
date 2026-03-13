import { Link } from "react-router";
import { ArrowRight, Box, Flame, Gift, Heart, Layers3, Sparkles, Star, Timer } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fundingCampaigns } from "@/domains/client/funding/mock/fundingData.js";

const highlights = [
    { label: "오늘 오픈 딜", value: "24", detail: "한정 특가 진행 중" },
    { label: "무료배송 상품", value: "1,280+", detail: "전 카테고리 대상" },
    { label: "평균 만족도", value: "4.8/5", detail: "최근 30일 리뷰" },
];

const categoryBlocks = [
    {
        title: "테크/디지털",
        description: "일상을 편리하게 만드는 최신 가젯",
        tone: "from-cyan-300/30 via-sky-300/20 to-transparent",
    },
    {
        title: "패션/뷰티",
        description: "트렌드 상품과 시즌 베스트 셀렉션",
        tone: "from-pink-300/30 via-rose-300/20 to-transparent",
    },
    {
        title: "리빙/홈",
        description: "집의 분위기를 바꾸는 리빙 아이템",
        tone: "from-emerald-300/30 via-lime-300/20 to-transparent",
    },
    {
        title: "푸드/건강",
        description: "매일 찾게 되는 건강한 먹거리",
        tone: "from-amber-300/30 via-orange-300/20 to-transparent",
    },
];

const benefits = [
    {
        icon: Gift,
        title: "신규 가입 쿠폰",
        detail: "첫 구매 시 최대 12,000원 할인",
    },
    {
        icon: Heart,
        title: "찜 상품 알림",
        detail: "가격 인하 시 즉시 알림",
    },
    {
        icon: Star,
        title: "멤버십 리워드",
        detail: "구매 금액 3% 포인트 적립",
    },
];

const fundingProjects = fundingCampaigns.slice(0, 3).map((campaign) => ({
    id: campaign.id,
    name: campaign.name,
    category: campaign.category,
    raised: campaign.raised,
    goal: campaign.goal,
    progress: campaign.progress,
    daysLeftLabel: campaign.leftLabel,
    thumbnail: campaign.thumbnail,
}));

const flashDeals = [
    {
        title: "무선 핸디 청소기",
        discount: "-32%",
        price: "89,000원",
        eta: "02:15:44",
    },
    {
        title: "프로틴 그래놀라 12팩",
        discount: "-41%",
        price: "19,800원",
        eta: "01:04:10",
    },
    {
        title: "스마트 무드등",
        discount: "-27%",
        price: "34,900원",
        eta: "03:32:59",
    },
];

function Home() {
    return (
        <div className="space-y-10 pb-8 md:space-y-14 md:pb-12">
            {/* ── Hero ── */}
            <section className="surface-hero relative overflow-hidden rounded-[2rem] border border-border p-6 shadow-[0_24px_80px_rgba(31,38,66,0.16)] sm:p-10">
                <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-300/45 to-indigo-400/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-gradient-to-tr from-orange-300/45 to-pink-300/10 blur-3xl" />

                <div className="relative z-10 max-w-4xl space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-popover/75 px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Don-Moa | 돈모아
                    </div>

                    <h1 className="text-3xl font-black leading-tight text-foreground sm:text-4xl md:text-5xl">
                        좋아할 만한 상품과 펀딩을
                        <br />
                        한 번에 발견하는 쇼핑 홈
                    </h1>

                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                        오늘의 인기 상품, 타임세일, 새로 시작한 펀딩 프로젝트까지 클라이언트 관점에서 가장 필요한 정보만 먼저 보여줍니다.
                    </p>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                        <Button asChild className="h-10 rounded-full px-6 text-sm font-semibold">
                            <Link to="/store">
                                지금 쇼핑하기
                                <ArrowRight className="h-4 w-4" />
                            </Link>
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="h-10 rounded-full px-6 text-sm font-semibold"
                        >
                            <Link to="/funding">펀딩 둘러보기</Link>
                        </Button>
                    </div>
                </div>

                <div className="relative z-10 mt-8 grid gap-3 sm:grid-cols-3">
                    {highlights.map((metric) => (
                        <div
                            key={metric.label}
                            className="reveal-up rounded-2xl border border-border bg-popover/75 p-4 backdrop-blur"
                        >
                            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{metric.label}</p>
                            <p className="mt-2 text-2xl font-bold text-foreground">{metric.value}</p>
                            <p className="text-xs text-muted-foreground">{metric.detail}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* ── 실시간 펀딩 프로젝트 ── */}
            <section className="space-y-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <p className="text-sm font-semibold text-muted-foreground">Funding Pick</p>
                        <h2 className="text-2xl font-bold text-foreground">실시간 펀딩 프로젝트</h2>
                    </div>
                    <Button asChild variant="ghost" className="h-9 rounded-full px-4 text-sm font-semibold">
                        <Link to="/funding">
                            전체 프로젝트 보기
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {fundingProjects.map((project, index) => (
                        <Link
                            key={project.id}
                            to={`/funding/${project.id}`}
                            className="reveal-up block"
                            style={{ animationDelay: `${index * 90}ms` }}
                        >
                            <Card className="h-full border-border bg-card shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.12)]">
                                <img src={project.thumbnail} alt={project.name} className="h-40 w-full rounded-t-xl object-cover" />
                                <CardHeader className="pb-2">
                                    <div className="mb-2 flex items-center justify-between text-xs">
                                        <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                                            {project.category}
                                        </span>
                                        <span className="font-medium text-muted-foreground">{project.daysLeftLabel}</span>
                                    </div>
                                    <CardTitle className="text-base leading-snug text-card-foreground">{project.name}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600"
                                            style={{ width: `${Math.min(project.progress, 100)}%` }}
                                        />
                                    </div>
                                    <div className="flex items-end justify-between text-sm">
                                        <div>
                                            <p className="font-semibold text-card-foreground">{project.raised}</p>
                                            <p className="text-xs text-muted-foreground">목표 {project.goal}</p>
                                        </div>
                                        <p className="text-lg font-bold text-primary">{project.progress}%</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ── 카테고리 + 혜택 ── */}
            <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                <Card className="border-border bg-card/80 shadow-[0_12px_36px_rgba(15,23,42,0.08)] backdrop-blur">
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-lg text-card-foreground">
                            <Layers3 className="h-5 w-5 text-violet-600" />
                            카테고리 탐색
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-3 sm:grid-cols-2">
                        {categoryBlocks.map((block) => (
                            <Link
                                key={block.title}
                                to="/store"
                                className="relative overflow-hidden rounded-xl border border-border bg-card p-4 transition-transform hover:-translate-y-0.5"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${block.tone}`} />
                                <div className="relative z-10 space-y-2">
                                    <p className="text-sm font-semibold text-card-foreground">{block.title}</p>
                                    <p className="text-xs leading-relaxed text-muted-foreground">{block.description}</p>
                                </div>
                            </Link>
                        ))}
                    </CardContent>
                </Card>

                {/* 오늘의 혜택 — secondary 팔레트 활용 */}
                <Card className="border-border bg-secondary text-secondary-foreground shadow-[0_12px_36px_rgba(15,23,42,0.2)]">
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-lg text-secondary-foreground">
                            <Gift className="h-5 w-5 text-primary" />
                            오늘의 혜택
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {benefits.map((benefit) => {
                            const Icon = benefit.icon;
                            return (
                                <div key={benefit.title} className="rounded-xl border border-secondary-foreground/10 bg-secondary-foreground/5 p-3">
                                    <p className="flex items-center gap-2 font-medium text-secondary-foreground">
                                        <Icon className="h-4 w-4 text-primary" />
                                        {benefit.title}
                                    </p>
                                    <p className="mt-1 text-secondary-foreground/70">{benefit.detail}</p>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            </section>

            {/* ── Flash Deal ── */}
            <section className="relative overflow-hidden rounded-[1.75rem] border border-border bg-secondary p-5 text-secondary-foreground sm:p-7">
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.22),transparent_55%)]" />
                <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
                    <div className="max-w-xl">
                        <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
                            <Flame className="h-3.5 w-3.5" />
                            Flash Deal Zone
                        </p>
                        <h3 className="mt-2 text-2xl font-bold text-secondary-foreground">오늘의 특가 타임세일</h3>
                        <p className="mt-1 text-sm text-secondary-foreground/70">
                            인기 상품을 제한 시간 동안 더 좋은 가격으로 만나보세요.
                        </p>
                    </div>
                    <Button asChild className="h-10 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/80">
                        <Link to="/deals">딜 보러가기</Link>
                    </Button>
                </div>

                <div className="relative z-10 mt-5 grid gap-3 md:grid-cols-3">
                    {flashDeals.map((deal) => (
                        <div key={deal.title} className="rounded-2xl border border-secondary-foreground/10 bg-secondary-foreground/10 p-4 backdrop-blur-sm">
                            <div className="flex items-center justify-between text-xs text-secondary-foreground/70">
                                <span className="inline-flex items-center gap-1">
                                    <Box className="h-3.5 w-3.5" />
                                    추천 상품
                                </span>
                                <span className="rounded-full border border-secondary-foreground/20 px-2 py-0.5 text-[11px]">
                                    {deal.discount}
                                </span>
                            </div>
                            <p className="mt-2 text-sm font-semibold text-secondary-foreground">{deal.title}</p>
                            <div className="mt-3 flex items-end justify-between">
                                <p className="text-lg font-bold text-secondary-foreground">{deal.price}</p>
                                <p className="inline-flex items-center gap-1 text-xs text-primary">
                                    <Timer className="h-3.5 w-3.5" />
                                    {deal.eta}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Home;