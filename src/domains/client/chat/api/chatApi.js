import { axiosInstance } from "@/common/api/apiInstacne";
import { normalizeApiError, unwrapApiResponseBody } from "@/common/api/responseUtils";
import { encodeIdPathSegment, toIdString } from "@/common/utils/id";

export async function createInquiryRoom(itemId) {
    try {
        const response = await axiosInstance.post("/v1/chat/rooms/inquiries", {
            itemId: toIdString(itemId),
        });

        return unwrapApiResponseBody(response, "문의 채팅방을 열지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "문의 채팅방 생성에 실패했습니다.");
    }
}

export async function fetchMyChatRooms({ cursor, size = 20 } = {}) {
    try {
        const response = await axiosInstance.get("/v1/chat/rooms", {
            params: {
                cursor: cursor || undefined,
                size,
            },
        });

        return unwrapApiResponseBody(response, "채팅방 목록을 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "채팅방 목록 조회에 실패했습니다.");
    }
}

export async function fetchChatMessages(roomId, { cursor, size = 50 } = {}) {
    try {
        const response = await axiosInstance.get(`/v1/chat/rooms/${encodeIdPathSegment(roomId)}/messages`, {
            params: {
                cursor: cursor || undefined,
                size,
            },
        });

        return unwrapApiResponseBody(response, "메시지 목록을 불러오지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "메시지 목록 조회에 실패했습니다.");
    }
}

export async function sendChatRoomMessage(roomId, payload) {
    try {
        const response = await axiosInstance.post(
            `/v1/chat/rooms/${encodeIdPathSegment(roomId)}/messages`,
            payload
        );

        return unwrapApiResponseBody(response, "메시지를 전송하지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "메시지 전송에 실패했습니다.");
    }
}

export async function updateChatReadPointer(roomId, lastReadMessageId) {
    try {
        const response = await axiosInstance.post(`/v1/chat/rooms/${encodeIdPathSegment(roomId)}/read`, {
            lastReadMessageId: toIdString(lastReadMessageId),
        });

        return unwrapApiResponseBody(response, "읽음 상태를 갱신하지 못했습니다.");
    } catch (error) {
        throw normalizeApiError(error, "읽음 상태 갱신에 실패했습니다.");
    }
}
