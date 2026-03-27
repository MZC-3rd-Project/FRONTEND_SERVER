import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
    AlertCircle,
    BadgeCheck,
    BarChart3,
    CalendarRange,
    HandCoins,
    RefreshCw,
    Search,
    ShoppingCart,
    Star,
    Store,
    TrendingUp,
} from "lucide-react";

import { buildAuthLoginPath } from "@/common/api/authNavigation";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input.tsx";
import { useMyStoresQuery } from "@/domains/client/store/query/useStoreQueries";
import { useSellerDashboardOverviewQuery } from "@/domains/client/seller/query/useSellerDashboardQueries";

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

const DASHBOARD_MODES = [
    { code: "DAILY", label: "일간" },
    { code: "MONTHLY", label: "월간" },
    { code: "RANGE", label: "기간" },
];

const RANGE_BUCKET_OPTIONS = [
    { value: "DAY", label: "일별" },
    { value: "MONTH", label: "월별" },
];

const formControlClassName =
    "h-11 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 shadow-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100";

function formatDateInputValue(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}

function buildDefaultDashboardFilters() {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 6);

    return {
        mode: "DAILY",
        date: formatDateInputValue(today),
        yearMonth: formatDateInputValue(today).slice(0, 7),
        from: formatDateInputValue(weekAgo),
        to: formatDateInputValue(today),
        bucket: "DAY",
        timezone: "Asia/Seoul",
    };
}

function buildOverviewParams(storeId, filters) {
    const base = {
        storeId,
        mode: filters.mode,
        timezone: filters.timezone,
    };

    if (filters.mode === "MONTHLY") {
        return {
            ...base,
            yearMonth: filters.yearMonth,
        };
    }

    if (filters.mode === "RANGE") {
        return {
            ...base,
            from: filters.from,
            to: filters.to,
            bucket: filters.bucket,
        };
    }

    return {
        ...base,
        date: filters.date,
    };
}

function isOverviewReady(storeId, filters) {
    if (!storeId) {
        return false;
    }

    if (filters.mode === "MONTHLY") {
        return Boolean(filters.yearMonth);
    }

    if (filters.mode === "RANGE") {
        return Boolean(filters.from && filters.to && filters.from <= filters.to);
    }

    return Boolean(filters.date);
}

function getLagBadgeVariant(statusCode) {
    return statusCode === "DEGRADED" ? "secondary" : "default";
}

function MetricCard({ icon: Icon, title, value, description, accentClassName = "bg-cyan-100 text-cyan-700" }) {
    return (
        <Card className="border-zinc-200/80 bg-white/95 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between gap-3 text-sm font-semibold text-zinc-600">
                    <span>{title}</span>
                    <span className={`grid h-9 w-9 place-items-center rounded-2xl ${accentClassName}`}>
                        <Icon className="h-4 w-4" />
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <p className="text-2xl font-black tracking-tight text-zinc-950">{value}</p>
                <p className="text-sm text-zinc-500">{description}</p>
            </CardContent>
        </Card>
    );
}

function DashboardSkeleton() {
    return (
        <section className="grid gap-4 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
                <Card key={`seller-dashboard-skeleton-${index}`} className="border-zinc-200/80 bg-white/95">
                    <CardHeader className="pb-4">
                        <div className="h-4 w-24 animate-pulse rounded bg-zinc-200" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="h-8 w-28 animate-pulse rounded bg-zinc-200" />
                        <div className="h-4 w-full animate-pulse rounded bg-zinc-100" />
                    </CardContent>
                </Card>
            ))}
        </section>
    );
}

