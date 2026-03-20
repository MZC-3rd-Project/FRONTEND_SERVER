import { useEffect, useMemo, useRef, useState } from "react";

import { fetchSearchSuggestions } from "@/domains/client/search/api/searchApi";

const DEFAULT_DELAY = 200;
const DEFAULT_SIZE = 10;

export function useSearchSuggestions({
    query,
    enabled = true,
    delay = DEFAULT_DELAY,
    size = DEFAULT_SIZE,
}) {
    const controllerRef = useRef(null);
    const [suggestions, setSuggestions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const normalizedQuery = useMemo(() => String(query || "").trim(), [query]);

    useEffect(() => {
        if (!enabled || normalizedQuery.length < 2) {
            controllerRef.current?.abort();
            setSuggestions([]);
            setIsLoading(false);
            setError(null);
            return undefined;
        }

        const timeoutId = window.setTimeout(async () => {
            controllerRef.current?.abort();
            const controller = new AbortController();
            controllerRef.current = controller;
            setIsLoading(true);
            setError(null);

            try {
                const nextSuggestions = await fetchSearchSuggestions({
                    q: normalizedQuery,
                    size,
                    signal: controller.signal,
                });
                setSuggestions(Array.isArray(nextSuggestions) ? nextSuggestions : []);
            } catch (nextError) {
                if (
                    nextError?.code === "ERR_CANCELED" ||
                    nextError?.name === "CanceledError" ||
                    nextError?.name === "AbortError"
                ) {
                    return;
                }
                setSuggestions([]);
                setError(nextError);
            } finally {
                if (controllerRef.current === controller) {
                    setIsLoading(false);
                }
            }
        }, delay);

        return () => {
            window.clearTimeout(timeoutId);
            controllerRef.current?.abort();
        };
    }, [delay, enabled, normalizedQuery, size]);

    return {
        suggestions,
        isLoading,
        error,
        hasQuery: normalizedQuery.length >= 2,
    };
}
