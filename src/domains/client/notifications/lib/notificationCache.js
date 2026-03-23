import { toNumber } from "@/domains/client/commerce/lib/commerceViewUtils";

function updateNotificationPages(data, updateItems) {
    if (!data || !Array.isArray(data.pages)) {
        return data;
    }

    let changed = false;

    const pages = data.pages.map((page) => {
        const currentItems = Array.isArray(page?.items) ? page.items : [];
        const nextItems = updateItems(currentItems, page);

        if (nextItems === currentItems) {
            return page;
        }

        changed = true;
        return {
            ...page,
            items: nextItems,
        };
    });

    return changed ? { ...data, pages } : data;
}

export function hasNotificationInInfiniteData(data, notificationId) {
    if (!data || !Array.isArray(data.pages) || !notificationId) {
        return false;
    }

    return data.pages.some((page) =>
        Array.isArray(page?.items) && page.items.some((item) => item?.id === notificationId)
    );
}

export function prependNotificationToInfiniteData(data, notification) {
    if (!data || !Array.isArray(data.pages) || !notification?.id) {
        return data;
    }

    return updateNotificationPages(data, (items, page) => {
        const dedupedItems = items.filter((item) => item?.id !== notification.id);

        if (page === data.pages[0]) {
            return [notification, ...dedupedItems];
        }

        return dedupedItems.length === items.length ? items : dedupedItems;
    });
}

export function markNotificationReadInInfiniteData(data, notificationId) {
    if (!notificationId) {
        return data;
    }

    const readAt = new Date().toISOString();

    return updateNotificationPages(data, (items) => {
        let changed = false;

        const nextItems = items.map((item) => {
            if (item?.id !== notificationId || item?.read) {
                return item;
            }

            changed = true;
            return {
                ...item,
                read: true,
                readAt,
            };
        });

        return changed ? nextItems : items;
    });
}

export function markAllNotificationsReadInInfiniteData(data) {
    const readAt = new Date().toISOString();

    return updateNotificationPages(data, (items) => {
        let changed = false;

        const nextItems = items.map((item) => {
            if (item?.read) {
                return item;
            }

            changed = true;
            return {
                ...item,
                read: true,
                readAt,
            };
        });

        return changed ? nextItems : items;
    });
}

export function removeNotificationFromInfiniteData(data, notificationId) {
    if (!notificationId) {
        return data;
    }

    return updateNotificationPages(data, (items) => {
        const nextItems = items.filter((item) => item?.id !== notificationId);
        return nextItems.length === items.length ? items : nextItems;
    });
}

export function incrementUnreadCountData(current, delta = 1) {
    const unreadCount = Math.max(0, toNumber(current?.unreadCount, 0) + delta);

    return {
        ...(current ?? {}),
        unreadCount,
    };
}

export function setUnreadCountData(current, unreadCount) {
    return {
        ...(current ?? {}),
        unreadCount: Math.max(0, toNumber(unreadCount, 0)),
    };
}
