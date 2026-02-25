import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { Flame, History, RotateCcw, Search } from "lucide-react";

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

function StickySearchPanel({
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
    const popularCategories = useMemo(() => categories.filter((category) => category !== "전체").slice(0, 6), [categories]);

    const saveRecentSearch = ({ nextKeyword, nextCategory, nextStatus }) => {
        const hasCondition = Boolean(nextKeyword) || nextCategory !== "전체" || nextStatus !== "전체";
        if (!hasCondition || typeof window === "undefined") return;

        const entry = {
            scope,
            keyword: nextKeyword,
            category: nextCategory,
            status: nextStatus,
            savedAt: Date.now(),
        };

        const next = [entry, ...recentSearches.filter((item) => !isSameEntry(item, entry))].slice(0, MAX_RECENT_SEARCHES);
        setRecentSearches(next);
        window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
    };

    const buildQuery = ({ nextKeyword, nextCategory, nextStatus }) => {
        const query = new URLSearchParams();
        query.set("scope", scope);

        const normalizedKeyword = nextKeyword.trim();
        if (normalizedKeyword) {
            query.set("keyword", normalizedKeyword);
        }

        if (nextCategory !== "전체") {
            query.set("category", nextCategory);
        }

        if (nextStatus !== "전체") {
            query.set("status", nextStatus);
        }
        return query;
    };

    const moveToSearchResult = ({ nextKeyword = keyword, nextCategory = appliedCategory, nextStatus = appliedStatus, saveRecent = true } = {}) => {
        if (saveRecent) {
            saveRecentSearch({ nextKeyword: nextKeyword.trim(), nextCategory, nextStatus });
        }

        const query = buildQuery({ nextKeyword, nextCategory, nextStatus });
        navigate(`/search?${query.toString()}`);
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
        <Card className="border-zinc-200/80 bg-white/95 shadow-[0_14px_45px_rgba(15,23,42,0.08)] md:max-h-[calc(100vh-7rem)] md:overflow-y-auto md:overscroll-contain dark:border-zinc-700/70 dark:bg-zinc-900/85">
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2">
                    <CardTitle className="text-lg text-zinc-900 dark:text-zinc-100">{title}</CardTitle>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-zinc-600 transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-cyan-300/40 dark:hover:text-cyan-100"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                        초기화
                    </button>
                </div>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
            </CardHeader>
            <CardContent className="space-y-5">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">키워드 검색</p>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            type="text"
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                    moveToSearchResult();
                                }
                            }}
                            placeholder={placeholder}
                            className="h-10 border-zinc-300 bg-white pl-9 text-zinc-800 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        />
                    </div>
                </div>

                <div className="space-y-2 rounded-2xl border border-zinc-200/80 bg-zinc-50/80 p-3 dark:border-zinc-700/80 dark:bg-zinc-900/70">
                    <div className="flex items-center justify-between gap-2">
                        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                            <History className="h-3.5 w-3.5" />
                            최근 검색어
                        </p>
                        {recentByScope.length > 0 && (
                            <button
                                type="button"
                                onClick={clearRecentByScope}
                                className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                            >
                                전체 삭제
                            </button>
                        )}
                    </div>
                    {recentByScope.length > 0 ? (
                        <div className="space-y-2">
                            {recentByScope.map((entry, index) => {
                                const label = entry.keyword || "필터 검색";
                                const conditionText = [entry.category !== "전체" ? entry.category : null, entry.status !== "전체" ? entry.status : null]
                                    .filter(Boolean)
                                    .join(" · ");
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
                                        className="flex w-full items-center justify-between gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-left transition-colors hover:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-cyan-300/40"
                                    >
                                        <span className="truncate text-sm font-semibold text-zinc-800 dark:text-zinc-100">{label}</span>
                                        <span className="shrink-0 text-[11px] text-zinc-500 dark:text-zinc-400">
                                            {conditionText || "전체 조건"}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">아직 저장된 검색어가 없어요.</p>
                    )}
                </div>

                {popularCategories.length > 0 && (
                    <div className="space-y-2">
                        <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                            <Flame className="h-3.5 w-3.5 text-orange-500" />
                            인기 카테고리
                        </p>
                        <div className="flex flex-wrap gap-2">
                            {popularCategories.map((category, index) => (
                                <button
                                    key={category}
                                    type="button"
                                    onClick={() => setSelectedCategory(category)}
                                    className="inline-flex items-center gap-1 rounded-full border border-zinc-300 bg-white px-2.5 py-1 text-xs font-semibold text-zinc-700 transition-colors hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:border-cyan-300/40 dark:hover:text-cyan-100"
                                >
                                    <span className="text-[11px] text-orange-500">{index + 1}</span>
                                    {category}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">전체 카테고리</p>
                    <div className="max-h-36 overflow-y-auto pr-1">
                        <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                type="button"
                                onClick={() => setSelectedCategory(category)}
                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                                    appliedCategory === category
                                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-cyan-300/40 dark:bg-cyan-400/20 dark:text-cyan-100"
                                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                                }`}
                                    >
                                        {category}
                                    </button>
                                ))}
                        </div>
                    </div>
                </div>

                {statuses.length > 1 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">상태</p>
                        <div className="flex flex-wrap gap-2">
                            {statuses.map((status) => (
                                <button
                                    key={status}
                                    type="button"
                                    onClick={() => setSelectedStatus(status)}
                                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                                        appliedStatus === status
                                            ? "border-zinc-900 bg-zinc-900 text-white dark:border-cyan-300/40 dark:bg-cyan-400/20 dark:text-cyan-100"
                                            : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <Button
                    type="button"
                    onClick={() => moveToSearchResult()}
                    className="h-10 w-full rounded-full bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-cyan-400/20 dark:text-cyan-100 dark:hover:bg-cyan-400/30"
                >
                    검색 결과 페이지로 이동
                </Button>
            </CardContent>
        </Card>
    );
}

export default StickySearchPanel;
