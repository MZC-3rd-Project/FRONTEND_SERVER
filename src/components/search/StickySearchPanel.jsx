import { useState } from "react";
import { useNavigate } from "react-router";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function StickySearchPanel({
    scope,
    title,
    description,
    placeholder,
    categories,
    statuses = ["전체"],
}) {
    const navigate = useNavigate();
    const [keyword, setKeyword] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("전체");
    const [selectedStatus, setSelectedStatus] = useState("전체");

    const handleSubmit = () => {
        const query = new URLSearchParams();
        query.set("scope", scope);

        const normalizedKeyword = keyword.trim();
        if (normalizedKeyword) {
            query.set("keyword", normalizedKeyword);
        }

        if (selectedCategory !== "전체") {
            query.set("category", selectedCategory);
        }

        if (selectedStatus !== "전체") {
            query.set("status", selectedStatus);
        }

        navigate(`/search?${query.toString()}`);
    };

    return (
        <Card className="border-zinc-200/80 bg-white/95 shadow-[0_14px_45px_rgba(15,23,42,0.08)] md:max-h-[calc(100vh-7rem)] md:overflow-y-auto md:overscroll-contain dark:border-zinc-700/70 dark:bg-zinc-900/85">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg text-zinc-900 dark:text-zinc-100">{title}</CardTitle>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{description}</p>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">키워드</p>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                        <Input
                            type="text"
                            value={keyword}
                            onChange={(event) => setKeyword(event.target.value)}
                            placeholder={placeholder}
                            className="h-10 border-zinc-300 bg-white pl-9 text-zinc-800 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">카테고리</p>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                type="button"
                                onClick={() => setSelectedCategory(category)}
                                className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                                    selectedCategory === category
                                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-cyan-300/40 dark:bg-cyan-400/20 dark:text-cyan-100"
                                        : "border-zinc-300 bg-white text-zinc-700 hover:border-zinc-900 hover:text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
                                }`}
                            >
                                {category}
                            </button>
                        ))}
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
                                        selectedStatus === status
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
                    onClick={handleSubmit}
                    className="h-10 w-full rounded-full bg-zinc-900 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-cyan-400/20 dark:text-cyan-100 dark:hover:bg-cyan-400/30"
                >
                    검색 결과 페이지로 이동
                </Button>
            </CardContent>
        </Card>
    );
}

export default StickySearchPanel;
