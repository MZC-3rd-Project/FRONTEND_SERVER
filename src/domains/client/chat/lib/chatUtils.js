import {
    formatDateTimeLabel,
    parseDate,
    toId,
    toNumber,
    toText,
} from "@/domains/client/commerce/lib/commerceViewUtils";

const CHAT_WEBSOCKET_PATH = "/ws/chat";
const CHAT_SELF_SENDER_IDS_STORAGE_KEY = "chat:self-sender-ids";

export const CHAT_HEARTBEAT_INTERVAL_MS = 25_000;
export const CHAT_HEARTBEAT_TIMEOUT_MS = 60_000;

export function buildChatWebSocketUrl(baseOrigin) {
    const origin =
        baseOrigin ||
        import.meta.env.VITE_CHAT_WS_BASE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "http://localhost:3000");

    const url = new URL(CHAT_WEBSOCKET_PATH, origin);
    url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return url.toString();
}

function getChatStorage() {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        return window.sessionStorage;
    } catch {
        return null;
    }
}

export function readStoredChatSelfSenderIds() {
    const storage = getChatStorage();

    if (!storage) {
        return [];
    }

    try {
        const raw = storage.getItem(CHAT_SELF_SENDER_IDS_STORAGE_KEY);

        if (!raw) {
            return [];
        }

        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.map((value) => toId(value)).filter(Boolean) : [];
    } catch {
        return [];
    }
}

export function mergeChatSelfSenderIds(previousIds = [], nextIds = []) {
    return [...new Set([...previousIds, ...nextIds].map((value) => toId(value)).filter(Boolean))];
}

export function persistChatSelfSenderIds(senderIds = []) {
    const storage = getChatStorage();

    if (!storage) {
        return senderIds;
    }

    try {
        storage.setItem(
            CHAT_SELF_SENDER_IDS_STORAGE_KEY,
            JSON.stringify(mergeChatSelfSenderIds([], senderIds))
        );
    } catch {
        return senderIds;
    }

    return senderIds;
}

export function rememberStoredChatSelfSenderIds(previousIds = [], nextIds = []) {
    const mergedIds = mergeChatSelfSenderIds(previousIds, nextIds);
    persistChatSelfSenderIds(mergedIds);
    return mergedIds;
}

export function resolveSelfSenderIdsFromParticipants(participants) {
    if (!Array.isArray(participants)) {
        return [];
    }

    return participants
        .filter((participant) => participant?.role === "PARTICIPANT")
        .map((participant) => toId(participant?.userId))
        .filter(Boolean);
}

export function createClientMessageId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
    }

    return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function formatChatRoomTime(value) {
    const date = parseDate(value);

    if (!date) {
        return "시간 미정";
    }

    const diffMs = Date.now() - date.getTime();
    if (diffMs < 60_000) {
        return "방금";
    }

    if (diffMs < 3_600_000) {
        return `${Math.max(1, Math.floor(diffMs / 60_000))}분 전`;
    }

    const now = new Date();
    const sameDay =
        now.getFullYear() === date.getFullYear() &&
        now.getMonth() === date.getMonth() &&
        now.getDate() === date.getDate();

    if (sameDay) {
        return date.toLocaleTimeString("ko-KR", {
            hour: "2-digit",
            minute: "2-digit",
        });
    }

    return `${date.getMonth() + 1}.${date.getDate()}`;
}

export function extractLastMessageText(lastMessage) {
    if (typeof lastMessage === "string") {
        return toText(lastMessage, "대화 내역이 없습니다.");
    }

    if (lastMessage && typeof lastMessage === "object") {
        return toText(lastMessage?.content ?? lastMessage?.message, "대화 내역이 없습니다.");
    }

    return "대화 내역이 없습니다.";
}

