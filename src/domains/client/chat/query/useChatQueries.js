import {
    useInfiniteQuery,
    useMutation,
    useQuery,
} from "@tanstack/react-query";

import { shouldRetryRequest } from "@/common/api/queryRetry";
import {
    createInquiryRoom,
    fetchChatMessages,
    fetchMyChatRooms,
    sendChatRoomMessage,
    updateChatReadPointer,
} from "@/domains/client/chat/api/chatApi";
import {
    mapChatMessage,
    mapChatMessageCursorPayload,
    mapChatRoom,
    mapChatRoomCursorPayload,
} from "@/domains/client/chat/lib/chatUtils";

export const chatKeys = {
    all: ["chat"],
    rooms: () => [...chatKeys.all, "rooms"],
    roomList: (params) => [...chatKeys.rooms(), params],
    messages: () => [...chatKeys.all, "messages"],
    roomMessages: (roomId, size) => [...chatKeys.messages(), roomId, size],
};

export function useChatRoomsQuery(params = { size: 20 }) {
    return useQuery({
        queryKey: chatKeys.roomList(params),
        queryFn: async () => {
            const payload = await fetchMyChatRooms(params);
            return mapChatRoomCursorPayload(payload);
        },
        retry: shouldRetryRequest,
        staleTime: 15_000,
    });
}

export function useInfiniteChatMessagesQuery(roomId, size = 50, ownSenderIds = new Set()) {
    return useInfiniteQuery({
        queryKey: chatKeys.roomMessages(roomId, size),
        queryFn: async ({ pageParam }) => {
            const payload = await fetchChatMessages(roomId, {
                cursor: pageParam || undefined,
                size,
            });

            return mapChatMessageCursorPayload(payload, ownSenderIds);
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => (lastPage?.hasNext ? lastPage?.nextCursor : undefined),
        enabled: Boolean(roomId),
        retry: shouldRetryRequest,
        staleTime: 5_000,
    });
}

export function useCreateInquiryRoomMutation() {
    return useMutation({
        mutationFn: async (itemId) => {
            const payload = await createInquiryRoom(itemId);
            return mapChatRoom(payload);
        },
    });
}

export function useSendChatMessageMutation() {
    return useMutation({
        mutationFn: async ({ roomId, payload, ownSenderIds = new Set() }) => {
            const response = await sendChatRoomMessage(roomId, payload);
            return mapChatMessage(
                {
                    ...response,
                    clientMessageId: payload?.clientMessageId,
                },
                ownSenderIds
            );
        },
    });
}

export function useUpdateChatReadPointerMutation() {
    return useMutation({
        mutationFn: async ({ roomId, lastReadMessageId }) => {
            const payload = await updateChatReadPointer(roomId, lastReadMessageId);

            return {
                roomId: payload?.roomId != null ? String(payload.roomId) : "",
                lastReadMessageId: payload?.lastReadMessageId != null ? String(payload.lastReadMessageId) : "",
            };
        },
    });
}
