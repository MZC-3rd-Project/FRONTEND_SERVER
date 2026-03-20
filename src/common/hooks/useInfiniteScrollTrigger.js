import { useEffect, useRef } from "react";

export function useInfiniteScrollTrigger({
    enabled,
    onIntersect,
    rootMargin = "320px",
}) {
    const sentinelRef = useRef(null);

    useEffect(() => {
        if (!enabled || typeof onIntersect !== "function") {
            return undefined;
        }

        const node = sentinelRef.current;
        if (!node || typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
            return undefined;
        }

        let requested = false;
        const observer = new IntersectionObserver(
            (entries) => {
                const [entry] = entries;
                if (!entry?.isIntersecting || requested) {
                    return;
                }

                requested = true;
                Promise.resolve(onIntersect()).finally(() => {
                    requested = false;
                });
            },
            { rootMargin }
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [enabled, onIntersect, rootMargin]);

    return sentinelRef;
}
