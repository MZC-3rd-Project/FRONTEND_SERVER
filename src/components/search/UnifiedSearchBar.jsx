import { Search, Sparkles } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEARCH_SCOPE_OPTIONS } from "@/domains/client/search/lib/searchScopes";

export default function UnifiedSearchBar({
    keyword,
    selectedScope = "all",
    onKeywordChange,
    onScopeChange,
    onSubmit,
    placeholder = "찾고 싶은 상품, 펀딩, 핫딜, 스토어를 입력하세요",
    submitLabel = "검색",
    hints = [],
    compact = false,
    className,
}) {
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit?.();
            }}
            className={cn(
                "relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 shadow-[0_24px_80px_rgba(31,38,66,0.14)] backdrop-blur",
                compact ? "p-4 sm:p-5" : "p-5 sm:p-6",
                className
            )}
        >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-cyan-400/10 via-orange-300/12 to-emerald-400/10" />
            <div className="relative z-10 space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Unified Search
                    </span>
                    <p className="text-sm text-muted-foreground">
                        카테고리를 고르고 바로 원하는 결과로 진입합니다.
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {SEARCH_SCOPE_OPTIONS.map((option) => {
                        const isActive = selectedScope === option.value;
                        return (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => onScopeChange?.(option.value)}
                                className={cn(
                                    "rounded-full border px-3 py-1.5 text-sm font-semibold transition-colors",
                                    isActive
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-background/90 text-foreground hover:border-primary/60 hover:text-primary"
                                )}
                            >
                                {option.label}
                            </button>
                        );
                    })}
                </div>

                <div className={cn("grid gap-3", compact ? "lg:grid-cols-[1fr_112px]" : "lg:grid-cols-[1fr_132px]")}>
                    <div className="relative">
                        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={keyword}
                            onChange={(event) => onKeywordChange?.(event.target.value)}
                            placeholder={placeholder}
                            className={cn(
                                "h-13 rounded-[1.4rem] border-border bg-background pl-12 pr-4 text-base shadow-none",
                                compact && "h-12"
                            )}
                        />
                    </div>
                    <Button
                        type="submit"
                        className={cn(
                            "h-13 rounded-[1.4rem] text-base font-semibold shadow-[0_18px_40px_rgba(15,23,42,0.18)]",
                            compact && "h-12"
                        )}
                    >
                        {submitLabel}
                    </Button>
                </div>

                {hints.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                        {hints.map((hint) => (
                            <button
                                key={hint}
                                type="button"
                                onClick={() => onKeywordChange?.(hint)}
                                className="rounded-full border border-border bg-background/85 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground"
                            >
                                {hint}
                            </button>
                        ))}
                    </div>
                ) : null}
            </div>
        </form>
    );
}
