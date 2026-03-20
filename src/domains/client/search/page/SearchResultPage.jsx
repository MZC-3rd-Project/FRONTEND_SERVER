import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { ArrowLeft } from "lucide-react";

import UnifiedSearchBar from "@/components/search/UnifiedSearchBar";
import CatalogSearchResults from "@/components/search/CatalogSearchResults";
import StoreSearchResults from "@/components/search/StoreSearchResults";
import { Button } from "@/components/ui/button";
import { useInfiniteScrollTrigger } from "@/common/hooks/useInfiniteScrollTrigger";
import { useTopLevelCategoryNamesQuery } from "@/domains/client/category/query/useCategoryQueries";
import { useInfiniteStoresQuery } from "@/domains/client/store/query/useStoreQueries";
import { useCatalogItemNavigation } from "@/domains/client/search/hooks/useCatalogItemNavigation";
import {
    getSearchStatusOptions,
    mapScopeStatusLabelToQueryStatus,
} from "@/domains/client/search/lib/searchMappers";
import {
    SEARCH_SCOPE_LABELS,
    buildSearchPageQuery,
    mapScopeToCatalogChannel,
    normalizeSearchScope,
} from "@/domains/client/search/lib/searchScopes";
import { useInfiniteCatalogItemsQuery } from "@/domains/client/search/query/useSearchQueries";

const SORT_OPTIONS = [
    { value: "LATEST", label: "최신순" },
    { value: "POPULAR", label: "인기순" },
    { value: "PRICE_ASC", label: "낮은 가격순" },
    { value: "PRICE_DESC", label: "높은 가격순" },
];

function flattenPages(data) {
    return data?.pages?.flatMap((page) => page.items ?? []) ?? [];
}

function SearchResultPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const scope = normalizeSearchScope(searchParams.get("scope"));
    const keyword = (searchParams.get("q") ?? "").trim();
    const sort = String(searchParams.get("sort") || "LATEST").toUpperCase();
    const category = (searchParams.get("category") ?? "").trim() || "전체";
    const rawStatus = (searchParams.get("status") ?? "").trim();
    const [inputKeyword, setInputKeyword] = useState(keyword);
    const { pendingItemId, openItem } = useCatalogItemNavigation();
    const { data: topLevelCategories } = useTopLevelCategoryNamesQuery();
    const statusOptions = getSearchStatusOptions(scope);
    const status = statusOptions.includes(rawStatus) ? rawStatus : "전체";

    useEffect(() => {
        setInputKeyword(keyword);
    }, [keyword]);

    const categoryOptions = useMemo(() => {
        const baseOptions = ["전체", ...(topLevelCategories ?? [])];
        if (category !== "전체" && !baseOptions.includes(category)) {
            baseOptions.push(category);
        }
        return baseOptions;
    }, [category, topLevelCategories]);

    const catalogQueryParams = useMemo(
        () => ({
            q: keyword,
            sort,
            size: 12,
            category: category !== "전체" ? category : undefined,
            status: mapScopeStatusLabelToQueryStatus(scope, status),
            ...(mapScopeToCatalogChannel(scope) ? { channel: mapScopeToCatalogChannel(scope) } : {}),
        }),
        [category, keyword, scope, sort, status]
    );

    const catalogQuery = useInfiniteCatalogItemsQuery(catalogQueryParams, {
        enabled: scope !== "store",
    });
    const storeQuery = useInfiniteStoresQuery(
        {
            q: keyword,
            size: 12,
        },
        {
            enabled: scope === "store",
        }
    );

    const catalogItems = useMemo(() => flattenPages(catalogQuery.data), [catalogQuery.data]);
    const stores = useMemo(() => flattenPages(storeQuery.data), [storeQuery.data]);

    const resultCount = scope === "store"
        ? (storeQuery.data?.pages?.[0]?.totalCount ?? stores.length)
        : (catalogQuery.data?.pages?.[0]?.totalCount ?? catalogItems.length);

    const catalogSentinelRef = useInfiniteScrollTrigger({
        enabled: scope !== "store" && catalogQuery.hasNextPage && !catalogQuery.isFetchingNextPage,
        onIntersect: () => catalogQuery.fetchNextPage(),
    });
    const storeSentinelRef = useInfiniteScrollTrigger({
        enabled: scope === "store" && storeQuery.hasNextPage && !storeQuery.isFetchingNextPage,
        onIntersect: () => storeQuery.fetchNextPage(),
    });

    const updateSearchPage = ({
        nextScope = scope,
        nextKeyword = inputKeyword,
        nextSort = sort,
        nextCategory = category,
        nextStatus = status,
    } = {}) => {
        const resolvedStatusOptions = getSearchStatusOptions(nextScope);
        const resolvedStatus = resolvedStatusOptions.includes(nextStatus) ? nextStatus : "전체";
        const query = buildSearchPageQuery({
            scope: nextScope,
            q: nextKeyword,
            sort: nextSort,
            category: nextScope === "store" ? "" : nextCategory,
            status: nextScope === "store" ? "" : resolvedStatus,
        }).toString();

        navigate(query ? `/search?${query}` : "/search");
    };

    return (
        <div className="space-y-6 pb-4">
            <section className="space-y-4 rounded-[2rem] border border-border bg-card/95 p-5 shadow-[0_24px_80px_rgba(31,38,66,0.14)] sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Search Result</p>
                        <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">통합 검색 결과</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {SEARCH_SCOPE_LABELS[scope]} 범위에서 원하는 결과를 바로 찾고, 스크롤하면서 이어서 탐색할 수 있습니다.
                        </p>
                    </div>
                    <Button asChild variant="outline" className="rounded-full px-4">
                        <Link to="/">
                            <ArrowLeft className="h-4 w-4" />
                            홈으로
                        </Link>
                    </Button>
                </div>

                <UnifiedSearchBar
                    compact
                    keyword={inputKeyword}
                    selectedScope={scope}
                    onKeywordChange={setInputKeyword}
                    onScopeChange={(nextScope) => updateSearchPage({ nextScope })}
                    onSubmit={() => updateSearchPage({ nextKeyword: inputKeyword })}
                    submitLabel="검색"
                    hints={["무선 청소기", "핫딜", "공연 굿즈", "운영중 스토어"]}
                />

                <div className="flex flex-wrap items-center gap-2">
                    {SORT_OPTIONS.map((option) => {
                        const isActive = option.value === sort;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => updateSearchPage({ nextSort: option.value })}
                                className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                                    isActive
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                }`}
                            >
                                {option.label}
                            </button>
                        );
                    })}

                    <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                        범위: {SEARCH_SCOPE_LABELS[scope]}
                    </span>
                    {keyword ? (
                        <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                            키워드: {keyword}
                        </span>
                    ) : null}
                    {category !== "전체" ? (
                        <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                            카테고리: {category}
                        </span>
                    ) : null}
                    {status !== "전체" ? (
                        <span className="rounded-full border border-border bg-muted px-3 py-1.5 text-sm text-muted-foreground">
                            상태: {status}
                        </span>
                    ) : null}
                    <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
                        {resultCount}건
                    </span>
                </div>

                {scope !== "store" ? (
                    <div className="space-y-3 rounded-2xl border border-border bg-background/70 p-4">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">카테고리</p>
                            <div className="flex flex-wrap gap-2">
                                {categoryOptions.map((option) => {
                                    const isActive = option === category;
                                    return (
                                        <button
                                            key={option}
                                            type="button"
                                            onClick={() => updateSearchPage({ nextCategory: option })}
                                            className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                                                isActive
                                                    ? "border-primary bg-primary text-primary-foreground"
                                                    : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                            }`}
                                        >
                                            {option}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {statusOptions.length > 1 ? (
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">상태</p>
                                <div className="flex flex-wrap gap-2">
                                    {statusOptions.map((option) => {
                                        const isActive = option === status;
                                        return (
                                            <button
                                                key={option}
                                                type="button"
                                                onClick={() => updateSearchPage({ nextStatus: option })}
                                                className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors ${
                                                    isActive
                                                        ? "border-primary bg-primary text-primary-foreground"
                                                        : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                                }`}
                                            >
                                                {option}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : null}
            </section>

            {scope === "store" ? (
                <StoreSearchResults
                    items={stores}
                    isLoading={storeQuery.isPending}
                    isError={storeQuery.isError}
                    error={storeQuery.error}
                    onRetry={() => storeQuery.refetch()}
                    hasNextPage={storeQuery.hasNextPage}
                    isFetchingNextPage={storeQuery.isFetchingNextPage}
                    sentinelRef={storeSentinelRef}
                />
            ) : (
                <CatalogSearchResults
                    items={catalogItems}
                    isLoading={catalogQuery.isPending}
                    isError={catalogQuery.isError}
                    error={catalogQuery.error}
                    onRetry={() => catalogQuery.refetch()}
                    onOpenItem={openItem}
                    pendingItemId={pendingItemId}
                    hasNextPage={catalogQuery.hasNextPage}
                    isFetchingNextPage={catalogQuery.isFetchingNextPage}
                    sentinelRef={catalogSentinelRef}
                    emptyTitle="일치하는 결과가 없습니다"
                    emptyDescription="검색어를 바꾸거나 다른 범위 탭으로 다시 시도해 보세요."
                />
            )}
        </div>
    );
}

export default SearchResultPage;
