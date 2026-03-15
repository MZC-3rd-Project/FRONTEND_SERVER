import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Flame, History, RotateCcw, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const RECENT_SEARCHES_KEY = "don-moa.recent-searches.v1";
const MAX_RECENT_SEARCHES = 20;

function loadInitialRecentSearches() {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return [];
    try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function isSameEntry(left, right) {
    return (
        left.scope === right.scope &&
        left.keyword === right.keyword &&
        left.category === right.category &&
        left.status === right.status
    );
}

export default function StickySearchPanel({
                                              scope,
                                              title,
                                              description,
                                              placeholder,
                                              categories,
                                              statuses = ["전체"],
                                          }) {
    const navigate = useNavigate();
    const defaultCategory = categories.includes("전체") ? "전체" : (categories[0] ?? "전체");
    const defaultStatus = statuses.includes("전체") ? "전체" : (statuses[0] ?? "전체");

    const [keyword, setKeyword] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(defaultCategory);
    const [selectedStatus, setSelectedStatus] = useState(defaultStatus);
    const [recentSearches, setRecentSearches] = useState(loadInitialRecentSearches);

    const appliedCategory = categories.includes(selectedCategory) ? selectedCategory : defaultCategory;
    const appliedStatus = statuses.includes(selectedStatus) ? selectedStatus : defaultStatus;

    const recentByScope = useMemo(
        () => recentSearches.filter((entry) => entry.scope === scope).slice(0, 5),
        [recentSearches, scope]
    );
    const popularCategories = useMemo(
        () => categories.filter((c) => c !== "전체").slice(0, 6),
        [categories]
    );

    const saveRecentSearch = ({ nextKeyword, nextCategory, nextStatus }) => {
        const hasCondition = Boolean(nextKeyword) || nextCategory !== "전체" || nextStatus !== "전체";
        if (!hasCondition || typeof window === "undefined") return;

        const entry = { scope, keyword: nextKeyword, category: nextCategory, status: nextStatus, savedAt: Date.now() };
        const next = [entry, ...recentSearches.filter((item) => !isSameEntry(item, entry))].slice(0, MAX_RECENT_SEARCHES);
        setRecentSearches(next);
        window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    };

    const buildQuery = ({ nextKeyword, nextCategory, nextStatus }) => {
        const query = new URLSearchParams();
        query.set("scope", scope);
        if (nextKeyword.trim()) query.set("keyword", nextKeyword.trim());
        if (nextCategory !== "전체") query.set("category", nextCategory);
        if (nextStatus !== "전체") query.set("status", nextStatus);
        return query;
    };

    const moveToSearchResult = ({ nextKeyword = keyword, nextCategory = appliedCategory, nextStatus = appliedStatus, saveRecent = true } = {}) => {
        if (saveRecent) saveRecentSearch({ nextKeyword: nextKeyword.trim(), nextCategory, nextStatus });
        navigate(`/search?${buildQuery({ nextKeyword, nextCategory, nextStatus }).toString()}`);
    };

    const handleReset = () => {
        setKeyword("");
        setSelectedCategory(defaultCategory);
        setSelectedStatus(defaultStatus);
    };

    const clearRecentByScope = () => {
        if (typeof window === "undefined") return;
        const next = recentSearches.filter((entry) => entry.scope !== scope);
        setRecentSearches(next);
        window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    };

    return (
        <Card className="border-border bg-card shadow-sm md:max-h-[calc(100vh-7rem)] md:overflow-y-auto md:overscroll-contain">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg text-card-foreground">{title}</CardTitle>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleReset}
                        className="h-7 rounded-full px-2.5 text-[11px] font-semibold"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        초기화
                    </Button>
                </div>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardHeader>

            <CardContent className="space-y-5">

                {/* 키워드 검색 */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        키워드 검색
                    </p>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="text"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") moveToSearchResult(); }}
                            placeholder={placeholder}
                            className="h-10 pl-9"
                        />
                    </div>
                </div>

                {/* 최근 검색어 */}
                <div className="space-y-2 rounded-2xl border border-border bg-muted/50 p-3">
                    <div className="flex items-center justify-between gap-2">
                        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <History className="h-3.5 w-3.5" />
                            최근 검색어
                        </p>
                        {recentByScope.length > 0 && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={clearRecentByScope}
                                className="h-auto p-0 text-[11px] font-semibold text-muted-foreground hover:text-foreground"
                            >
                                전체 삭제
                            </Button>
                        )}
                    </div>

                    {recentByScope.length > 0 ? (
                        <div className="space-y-2">
                            {recentByScope.map((entry, index) => {
                                const label = entry.keyword || "필터 검색";
                                const conditionText = [
                                    entry.category !== "전체" ? entry.category : null,
                                    entry.status !== "전체" ? entry.status : null,
                                ].filter(Boolean).join(" · ");
                                return (
                                    <button
                                        key={`${entry.scope}-${entry.keyword}-${entry.category}-${entry.status}-${index}`}
                                        type="button"
                                        onClick={() => {
                                            setKeyword(entry.keyword);
                                            setSelectedCategory(entry.category);
                                            setSelectedStatus(entry.status);
                                            moveToSearchResult({
                                                nextKeyword: entry.keyword,
                                                nextCategory: entry.category,
                                                nextStatus: entry.status,
                                                saveRecent: false,
                                            });
                                        }}
                                        className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-background px-3 py-2 text-left transition-colors hover:border-primary/50 hover:bg-accent"
                                    >
                                        <span className="truncate text-sm font-semibold text-foreground">{label}</span>
                                        <span className="shrink-0 text-[11px] text-muted-foreground">
                                            {conditionText || "전체 조건"}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-muted-foreground">아직 저장된 검색어가 없어요.</p>
                    )}
                </div>

                {/* 인기 카테고리 */}
                {popularCategories.length > 0 && (
                    <div className="space-y-2">
                        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            <Flame className="h-3.5 w-3.5 text-primary" />
                            인기 카테고리
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {popularCategories.map((category, index) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setSelectedCategory(category)}
                                    className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-foreground transition-colors hover:border-primary hover:text-primary"
                                >
                                    <span className="text-[11px] text-primary">{index + 1}</span>
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 전체 카테고리 */}
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        전체 카테고리
                    </p>
                    <div className="max-h-36 overflow-y-auto pr-1">
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => {
                                const isActive = appliedCategory === category;
                                return (
                                    <button
                                        key={category}
                                        type="button"
                                        onClick={() => setSelectedCategory(category)}
                                        className={cn(
                                            "rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                                            isActive
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-border bg-background text-foreground hover:border-primary hover:text-primary"
                                        )}
                                    >
                                        {category}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 상태 필터 */}
                {statuses.length > 1 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            상태
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {statuses.map((status) => {
                                const isActive = appliedStatus === status;
                                return (
                                    <button
                                        key={status}
                                        type="button"
                                        onClick={() => setSelectedStatus(status)}
                                        className={cn(
                                            "rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors",
                                            isActive
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-border bg-background text-foreground hover:border-primary hover:text-primary"
                                        )}
                                    >
                                        {status}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 검색 실행 버튼 */}
                <Button
                    type="button"
                    onClick={() => moveToSearchResult()}
                    className="h-10 w-full rounded-full text-sm font-semibold"
                >
                    검색 결과 페이지로 이동
                </Button>

            </CardContent>
        </Card>
    );
}