function SalesSeriesChart({ series }) {
    const maxNetSales = Math.max(...series.map((point) => point.netSales), 0);

    if (series.length === 0) {
        return (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
                선택한 조건에서 표시할 시계열 판매 데이터가 없습니다.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <div className="flex min-w-max items-end gap-3 px-1 pb-1">
                {series.map((point) => {
                    const ratio = maxNetSales > 0 ? point.netSales / maxNetSales : 0;
                    const height = point.netSales > 0 ? Math.max(ratio * 180, 16) : 8;

                    return (
                        <div key={point.bucketStart} className="flex w-16 flex-col items-center gap-2">
                            <div className="text-center text-[11px] font-semibold text-zinc-500">
                                <p>{point.netSalesText}</p>
                                <p>{point.orderCount}건</p>
                            </div>
                            <div className="flex h-48 w-full items-end rounded-2xl bg-zinc-100/80 px-2 pb-2">
                                <div
                                    className="w-full rounded-xl bg-gradient-to-t from-cyan-500 via-sky-400 to-emerald-300 shadow-[0_12px_30px_rgba(6,182,212,0.28)] transition-all"
                                    style={{ height: `${height}px` }}
                                />
                            </div>
                            <p className="text-xs font-medium text-zinc-600">{point.label}</p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function FunnelStepList({ steps }) {
    if (!steps.length) {
        return (
            <div className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-8 text-center text-sm text-zinc-500">
                퍼널 단계 데이터가 아직 수집되지 않았습니다.
            </div>
        );
    }

    const maxCount = Math.max(...steps.map((step) => step.count), 0);

    return (
        <div className="space-y-3">
            {steps.map((step) => {
                const width = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
                return (
                    <div key={step.step} className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="font-semibold text-zinc-800">{step.step}</span>
                            <span className="text-zinc-500">{step.count.toLocaleString()}건</span>
                        </div>
                        <div className="h-2 rounded-full bg-zinc-100">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400"
                                style={{ width: `${Math.max(width, step.count > 0 ? 8 : 0)}%` }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

function SellerCenterPage() {
    const [selectedStoreId, setSelectedStoreId] = useState("");
    const [filters, setFilters] = useState(buildDefaultDashboardFilters);

    const storesQuery = useMyStoresQuery();
    const stores = storesQuery.data?.items ?? [];
    const activeStore = stores.find((store) => store.id === selectedStoreId) ?? stores[0] ?? null;

    useEffect(() => {
        if (stores.length === 0) {
            return;
        }

        if (!selectedStoreId || !stores.some((store) => store.id === selectedStoreId)) {
            setSelectedStoreId(stores[0].id);
        }
    }, [selectedStoreId, stores]);

    const overviewParams = buildOverviewParams(selectedStoreId, filters);
    const overviewEnabled = isOverviewReady(selectedStoreId, filters);
    const overviewQuery = useSellerDashboardOverviewQuery(overviewParams, {
        enabled: overviewEnabled,
    });

    const dashboard = overviewQuery.data;
    const salesFunnel = dashboard?.funnel?.sales;
    const isLoginRequired = storesQuery.error?.status === 401;
    const dashboardErrorMessage = !overviewQuery.isError
        ? ""
        : overviewQuery.error?.status === 400
            ? overviewQuery.error.message
            : (overviewQuery.error?.message ?? "판매분석 조회에 실패했습니다.");

    return (
        <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[2rem] border border-zinc-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(240,249,255,0.95),rgba(236,253,245,0.92))] p-6 shadow-[0_24px_80px_rgba(15,23,42,0.1)] sm:p-8">
                <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.16),transparent_48%),radial-gradient(circle_at_bottom_right,rgba(16,185,129,0.18),transparent_42%)]" />
                <div className="relative flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-3xl">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">Seller Center</p>
                        <h2 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">
                            판매 운영과 분석을 한 화면에서 확인합니다
                        </h2>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600">
                            백엔드의 `seller dashboard overview` 계약을 기준으로 매출, 주문, 검색 유입, 리뷰,
                            시계열 흐름을 바로 볼 수 있도록 구성했습니다.
                        </p>
                        <div className="mt-5 flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="rounded-full border-cyan-200 bg-white/80 px-3 py-1 text-cyan-700">
                                BFF 연동
                            </Badge>
                            <Badge variant={dashboard?.lagStatusCode ? getLagBadgeVariant(dashboard.lagStatusCode) : "secondary"} className="rounded-full px-3 py-1">
                                {dashboard?.lagStatus ?? "집계 상태 확인 중"}
                            </Badge>
                            <Badge variant="outline" className="rounded-full border-zinc-200 bg-white/80 px-3 py-1 text-zinc-600">
                                {dashboard?.asOfLabel ?? "집계 기준 시각 대기 중"}
                            </Badge>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full border-zinc-300 bg-white/90 px-5"
                            onClick={() => {
                                storesQuery.refetch();
                                if (overviewEnabled) {
                                    overviewQuery.refetch();
                                }
                            }}
                            disabled={storesQuery.isFetching || overviewQuery.isFetching}
                        >
                            <RefreshCw className={(storesQuery.isFetching || overviewQuery.isFetching) ? "animate-spin" : ""} />
                            새로고침
                        </Button>
                        <Button asChild className="rounded-full bg-zinc-950 px-5 text-white hover:bg-zinc-800">
                            <Link to="/store/register">스토어 등록</Link>
                        </Button>
                    </div>
                </div>
            </section>

            {isLoginRequired ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>로그인이 필요합니다</AlertTitle>
                    <AlertDescription className="mt-2 flex flex-wrap items-center gap-2">
                        <span>내 스토어와 판매분석을 보려면 세션 로그인이 필요합니다.</span>
                        <Button asChild size="sm" variant="outline">
                            <Link to={buildAuthLoginPath()}>로그인하러 가기</Link>
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : null}

            {!isLoginRequired ? (
                <section className="rounded-3xl border border-zinc-200/80 bg-white/95 p-5 shadow-[0_14px_45px_rgba(15,23,42,0.06)]">
                    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                            <label className="space-y-2">
                                <span className="text-sm font-semibold text-zinc-700">스토어</span>
                                <select
                                    className={formControlClassName}
                                    value={selectedStoreId}
                                    onChange={(event) => setSelectedStoreId(event.target.value)}
                                    disabled={storesQuery.isPending || stores.length === 0}
                                >
                                    {stores.length === 0 ? (
                                        <option value="">내 스토어 없음</option>
                                    ) : (
                                        stores.map((store) => (
                                            <option key={store.id} value={store.id}>
                                                {store.name}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </label>

                            <div className="space-y-2 md:col-span-2 xl:col-span-2">
                                <span className="text-sm font-semibold text-zinc-700">조회 모드</span>
                                <div className="flex flex-wrap gap-2">
                                    {DASHBOARD_MODES.map((mode) => (
                                        <Button
                                            key={mode.code}
                                            type="button"
                                            variant={filters.mode === mode.code ? "default" : "outline"}
                                            className={`rounded-full px-4 ${
                                                filters.mode === mode.code
                                                    ? "bg-zinc-950 text-white hover:bg-zinc-800"
                                                    : "border-zinc-300 bg-white text-zinc-700 hover:bg-zinc-100"
                                            }`}
                                            onClick={() => setFilters((current) => ({ ...current, mode: mode.code }))}
                                        >
                                            {mode.label}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {filters.mode === "DAILY" ? (
                                <label className="space-y-2">
                                    <span className="text-sm font-semibold text-zinc-700">일자</span>
                                    <Input
                                        type="date"
                                        value={filters.date}
                                        onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))}
                                        className={formControlClassName}
                                    />
                                </label>
                            ) : null}

                            {filters.mode === "MONTHLY" ? (
                                <label className="space-y-2">
                                    <span className="text-sm font-semibold text-zinc-700">월</span>
                                    <Input
                                        type="month"
                                        value={filters.yearMonth}
                                        onChange={(event) => setFilters((current) => ({ ...current, yearMonth: event.target.value }))}
                                        className={formControlClassName}
                                    />
                                </label>
                            ) : null}

                            {filters.mode === "RANGE" ? (
                                <>
                                    <label className="space-y-2">
                                        <span className="text-sm font-semibold text-zinc-700">시작일</span>
                                        <Input
                                            type="date"
                                            value={filters.from}
                                            onChange={(event) => setFilters((current) => ({ ...current, from: event.target.value }))}
                                            className={formControlClassName}
                                        />
                                    </label>
                                    <label className="space-y-2">
                                        <span className="text-sm font-semibold text-zinc-700">종료일</span>
                                        <Input
                                            type="date"
                                            value={filters.to}
                                            onChange={(event) => setFilters((current) => ({ ...current, to: event.target.value }))}
                                            className={formControlClassName}
                                        />
                                    </label>
                                    <label className="space-y-2">
                                        <span className="text-sm font-semibold text-zinc-700">버킷</span>
                                        <select
                                            className={formControlClassName}
                                            value={filters.bucket}
                                            onChange={(event) => setFilters((current) => ({ ...current, bucket: event.target.value }))}
                                        >
                                            {RANGE_BUCKET_OPTIONS.map((option) => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </label>
                                </>
                            ) : null}
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
                            {activeStore ? (
                                <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2">
                                    선택 스토어: <strong className="text-zinc-900">{activeStore.name}</strong>
                                </span>
                            ) : null}
                            <span className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-2">
                                타임존: {filters.timezone}
                            </span>
                        </div>
                    </div>
                </section>
            ) : null}

            {storesQuery.isError && !isLoginRequired ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>내 스토어를 불러오지 못했습니다</AlertTitle>
                    <AlertDescription className="mt-2 flex flex-wrap items-center gap-2">
                        <span>{storesQuery.error?.message ?? "스토어 정보를 다시 확인해 주세요."}</span>
                        <Button type="button" size="sm" variant="outline" onClick={() => storesQuery.refetch()}>
                            다시 시도
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : null}

            {!isLoginRequired && !storesQuery.isPending && stores.length === 0 ? (
                <Alert>
                    <Store className="h-4 w-4" />
                    <AlertTitle>운영 중인 스토어가 없습니다</AlertTitle>
                    <AlertDescription>
                        스토어를 먼저 등록해야 판매분석을 조회할 수 있습니다. 현재 상태에서는 온보딩 가이드만 표시됩니다.
                    </AlertDescription>
                </Alert>
            ) : null}

            {!isLoginRequired && stores.length > 0 && !overviewEnabled ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>조회 조건이 올바르지 않습니다</AlertTitle>
                    <AlertDescription>기간 입력값을 확인해 주세요. 기간 조회에서는 시작일이 종료일보다 늦을 수 없습니다.</AlertDescription>
                </Alert>
            ) : null}

            {!isLoginRequired && stores.length > 0 && overviewQuery.isError ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>판매분석 데이터를 불러오지 못했습니다</AlertTitle>
                    <AlertDescription className="mt-2 flex flex-wrap items-center gap-2">
                        <span>{dashboardErrorMessage}</span>
                        <Button type="button" size="sm" variant="outline" onClick={() => overviewQuery.refetch()}>
                            다시 시도
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : null}

            {!isLoginRequired && stores.length > 0 && dashboard?.lagStatusCode === "DEGRADED" ? (
                <Alert>
                    <CalendarRange className="h-4 w-4" />
                    <AlertTitle>집계 지연이 감지되었습니다</AlertTitle>
                    <AlertDescription>
                        백엔드 계약상 `lagStatus=DEGRADED`면 near real-time 집계가 늦어진 상태입니다.
                        화면의 수치는 완전히 틀린 값이 아니라 늦게 반영된 값일 수 있습니다.
                    </AlertDescription>
                </Alert>
            ) : null}

            {!isLoginRequired && stores.length > 0 && dashboard?.partial ? (
                <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>부분 집계 상태입니다</AlertTitle>
                    <AlertDescription>
                        백엔드가 `partial=true`를 반환했습니다. 일부 지표만 부분적으로 누락되었을 가능성이 있습니다.
                    </AlertDescription>
                </Alert>
            ) : null}

            {!isLoginRequired && stores.length > 0 && overviewQuery.isPending ? <DashboardSkeleton /> : null}

            {!isLoginRequired && stores.length > 0 && dashboard ? (
                <>
                    <section className="grid gap-4 lg:grid-cols-4">
                        <MetricCard
                            icon={TrendingUp}
                            title="순매출"
                            value={dashboard.sales.netSalesText}
                            description={`총매출 ${dashboard.sales.grossSalesText} · 주문 ${dashboard.sales.orderCount.toLocaleString()}건`}
                        />
                        <MetricCard
                            icon={ShoppingCart}
                            title="취소/환불"
                            value={`${dashboard.sales.cancelCount.toLocaleString()} / ${dashboard.sales.refundCount.toLocaleString()}`}
                            description="취소 건수와 환불 이벤트 건수를 함께 표시합니다."
                            accentClassName="bg-amber-100 text-amber-700"
                        />
                        <MetricCard
                            icon={Search}
                            title="검색 CTR"
                            value={dashboard.search.ctrText}
                            description={`검색 ${dashboard.search.searchCount.toLocaleString()}회 · 클릭 ${dashboard.search.clickCount.toLocaleString()}회`}
                            accentClassName="bg-emerald-100 text-emerald-700"
                        />
                        <MetricCard
                            icon={Star}
                            title="리뷰 평점"
                            value={dashboard.review.averageRatingText}
                            description={`리뷰 ${dashboard.review.reviewCount.toLocaleString()}개 · 리뷰 보유 상품 ${dashboard.review.reviewedItemCount.toLocaleString()}개`}
                            accentClassName="bg-violet-100 text-violet-700"
                        />
                    </section>

                    <section className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                        <Card className="overflow-hidden border-zinc-200/80 bg-white/95 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                            <CardHeader className="space-y-3 border-b border-zinc-100/80 bg-zinc-50/60">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Sales Flow</p>
                                        <CardTitle className="mt-2 text-xl font-black text-zinc-950">기간별 순매출 흐름</CardTitle>
                                    </div>
                                    <div className="text-right text-sm text-zinc-500">
                                        <p>{dashboard.queryRange.from} ~ {dashboard.queryRange.to}</p>
                                        <p>{dashboard.modeLabel} 조회 · {dashboard.queryRange.bucket} 버킷</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <SalesSeriesChart series={dashboard.series} />
                            </CardContent>
                        </Card>

                        <Card className="border-zinc-200/80 bg-white/95 shadow-[0_18px_55px_rgba(15,23,42,0.08)]">
                            <CardHeader className="space-y-3 border-b border-zinc-100/80 bg-zinc-50/60">
                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Conversion Funnel</p>
                                    <CardTitle className="mt-2 text-xl font-black text-zinc-950">검색 유입에서 구매까지</CardTitle>
                                </div>
                                <div className="flex flex-wrap gap-2 text-sm text-zinc-500">
                                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
                                        시작 {salesFunnel?.entryCount?.toLocaleString() ?? 0}건
                                    </span>
                                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
                                        전환 {salesFunnel?.conversionCount?.toLocaleString() ?? 0}건
                                    </span>
                                    <span className="rounded-full border border-zinc-200 bg-white px-3 py-1">
                                        전환율 {salesFunnel?.conversionRateText ?? "0%"}
                                    </span>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-4 pt-6">
                                <FunnelStepList steps={salesFunnel?.steps ?? []} />
                            </CardContent>
                        </Card>
                    </section>

                    <section className="grid gap-4 lg:grid-cols-3">
                        <Card className="border-zinc-200/80 bg-white/95">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
                                    <Store className="h-4 w-4 text-cyan-700" />
                                    상품 상태
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-zinc-600">
                                <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
                                    <span>판매중 상품</span>
                                    <strong className="text-zinc-950">{dashboard.item.onSaleCount.toLocaleString()}개</strong>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
                                    <span>품절 상품</span>
                                    <strong className="text-zinc-950">{dashboard.item.soldOutCount.toLocaleString()}개</strong>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl bg-zinc-50 px-4 py-3">
                                    <span>숨김 상품</span>
                                    <strong className="text-zinc-950">{dashboard.item.hiddenCount.toLocaleString()}개</strong>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-zinc-200/80 bg-white/95">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
                                    <BarChart3 className="h-4 w-4 text-cyan-700" />
                                    운영 해석
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm leading-6 text-zinc-600">
                                <p>
                                    순매출은 <strong className="text-zinc-900">{dashboard.sales.netSalesText}</strong>이며,
                                    취소/환불 영향을 반영한 값입니다.
                                </p>
                                <p>
                                    검색 유입 대비 구매 전환은 <strong className="text-zinc-900">{dashboard.search.ctrText}</strong>로
                                    확인됩니다.
                                </p>
                                <p>
                                    리뷰 평균은 <strong className="text-zinc-900">{dashboard.review.averageRatingText}</strong>,
                                    누적 리뷰는 <strong className="text-zinc-900">{dashboard.review.reviewCount.toLocaleString()}개</strong>입니다.
                                </p>
                            </CardContent>
                        </Card>

                        <Card className="border-zinc-200/80 bg-white/95">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
                                    <BadgeCheck className="h-4 w-4 text-cyan-700" />
                                    선택 스토어
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-zinc-600">
                                <div className="rounded-2xl bg-zinc-50 px-4 py-4">
                                    <p className="text-base font-bold text-zinc-950">{activeStore?.name ?? "스토어 미선택"}</p>
                                    <p className="mt-1">{activeStore?.description ?? "스토어 설명이 아직 없습니다."}</p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="rounded-full border-zinc-300 bg-white px-3 py-1 text-zinc-700">
                                        상태 {activeStore?.status ?? "미확인"}
                                    </Badge>
                                    <Badge variant="outline" className="rounded-full border-zinc-300 bg-white px-3 py-1 text-zinc-700">
                                        API {dashboard.apiVersion}
                                    </Badge>
                                </div>
                                <p className="text-xs text-zinc-500">
                                    현재 화면은 내 스토어 조회 후 storeId를 선택하고 seller dashboard overview를 조회하는 흐름으로 연동됩니다.
                                </p>
                            </CardContent>
                        </Card>
                    </section>
                </>
            ) : null}

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
