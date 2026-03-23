import {
    useInfiniteQuery,
    useMutation,
    useQuery,
    useQueryClient,
} from "@tanstack/react-query";

import { shouldRetryRequest } from "@/common/api/queryRetry";
import {
    deleteNotification,
    fetchNotifications,
    fetchUnreadNotificationCount,
    markAllNotificationsAsRead,
    markNotificationAsRead,
} from "@/domains/client/notifications/api/notificationsApi";
import {
    markAllNotificationsReadInInfiniteData,
    markNotificationReadInInfiniteData,
    removeNotificationFromInfiniteData,
    setUnreadCountData,
} from "@/domains/client/notifications/lib/notificationCache";
import {
    mapNotificationCursorPayload,
    mapUnreadCountPayload,
} from "@/domains/client/notifications/lib/notificationMappers";

export const notificationKeys = {
    all: ["notifications"],
    lists: () => [...notificationKeys.all, "list"],
    list: (params) => [...notificationKeys.lists(), params],
    unreadCount: () => [...notificationKeys.all, "unread-count"],
};

export function useInfiniteNotificationsQuery(params = { size: 20 }, options = {}) {
    const { enabled = true } = options;

    return useInfiniteQuery({
        queryKey: notificationKeys.list(params),
        queryFn: async ({ pageParam }) => {
            const payload = await fetchNotifications({
                ...params,
                cursor: pageParam || undefined,
            });

            return mapNotificationCursorPayload(payload);
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => (lastPage?.hasNext ? (lastPage?.nextCursor ?? undefined) : undefined),
        enabled,
        retry: shouldRetryRequest,
        staleTime: 5_000,
    });
}

export function useNotificationUnreadCountQuery(options = {}) {
    const { enabled = true } = options;

    return useQuery({
        queryKey: notificationKeys.unreadCount(),
        queryFn: async () => {
            const payload = await fetchUnreadNotificationCount();
            return mapUnreadCountPayload(payload);
        },
        enabled,
        retry: shouldRetryRequest,
        staleTime: 5_000,
    });
}

export function useMarkNotificationReadMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId) => markNotificationAsRead(notificationId),
        onSuccess: (_, notificationId) => {
            queryClient.setQueriesData(
                { queryKey: notificationKeys.lists() },
                (current) => markNotificationReadInInfiniteData(current, String(notificationId))
            );
            void queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        },
    });
}

export function useMarkAllNotificationsReadMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: () => markAllNotificationsAsRead(),
        onSuccess: () => {
            queryClient.setQueriesData(
                { queryKey: notificationKeys.lists() },
                (current) => markAllNotificationsReadInInfiniteData(current)
            );
            queryClient.setQueryData(notificationKeys.unreadCount(), (current) => setUnreadCountData(current, 0));
        },
    });
}

export function useDeleteNotificationMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (notificationId) => deleteNotification(notificationId),
        onSuccess: (_, notificationId) => {
            queryClient.setQueriesData(
                { queryKey: notificationKeys.lists() },
                (current) => removeNotificationFromInfiniteData(current, String(notificationId))
            );
            void queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        },
    });
}
