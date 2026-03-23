import { axiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";
import { encodeIdPathSegment } from "@/common/utils/id";

const NOTIFICATION_REQUEST_CONFIG = {
    skipAuthRedirect: true,
};

const isDev = import.meta.env.DEV;
const proxyTarget = import.meta.env.VITE_API_PROXY_TARGET;
const useDevProxy = isDev && Boolean(proxyTarget);
const notificationBaseURL = useDevProxy
    ? "/api"
    : (import.meta.env.VITE_API_URL || "http://localhost:8071/api");

export async function fetchNotifications({ cursor, size = 20 } = {}) {
    try {
        const response = await axiosInstance.get("/v1/notifications", {
            ...NOTIFICATION_REQUEST_CONFIG,
            params: {
                cursor: cursor || undefined,
                size,
            },
        });

        return unwrapApiResponseBody(response, "알림 목록을 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "알림 목록 조회에 실패했습니다.");
    }
}

export async function fetchUnreadNotificationCount() {
    try {
        const response = await axiosInstance.get("/v1/notifications/unread-count", NOTIFICATION_REQUEST_CONFIG);
        return unwrapApiResponseBody(response, "미읽음 알림 개수를 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "미읽음 알림 개수 조회에 실패했습니다.");
    }
}

export async function markNotificationAsRead(notificationId) {
    try {
        const response = await axiosInstance.patch(
            `/v1/notifications/${encodeIdPathSegment(notificationId)}/read`,
            undefined,
            NOTIFICATION_REQUEST_CONFIG
        );

        return unwrapApiResponseBody(response, "알림 읽음 처리에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "알림 읽음 처리에 실패했습니다.");
    }
}

export async function markAllNotificationsAsRead() {
    try {
        const response = await axiosInstance.patch(
            "/v1/notifications/read-all",
            undefined,
            NOTIFICATION_REQUEST_CONFIG
        );

        return unwrapApiResponseBody(response, "전체 알림 읽음 처리에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "전체 알림 읽음 처리에 실패했습니다.");
    }
}

export async function deleteNotification(notificationId) {
    try {
        const response = await axiosInstance.delete(
            `/v1/notifications/${encodeIdPathSegment(notificationId)}`,
            NOTIFICATION_REQUEST_CONFIG
        );

        return unwrapApiResponseBody(response, "알림 삭제에 실패했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "알림 삭제에 실패했습니다.");
    }
}

export function buildNotificationSseUrl(baseOrigin) {
    const origin = baseOrigin || (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");
    const baseURL = notificationBaseURL.replace(/\/$/, "");

    return new URL(`${baseURL}/v1/notifications/subscribe`, origin).toString();
}
