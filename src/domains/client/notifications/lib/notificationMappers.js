import { encodeIdPathSegment } from "@/common/utils/id";
import {
    formatDateTimeLabel,
    parseDate,
    toId,
    toNumber,
    toText,
} from "@/domains/client/commerce/lib/commerceViewUtils";

const NOTIFICATION_TYPE_LABELS = {
    FUNDING_SUCCESS: "펀딩 성공",
    FUNDING_FAIL: "펀딩 실패",
    PAYMENT: "결제",
    HOTDEAL: "핫딜",
    STOCK_DEPLETED: "재고",
    CHAT_MESSAGE: "채팅",
    GENERAL: "일반",
};

const NOTIFICATION_CHANNEL_LABELS = {
    IN_APP: "인앱",
    EMAIL: "이메일",
    SMS: "문자",
    KAKAO: "카카오",
    PUSH: "푸시",
};

function mapNotificationDelivery(raw = {}) {
    return {
        channel: toText(raw?.channel),
        status: toText(raw?.status),
        provider: toText(raw?.provider),
        attemptCount: toNumber(raw?.attemptCount, 0),
        lastErrorCode: toText(raw?.lastErrorCode),
        lastErrorMessage: toText(raw?.lastErrorMessage),
        nextRetryAt: raw?.nextRetryAt ?? null,
        deliveredAt: raw?.deliveredAt ?? null,
    };
}

export function formatNotificationRelativeTime(value) {
    const date = parseDate(value);

    if (!date) {
        return "방금 전";
    }

    const diffMs = Date.now() - date.getTime();
    if (diffMs < 60_000) {
        return "방금 전";
    }

    if (diffMs < 3_600_000) {
        return `${Math.max(1, Math.floor(diffMs / 60_000))}분 전`;
    }

    const now = new Date();
    const sameDay =
        now.getFullYear() === date.getFullYear()
        && now.getMonth() === date.getMonth()
        && now.getDate() === date.getDate();

    if (sameDay) {
        return date.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return `${date.getMonth() + 1}.${date.getDate()}`;
}

export function mapNotificationTypeLabel(type) {
    const normalizedType = toText(type).toUpperCase();
    return NOTIFICATION_TYPE_LABELS[normalizedType] ?? (normalizedType || "알림");
}

export function mapNotificationChannelLabel(channel) {
    const normalizedChannel = toText(channel).toUpperCase();
    return NOTIFICATION_CHANNEL_LABELS[normalizedChannel] ?? (normalizedChannel || "알림");
}

export function mapNotification(raw = {}) {
    const createdAt = raw?.createdAt ?? raw?.occurredAt ?? null;

    return {
        id: toId(raw?.id ?? raw?.notificationId),
        type: toText(raw?.type, "GENERAL").toUpperCase(),
        channel: toText(raw?.channel, "IN_APP").toUpperCase(),
        title: toText(raw?.title, "새 알림"),
        message: toText(raw?.message, "알림 내용이 도착했습니다."),
        referenceType: toText(raw?.referenceType).toUpperCase(),
        referenceId: toId(raw?.referenceId),
        read: Boolean(raw?.read),
        readAt: raw?.readAt ?? null,
        createdAt,
        createdAtLabel: formatDateTimeLabel(createdAt),
        relativeTimeLabel: formatNotificationRelativeTime(createdAt),
        deliveries: Array.isArray(raw?.deliveries) ? raw.deliveries.map(mapNotificationDelivery) : [],
    };
}

export function mapNotificationCursorPayload(payload = {}) {
    const items = Array.isArray(payload?.items) ? payload.items : [];
    const nextCursor = payload?.nextCursor ?? null;

    return {
        items: items.map(mapNotification).filter((item) => item.id),
        nextCursor,
        hasNext: typeof payload?.hasNext === "boolean" ? payload.hasNext : Boolean(nextCursor),
        totalCount: toNumber(payload?.totalCount, items.length),
    };
}

export function flattenNotificationPages(pages) {
    if (!Array.isArray(pages)) {
        return [];
    }

    return pages.flatMap((page) => (Array.isArray(page?.items) ? page.items : []));
}

export function mapUnreadCountPayload(payload = {}) {
    return {
        unreadCount: toNumber(payload?.unreadCount, 0),
    };
}

export function mapNotificationEvent(raw = {}) {
    return mapNotification({
        notificationId: raw?.notificationId,
        type: raw?.type,
        channel: "IN_APP",
        title: raw?.title,
        message: raw?.message,
        referenceType: raw?.referenceType,
        referenceId: raw?.referenceId,
        occurredAt: raw?.occurredAt,
        read: false,
        deliveries: [],
    });
}

export function buildNotificationTargetPath(notification) {
    const referenceType = toText(notification?.referenceType).toUpperCase();
    const referenceId = toId(notification?.referenceId);

    if (!referenceId) {
        return null;
    }

    switch (referenceType) {
        case "CHAT_ROOM":
            return `/my/messages?roomId=${encodeIdPathSegment(referenceId)}`;
        case "CAMPAIGN":
            return `/funding/${encodeIdPathSegment(referenceId)}`;
        case "HOT_DEAL":
            return `/deals/${encodeIdPathSegment(referenceId)}`;
        case "ORDER":
            return `/my/orders/${encodeIdPathSegment(referenceId)}`;
        default:
            return null;
    }
}
