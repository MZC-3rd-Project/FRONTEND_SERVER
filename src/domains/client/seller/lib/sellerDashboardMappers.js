import {
    formatDateTimeLabel,
    formatPrice,
    toNullableNumber,
    toNumber,
    toText,
} from "@/domains/client/commerce/lib/commerceViewUtils";

function mapModeLabel(mode) {
    switch (String(mode || "").toUpperCase()) {
        case "MONTHLY":
            return "월간";
        case "RANGE":
            return "기간";
        case "DAILY":
        default:
            return "일간";
    }
}

function mapLagStatusLabel(status) {
    return String(status || "").toUpperCase() === "DEGRADED" ? "지연 감지" : "정상";
}

function formatRatioPercent(value) {
    const number = toNumber(value, 0) * 100;
    const rounded = Math.round(number * 10) / 10;
    return `${Number.isInteger(rounded) ? rounded : rounded.toFixed(1)}%`;
}

function formatRating(value) {
    const rating = toNullableNumber(value);
    return rating === null ? "-" : rating.toFixed(2);
}

function mapSalesKpi(raw = {}) {
    const grossSales = toNumber(raw?.grossSales, 0);
    const netSales = toNumber(raw?.netSales, 0);
    const orderCount = toNumber(raw?.orderCount, 0);
    const cancelCount = toNumber(raw?.cancelCount, 0);
    const refundCount = toNumber(raw?.refundCount, 0);

    return {
        grossSales,
        grossSalesText: formatPrice(grossSales),
        netSales,
        netSalesText: formatPrice(netSales),
        orderCount,
        cancelCount,
        refundCount,
    };
}

function mapSearchKpi(raw = {}) {
    const searchCount = toNumber(raw?.searchCount, 0);
    const clickCount = toNumber(raw?.clickCount, 0);
    const ctr = toNumber(raw?.ctr, 0);

    return {
        searchCount,
        clickCount,
        ctr,
        ctrText: formatRatioPercent(ctr),
    };
}

function mapItemKpi(raw = {}) {
    return {
        onSaleCount: toNumber(raw?.onSaleCount, 0),
        soldOutCount: toNumber(raw?.soldOutCount, 0),
        hiddenCount: toNumber(raw?.hiddenCount, 0),
    };
}

function mapReviewKpi(raw = {}) {
    const reviewCount = toNumber(raw?.reviewCount, 0);
    const reviewedItemCount = toNumber(raw?.reviewedItemCount, 0);
    const averageRating = toNullableNumber(raw?.averageRating) ?? 0;

    return {
        reviewCount,
        reviewedItemCount,
        averageRating,
        averageRatingText: formatRating(averageRating),
    };
}

function mapFunnelStep(raw = {}) {
    return {
        step: toText(raw?.step, "STEP"),
        count: toNumber(raw?.count, 0),
    };
}

function mapFunnelDomain(raw = {}, fallbackDomainType = "sales") {
    const steps = Array.isArray(raw?.steps) ? raw.steps.map(mapFunnelStep) : [];
    const entryCount = toNumber(raw?.entryCount, steps[0]?.count ?? 0);
    const conversionCount = toNumber(raw?.conversionCount, steps[steps.length - 1]?.count ?? 0);
    const conversionRate = toNumber(raw?.conversionRate, 0);

    return {
        domainType: toText(raw?.domainType, fallbackDomainType),
        entryCount,
        conversionCount,
        conversionRate,
        conversionRateText: formatRatioPercent(conversionRate),
        steps,
    };
}

function mapSeriesPoint(raw = {}) {
    const grossSales = toNumber(raw?.grossSales, 0);
    const netSales = toNumber(raw?.netSales, 0);
    const orderCount = toNumber(raw?.orderCount, 0);
    const bucketStart = toText(raw?.bucketStart, "-");

    return {
        bucketStart,
        label: bucketStart.length > 7 ? bucketStart.slice(5) : bucketStart,
        grossSales,
        grossSalesText: formatPrice(grossSales),
        netSales,
        netSalesText: formatPrice(netSales),
        orderCount,
    };
}

export function mapSellerDashboardOverviewPayload(raw = {}) {
    const review = mapReviewKpi(raw?.extensions?.review);
    const funnelRaw = raw?.extensions?.funnel ?? {};

    return {
        mode: toText(raw?.mode, "DAILY").toUpperCase(),
        modeLabel: mapModeLabel(raw?.mode),
        queryRange: {
            from: toText(raw?.queryRange?.from),
            to: toText(raw?.queryRange?.to),
            bucket: toText(raw?.queryRange?.bucket, "DAY").toUpperCase(),
            timezone: toText(raw?.queryRange?.timezone, "Asia/Seoul"),
        },
        asOf: toText(raw?.asOf),
        asOfLabel: raw?.asOf ? formatDateTimeLabel(raw.asOf) : "집계 시각 미수신",
        lagStatusCode: toText(raw?.lagStatus, "HEALTHY").toUpperCase(),
        lagStatus: mapLagStatusLabel(raw?.lagStatus),
        partial: Boolean(raw?.partial),
        apiVersion: toText(raw?.apiVersion, "v1"),
        sales: mapSalesKpi(raw?.sales),
        search: mapSearchKpi(raw?.search),
        item: mapItemKpi(raw?.item),
        review,
        series: Array.isArray(raw?.series) ? raw.series.map(mapSeriesPoint) : [],
        funnel: {
            sales: mapFunnelDomain(funnelRaw?.sales, "sales"),
            funding: mapFunnelDomain(funnelRaw?.funding, "funding"),
            hotDeal: mapFunnelDomain(funnelRaw?.hotDeal, "hotDeal"),
        },
    };
}
