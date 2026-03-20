import { LoaderCircle } from "lucide-react";

import { cn } from "@/lib/utils";

export default function InfiniteListFooter({
    sentinelRef,
    hasNextPage,
    isFetchingNextPage,
    endMessage = "모든 결과를 확인했습니다.",
    className,
}) {
    if (!hasNextPage && !isFetchingNextPage) {
        return (
            <div className={cn("rounded-2xl border border-dashed border-border bg-muted/40 px-4 py-3 text-center text-sm text-muted-foreground", className)}>
                {endMessage}
            </div>
        );
    }

    return (
        <div
            ref={sentinelRef}
            className={cn(
                "rounded-2xl border border-dashed border-border bg-card/70 px-4 py-3 text-center text-sm text-muted-foreground",
                className
            )}
        >
            {isFetchingNextPage ? (
                <span className="inline-flex items-center gap-2 font-medium text-foreground">
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    결과를 더 불러오는 중입니다
                </span>
            ) : (
                "스크롤하면 다음 결과를 이어서 불러옵니다."
            )}
        </div>
    );
}
