import { useEffect } from "react";

import { buildHotDealQueueSseUrl } from "@/domains/client/deals/api/dealsApi";

const INITIAL_RETRY_DELAY_MS = 3_000;
const MAX_RETRY_DELAY_MS = 30_000;
const MAX_CONSECUTIVE_FAILURES = 5;
const HOT_DEAL_QUEUE_EVENT_NAMES = [
    "queue-connected",
    "queue-position",
    "queue-admitted",
    "heartbeat",
];

export function useHotDealQueueSse({
    hotDealId,
    enabled = false,
    onStatus,
} = {}) {
    useEffect(() => {
        if (!enabled || !hotDealId || typeof window === "undefined" || typeof EventSource === "undefined") {
            return undefined;
        }

        let disposed = false;
        let eventSource = null;
        let retryTimerId = null;
        let retryDelayMs = INITIAL_RETRY_DELAY_MS;
        let consecutiveFailureCount = 0;

        const clearRetryTimer = () => {
            if (retryTimerId !== null) {
                window.clearTimeout(retryTimerId);
                retryTimerId = null;
            }
        };

        const cleanupEventSource = () => {
            if (eventSource) {
                eventSource.close();
                eventSource = null;
            }
        };

        const scheduleReconnect = () => {
            if (disposed || retryTimerId !== null) {
                return;
            }

            if (consecutiveFailureCount >= MAX_CONSECUTIVE_FAILURES) {
                console.warn(
                    `[HotDealQueueSse] stopped reconnecting after ${consecutiveFailureCount} consecutive failures. hotDealId=${hotDealId}`
                );
                return;
            }

            retryTimerId = window.setTimeout(() => {
                retryTimerId = null;

                if (disposed) {
                    return;
                }

                retryDelayMs = Math.min(retryDelayMs * 2, MAX_RETRY_DELAY_MS);
                connect();
            }, retryDelayMs);
        };

        const handleQueueEvent = (event) => {
            try {
                const payload = JSON.parse(event.data);
                consecutiveFailureCount = 0;
                retryDelayMs = INITIAL_RETRY_DELAY_MS;
                clearRetryTimer();

                if (typeof onStatus === "function") {
                    onStatus(payload, event.type);
                }
            } catch {
                // Ignore malformed SSE payloads and keep the stream alive.
            }
        };

        function connect() {
            cleanupEventSource();

            const nextEventSource = new EventSource(buildHotDealQueueSseUrl(hotDealId), {
                withCredentials: true,
            });
            eventSource = nextEventSource;

            const handleError = () => {
                consecutiveFailureCount += 1;
                cleanupEventSource();
                scheduleReconnect();
            };

            HOT_DEAL_QUEUE_EVENT_NAMES.forEach((eventName) => {
                nextEventSource.addEventListener(eventName, handleQueueEvent);
            });
            nextEventSource.onerror = handleError;
        }

        connect();

        return () => {
            disposed = true;
            clearRetryTimer();
            cleanupEventSource();
        };
    }, [enabled, hotDealId, onStatus]);
}
