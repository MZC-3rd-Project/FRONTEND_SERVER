import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { buildNotificationSseUrl } from "@/domains/client/notifications/api/notificationsApi";
import {
    hasNotificationInInfiniteData,
    incrementUnreadCountData,
    prependNotificationToInfiniteData,
} from "@/domains/client/notifications/lib/notificationCache";
import { mapNotificationEvent } from "@/domains/client/notifications/lib/notificationMappers";
import { notificationKeys } from "@/domains/client/notifications/query/useNotificationQueries";

const INITIAL_RETRY_DELAY_MS = 3_000;
const MAX_RETRY_DELAY_MS = 30_000;
const MAX_CONSECUTIVE_FAILURES = 5;

export function useNotificationSse({ enabled = false } = {}) {
    const queryClient = useQueryClient();
    const seenNotificationIdsRef = useRef(new Set());

    useEffect(() => {
        if (!enabled || typeof window === "undefined" || typeof EventSource === "undefined") {
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

        const scheduleReconnect = () => {
            if (disposed || retryTimerId !== null) {
                return;
            }

            if (consecutiveFailureCount >= MAX_CONSECUTIVE_FAILURES) {
                console.warn(
                    `[NotificationSse] stopped reconnecting after ${consecutiveFailureCount} consecutive failures.`
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

        const handleNotification = (event) => {
            try {
                const payload = JSON.parse(event.data);
                const notification = mapNotificationEvent(payload);

                if (!notification.id || seenNotificationIdsRef.current.has(notification.id)) {
                    return;
                }

                const cachedListEntries = queryClient.getQueriesData({ queryKey: notificationKeys.lists() });
                const alreadyCached = cachedListEntries.some(([, data]) =>
                    hasNotificationInInfiniteData(data, notification.id)
                );

                seenNotificationIdsRef.current.add(notification.id);

                if (alreadyCached) {
                    return;
                }

                queryClient.setQueriesData(
                    { queryKey: notificationKeys.lists() },
                    (current) => prependNotificationToInfiniteData(current, notification)
                );
                queryClient.setQueryData(
                    notificationKeys.unreadCount(),
                    (current) => incrementUnreadCountData(current, 1)
                );
            } catch {
                // Ignore malformed SSE payloads and keep the stream alive.
            }
        };

        const cleanupEventSource = () => {
            if (eventSource) {
                eventSource.close();
                eventSource = null;
            }
        };

        function connect() {
            cleanupEventSource();

            const nextEventSource = new EventSource(buildNotificationSseUrl(), { withCredentials: true });
            eventSource = nextEventSource;

            const handleConnected = () => {
                consecutiveFailureCount = 0;
                retryDelayMs = INITIAL_RETRY_DELAY_MS;
                clearRetryTimer();
            };

            const handleHeartbeat = () => {
                consecutiveFailureCount = 0;
                retryDelayMs = INITIAL_RETRY_DELAY_MS;
            };

            const handleError = () => {
                consecutiveFailureCount += 1;
                cleanupEventSource();
                scheduleReconnect();
            };

            nextEventSource.addEventListener("connected", handleConnected);
            nextEventSource.addEventListener("heartbeat", handleHeartbeat);
            nextEventSource.addEventListener("notification", handleNotification);
            nextEventSource.onerror = handleError;
        }

        connect();

        return () => {
            disposed = true;
            clearRetryTimer();
            cleanupEventSource();
        };
    }, [enabled, queryClient]);
}
