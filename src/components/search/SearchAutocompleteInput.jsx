import { useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, Search } from "lucide-react";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { useSearchSuggestions } from "@/domains/client/search/hooks/useSearchSuggestions";

const TYPE_LABELS = {
    TITLE: "상품명",
    TAG: "태그",
    STORE: "스토어",
    CATEGORY: "카테고리",
};

const TYPE_STYLES = {
    TITLE: "border-cyan-200 bg-cyan-50 text-cyan-800",
    TAG: "border-amber-200 bg-amber-50 text-amber-800",
    STORE: "border-emerald-200 bg-emerald-50 text-emerald-800",
    CATEGORY: "border-violet-200 bg-violet-50 text-violet-800",
};

export default function SearchAutocompleteInput({
    value,
    onValueChange,
    onSubmit,
    placeholder,
    inputClassName,
    panelClassName,
}) {
    const wrapperRef = useRef(null);
    const [isFocused, setIsFocused] = useState(false);
    const {
        suggestions,
        isLoading,
        hasQuery,
    } = useSearchSuggestions({
        query: value,
        enabled: isFocused,
    });

    useEffect(() => {
        if (typeof document === "undefined") {
            return undefined;
        }

        const handlePointerDown = (event) => {
            if (!wrapperRef.current?.contains(event.target)) {
                setIsFocused(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        return () => document.removeEventListener("pointerdown", handlePointerDown);
    }, []);

    const showPanel = isFocused && hasQuery && (isLoading || suggestions.length > 0);
    const normalizedValue = useMemo(() => String(value || "").trim(), [value]);

    const handleSubmit = (nextValue = normalizedValue) => {
        onSubmit?.(nextValue);
        setIsFocused(false);
    };

    return (
        <div ref={wrapperRef} className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
                value={value}
                onFocus={() => setIsFocused(true)}
                onChange={(event) => {
                    onValueChange?.(event.target.value);
                    setIsFocused(true);
                }}
                onKeyDown={(event) => {
                    if (event.key === "Enter") {
                        event.preventDefault();
                        handleSubmit();
                    }
                }}
                placeholder={placeholder}
                className={cn("pl-12 pr-4", inputClassName)}
            />

            {showPanel ? (
                <div
                    className={cn(
                        "absolute inset-x-0 top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-2xl border border-border bg-background shadow-[0_18px_48px_rgba(15,23,42,0.16)]",
                        panelClassName
                    )}
                >
                    {isLoading ? (
                        <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            제안어를 불러오는 중입니다
                        </div>
                    ) : (
                        <ul className="max-h-80 overflow-y-auto py-2">
                            {suggestions.map((suggestion) => {
                                const type = String(suggestion?.type || "").toUpperCase();
                                const text = String(suggestion?.text || "").trim();
                                if (!text) {
                                    return null;
                                }

                                return (
                                    <li key={`${type}-${text}`}>
                                        <button
                                            type="button"
                                            onMouseDown={(event) => {
                                                event.preventDefault();
                                                onValueChange?.(text);
                                                handleSubmit(text);
                                            }}
                                            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-accent"
                                        >
                                            <span className={cn("truncate text-sm font-medium", type === "TITLE" ? "text-foreground" : "text-muted-foreground")}>
                                                {text}
                                            </span>
                                            <span className={cn(
                                                "shrink-0 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                                                TYPE_STYLES[type] ?? "border-border bg-muted text-muted-foreground"
                                            )}>
                                                {TYPE_LABELS[type] ?? type}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            ) : null}
        </div>
    );
}