export function mapChatRoom(raw = {}) {
    return {
        roomId: toId(raw?.roomId ?? raw?.id),
        roomType: toText(raw?.roomType, "INQUIRY_1TO1"),
        status: toText(raw?.status, "ACTIVE"),
        itemId: toId(raw?.itemId),
        campaignId: toId(raw?.campaignId),
        title: toText(raw?.title, "문의 채팅"),
        storeId: toId(raw?.storeId),
        storeName: toText(raw?.storeName, ""),
        itemThumbnailUrl: toText(raw?.itemThumbnailUrl),
        buyerDisplayName: toText(raw?.buyerDisplayName),
        salesChannel: toText(raw?.salesChannel),
        updatedAt: raw?.updatedAt ?? null,
        updatedAtLabel: formatChatRoomTime(raw?.updatedAt),
        lastReadMessageId: toId(raw?.lastReadMessageId),
        unreadCount: toNumber(raw?.unreadCount, 0),
        lastMessageText: extractLastMessageText(raw?.lastMessage),
        participants: Array.isArray(raw?.participants)
            ? raw.participants.map((participant) => ({
                userId: toId(participant?.userId),
                role: toText(participant?.role),
                status: toText(participant?.status),
            }))
            : [],
    };
}

export function mapChatRoomCursorPayload(payload = {}) {
    const items = Array.isArray(payload?.items) ? payload.items : [];

    return {
        items: items.map(mapChatRoom).filter((room) => room.roomId),
        nextCursor: payload?.nextCursor ?? null,
        hasNext: Boolean(payload?.hasNext),
        size: toNumber(payload?.size, items.length),
    };
}

export function mapChatMessage(raw = {}, ownSenderIds = new Set()) {
    const senderId = toId(raw?.senderId);

    return {
        localKey: null,
        roomId: toId(raw?.roomId),
        messageId: toId(raw?.messageId ?? raw?.id),
        clientMessageId: toId(raw?.clientMessageId),
        senderId,
        messageType: toText(raw?.messageType, "CHAT"),
        content: toText(raw?.content),
        createdAt: raw?.createdAt ?? null,
        createdAtLabel: formatDateTimeLabel(raw?.createdAt),
        duplicated: Boolean(raw?.duplicated),
        fromSelf: ownSenderIds.has(senderId),
        deliveryState: "sent",
    };
}

export function mapChatMessageCursorPayload(payload = {}, ownSenderIds = new Set()) {
    const items = Array.isArray(payload?.items) ? payload.items : [];

    return {
        items: items.map((item) => mapChatMessage(item, ownSenderIds)).filter((message) => message.messageId),
        nextCursor: payload?.nextCursor ?? null,
        hasNext: Boolean(payload?.hasNext),
        size: toNumber(payload?.size, items.length),
    };
}

export function flattenChatMessagePages(pages, ownSenderIds = new Set()) {
    if (!Array.isArray(pages)) {
        return [];
    }

    return pages
        .slice()
        .reverse()
        .flatMap((page) => {
            const items = Array.isArray(page?.items) ? page.items : [];

            return [...items]
                .reverse()
                .map((item) => mapChatMessage(item, ownSenderIds))
                .filter((message) => message.messageId);
        });
}

export function parseChatFrame(rawData) {
    if (typeof rawData !== "string") {
        return null;
    }

    try {
        const frame = JSON.parse(rawData);

        if (!frame || typeof frame !== "object") {
            return null;
        }

        return frame;
    } catch {
        return null;
    }
}

export function buildSubscribeRoomFrame(roomId, lastReceivedMessageId) {
    const frame = {
        type: "SUBSCRIBE_ROOM",
        roomId,
    };

    if (lastReceivedMessageId) {
        frame.lastReceivedMessageId = lastReceivedMessageId;
    }

    return frame;
}

export function buildSendMessageFrame({
    roomId,
    clientMessageId,
    content,
    messageType = "CHAT",
    metadata,
}) {
    const frame = {
        type: "SEND_MESSAGE",
        roomId,
        clientMessageId,
        messageType,
        content,
    };

    if (metadata && typeof metadata === "object") {
        frame.metadata = metadata;
    }

    return frame;
}

export function buildReadFrame(roomId, lastReadMessageId) {
    return {
        type: "READ",
        roomId,
        lastReadMessageId,
    };
}

export function buildPingFrame() {
    return { type: "PING" };
}
