import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { buildNotificationSseUrl } from "@/domains/client/notifications/api/notificationsApi";
import {
    hasNotificationInInfiniteData,
    incrementUnreadCountData,
    prependNotificationToInfiniteData,
} from "@/domains/client/notifications/lib/notificationCache";
import { mapNotificationEvent } from "@/domains/client/notifications/lib/notificationMappers";
import { notificationKeys } from "@/domains/client/notifications/query/useNotificationQueries";

export function useNotificationSse({ enabled = false } = {}) {
    const queryClient = useQueryClient();
    const seenNotificationIdsRef = useRef(new Set());
    const [connectionState, setConnectionState] = useState("idle");

    useEffect(() => {
        if (!enabled || typeof window === "undefined" || typeof EventSource === "undefined") {
            return undefined;
        }

        const eventSource = new EventSource(buildNotificationSseUrl(), { withCredentials: true });

        const handleConnected = () => {
            setConnectionState("connected");
        };

        const handleHeartbeat = () => {
            setConnectionState("connected");
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
                setConnectionState("connected");

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

        const handleError = () => {
            setConnectionState("error");
        };

        eventSource.addEventListener("connected", handleConnected);
        eventSource.addEventListener("heartbeat", handleHeartbeat);
        eventSource.addEventListener("notification", handleNotification);
        eventSource.onerror = handleError;

        return () => {
            eventSource.close();
        };
    }, [enabled, queryClient]);

    return enabled ? connectionState : "idle";
}
