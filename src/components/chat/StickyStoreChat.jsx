import { useEffect, useMemo, useRef, useState } from "react";
import { LoaderCircle, MessageCircle, RefreshCw, SendHorizonal, TriangleAlert, Wifi, WifiOff } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { isNumericId } from "@/common/utils/id";
import { useChatRoomSocket } from "@/domains/client/chat/hooks/useChatRoomSocket";
import {
    createClientMessageId,
    flattenChatMessagePages,
    readStoredChatSelfSenderIds,
    rememberStoredChatSelfSenderIds,
    resolveSelfSenderIdsFromParticipants,
} from "@/domains/client/chat/lib/chatUtils";
import {
    chatKeys,
    useCreateInquiryRoomMutation,
    useInfiniteChatMessagesQuery,
    useSendChatMessageMutation,
} from "@/domains/client/chat/query/useChatQueries";

function getMessageIdentityKeys(message) {
    const keys = [];

    if (message?.messageId) {
        keys.push(`message:${message.messageId}`);
    }

    if (message?.clientMessageId) {
        keys.push(`client:${message.clientMessageId}`);
    }

    if (message?.localKey) {
        keys.push(`local:${message.localKey}`);
    }

    return keys;
}

function hasSharedIdentity(a, b) {
    const leftKeys = new Set(getMessageIdentityKeys(a));
    return getMessageIdentityKeys(b).some((key) => leftKeys.has(key));
}

function mergeMessageRecord(previousMessage, nextMessage) {
    return {
        ...previousMessage,
        ...nextMessage,
        localKey: nextMessage?.localKey ?? previousMessage?.localKey ?? null,
        clientMessageId: nextMessage?.clientMessageId ?? previousMessage?.clientMessageId ?? "",
        messageId: nextMessage?.messageId ?? previousMessage?.messageId ?? "",
        senderId: nextMessage?.senderId ?? previousMessage?.senderId ?? "",
        fromSelf: Boolean(nextMessage?.fromSelf ?? previousMessage?.fromSelf),
        deliveryState: nextMessage?.deliveryState ?? previousMessage?.deliveryState ?? "sent",
    };
}

function upsertMessage(messages, nextMessage) {
    let matched = false;

    const updatedMessages = messages.map((message) => {
        if (!hasSharedIdentity(message, nextMessage)) {
            return message;
        }

        matched = true;
        return mergeMessageRecord(message, nextMessage);
    });

    if (!matched) {
        updatedMessages.push(nextMessage);
    }

    return updatedMessages;
}

function mergeMessageCollections(historyMessages, liveMessages) {
    return liveMessages.reduce((merged, message) => upsertMessage(merged, message), [...historyMessages]);
}

function buildConnectionBadge(connectionState, hasRoom) {
    if (!hasRoom) {
        return { label: "대화 준비", variant: "secondary", icon: MessageCircle };
    }

    switch (connectionState) {
        case "subscribed":
            return { label: "실시간 연결", variant: "default", icon: Wifi };
        case "connected":
        case "connecting":
            return { label: "연결 중", variant: "secondary", icon: LoaderCircle };
        default:
            return { label: "재연결 중", variant: "secondary", icon: WifiOff };
    }
}

function MessageBubble({ message }) {
    const isOwnMessage = Boolean(message.fromSelf);

    return (
        <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[90%] space-y-1 ${isOwnMessage ? "text-right" : "text-left"}`}>
                <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                        isOwnMessage
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-card text-foreground"
                    }`}
                >
                    {message.content}
                </div>
                <div className="text-[11px] text-muted-foreground">
                    <span>{message.createdAtLabel || "시간 미정"}</span>
                    {isOwnMessage && message.deliveryState === "sending" ? <span> · 전송 중</span> : null}
                    {isOwnMessage && message.deliveryState === "failed" ? <span className="text-destructive"> · 전송 실패</span> : null}
                </div>
            </div>
        </div>
    );
}

function StickyStoreChat({
    storeName,
    itemId,
    helpText = "메시지를 입력하면 기존 문의방을 재사용하거나 새로 만든 뒤, 이 카드 안에서 바로 대화를 이어갑니다.",
    disabledReason = "이 화면은 실제 상품 itemId가 없어 문의 채팅을 시작할 수 없습니다.",
}) {
    const queryClient = useQueryClient();
    const bottomAnchorRef = useRef(null);
    const [draft, setDraft] = useState("");
    const [activeRoom, setActiveRoom] = useState(null);
    const [liveMessageState, setLiveMessageState] = useState({
        roomId: "",
        messages: [],
    });
    const [knownSelfSenderIds, setKnownSelfSenderIds] = useState(() => readStoredChatSelfSenderIds());
    const [runtimeError, setRuntimeError] = useState("");

    const createInquiryRoomMutation = useCreateInquiryRoomMutation();
    const sendMessageMutation = useSendChatMessageMutation();
    const canStartInquiry = isNumericId(itemId);
    const roomId = activeRoom?.roomId ?? "";
    const liveMessages = useMemo(
        () => (liveMessageState.roomId === roomId ? liveMessageState.messages : []),
        [liveMessageState.messages, liveMessageState.roomId, roomId]
    );
    const ownSenderIdSet = useMemo(() => new Set(knownSelfSenderIds), [knownSelfSenderIds]);

    const messagesQuery = useInfiniteChatMessagesQuery(roomId, 50, ownSenderIdSet);
    const historyMessages = useMemo(
        () => flattenChatMessagePages(messagesQuery.data?.pages, ownSenderIdSet),
        [messagesQuery.data?.pages, ownSenderIdSet]
    );
    const latestConfirmedMessageId = useMemo(
        () => [...historyMessages, ...liveMessages].reverse().find((message) => message.messageId)?.messageId ?? "",
        [historyMessages, liveMessages]
    );

    function rememberSelfSenderId(senderId) {
        if (!senderId) {
            return;
        }

        setKnownSelfSenderIds((previousIds) =>
            rememberStoredChatSelfSenderIds(previousIds, [senderId])
        );
    }

    function rememberSelfSenderIds(senderIds) {
        if (!Array.isArray(senderIds) || senderIds.length === 0) {
            return;
        }

        setKnownSelfSenderIds((previousIds) =>
            rememberStoredChatSelfSenderIds(previousIds, senderIds)
        );
    }

    function updateLiveMessages(updater, targetRoomId = roomId) {
        setLiveMessageState((previousState) => {
            const baseMessages =
                previousState.roomId === targetRoomId ? previousState.messages : [];
            const nextMessages =
                typeof updater === "function" ? updater(baseMessages) : updater;

            return {
                roomId: targetRoomId,
                messages: nextMessages,
            };
        });
    }

    function setResolvedRoom(nextRoom) {
        const nextRoomId = String(nextRoom?.roomId ?? "");
        rememberSelfSenderIds(resolveSelfSenderIdsFromParticipants(nextRoom?.participants));

        setActiveRoom(nextRoom ?? null);

        if (nextRoomId !== roomId) {
            setLiveMessageState({
                roomId: nextRoomId,
                messages: [],
            });
        }
    }

    const chatSocket = useChatRoomSocket({
        roomId,
        lastReceivedMessageId: latestConfirmedMessageId,
        enabled: Boolean(roomId),
        onSubscribed: () => {
            setRuntimeError("");
        },
        onRoomMessage: (message) => {
            const fromSelf =
                ownSenderIdSet.has(message.senderId) ||
                liveMessages.some(
                    (candidate) =>
                        candidate.fromSelf &&
                        candidate.messageId &&
                        candidate.messageId === message.messageId
                );

            if (fromSelf) {
                rememberSelfSenderId(message.senderId);
            }

            updateLiveMessages((previousMessages) =>
                upsertMessage(previousMessages, {
                    ...message,
                    fromSelf,
                    deliveryState: "sent",
                })
            );
        },
        onError: (payload) => {
            setRuntimeError(payload?.message ?? "실시간 채팅 연결에 문제가 발생했습니다.");
        },
    });

    const mergedMessages = useMemo(
        () => mergeMessageCollections(historyMessages, liveMessages),
        [historyMessages, liveMessages]
    );
    const connectionBadge = buildConnectionBadge(chatSocket.connectionState, Boolean(roomId));
    const ConnectionIcon = connectionBadge.icon;

    useEffect(() => {
        bottomAnchorRef.current?.scrollIntoView({ block: "end" });
    }, [mergedMessages.length, roomId]);

    async function ensureRoom() {
        if (activeRoom?.roomId) {
            return activeRoom;
        }

        const room = await createInquiryRoomMutation.mutateAsync(itemId);
        setResolvedRoom(room);
        await queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
        return room;
    }

    async function bootstrapConversation({ forceRefresh = false } = {}) {
        if (!canStartInquiry) {
            return null;
        }

        setRuntimeError("");

        const hadActiveRoom = Boolean(activeRoom?.roomId);
        const room = await ensureRoom();

        if (forceRefresh && hadActiveRoom && room?.roomId) {
            await messagesQuery.refetch();
        }

        return room;
    }

    async function handleRefreshConversation() {
        if (!canStartInquiry || createInquiryRoomMutation.isPending) {
            return;
        }

        try {
            await bootstrapConversation({ forceRefresh: true });
        } catch (error) {
            setRuntimeError(error?.message ?? "대화방을 불러오지 못했습니다.");
        }
    }

    async function handleFocusComposer() {
        if (!canStartInquiry || activeRoom?.roomId || createInquiryRoomMutation.isPending) {
            return;
        }

        try {
            await bootstrapConversation();
        } catch (error) {
            setRuntimeError(error?.message ?? "대화방을 준비하지 못했습니다.");
        }
    }

    async function handleSendMessage() {
        const content = draft.trim();

        if (!content || !canStartInquiry) {
            return;
        }

        setRuntimeError("");

        let resolvedRoom = activeRoom;

        try {
            if (!resolvedRoom?.roomId) {
                resolvedRoom = await bootstrapConversation();
            }
        } catch (error) {
            setRuntimeError(error?.message ?? "문의방을 만들지 못했습니다.");
            return;
        }

        if (!resolvedRoom?.roomId) {
            setRuntimeError("문의방 정보를 확인하지 못했습니다.");
            return;
        }

        const clientMessageId = createClientMessageId();
        const optimisticMessage = {
            localKey: clientMessageId,
            roomId: resolvedRoom.roomId,
            messageId: "",
            clientMessageId,
            senderId: "",
            messageType: "CHAT",
            content,
            createdAt: new Date().toISOString(),
            createdAtLabel: "방금",
            fromSelf: true,
            deliveryState: "sending",
        };

        setLiveMessageState((previousState) => {
            const baseMessages =
                previousState.roomId === resolvedRoom.roomId ? previousState.messages : [];

            return {
                roomId: resolvedRoom.roomId,
                messages: upsertMessage(baseMessages, optimisticMessage),
            };
        });
        setDraft("");

        try {
            const sentMessage = await sendMessageMutation.mutateAsync({
                roomId: resolvedRoom.roomId,
                payload: {
                    clientMessageId,
                    messageType: "CHAT",
                    content,
                    metadata: {
                        source: "sticky-store-chat",
                    },
                },
                ownSenderIds: ownSenderIdSet,
            });

            rememberSelfSenderId(sentMessage.senderId);
            updateLiveMessages((previousMessages) =>
                upsertMessage(previousMessages, {
                    ...sentMessage,
                    localKey: clientMessageId,
                    clientMessageId,
                    fromSelf: true,
                    deliveryState: "sent",
                })
            , resolvedRoom.roomId);
            await queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
        } catch (error) {
            updateLiveMessages((previousMessages) =>
                previousMessages.map((message) =>
                    message.clientMessageId === clientMessageId
                        ? {
                            ...message,
                            deliveryState: "failed",
                        }
                        : message
                )
            , resolvedRoom.roomId);
            setRuntimeError(error?.message ?? "메시지를 전송하지 못했습니다.");
        }
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <MessageCircle className="h-4 w-4 text-primary" />
                            {storeName} 문의 채팅
                        </CardTitle>
                        <p className="mt-1 text-xs text-muted-foreground">{helpText}</p>
                    </div>
                    <Badge variant={connectionBadge.variant} className="gap-1.5 rounded-full px-3 py-1">
                        <ConnectionIcon
                            className={`h-3.5 w-3.5 ${chatSocket.connectionState === "connecting" ? "animate-spin" : ""}`}
                        />
                        {connectionBadge.label}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {!canStartInquiry ? (
                    <div className="rounded-xl border border-border bg-accent/40 px-3 py-2 text-xs text-accent-foreground">
                        <p className="inline-flex items-center gap-1.5 font-medium">
                            <TriangleAlert className="h-3.5 w-3.5" />
                            {disabledReason}
                        </p>
                    </div>
                ) : null}

                {runtimeError ? (
                    <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                        {runtimeError}
                    </div>
                ) : null}

                <div className="flex h-[320px] flex-col rounded-2xl border border-border bg-muted/40">
                    <div className="flex items-center justify-between border-b border-border px-4 py-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                            Conversation
                        </p>
                        <div className="flex items-center gap-2">
                            {roomId && messagesQuery.hasNextPage ? (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => messagesQuery.fetchNextPage()}
                                    disabled={messagesQuery.isFetchingNextPage}
                                    className="rounded-full"
                                >
                                    {messagesQuery.isFetchingNextPage ? "불러오는 중" : "이전 메시지"}
                                </Button>
                            ) : null}
                            {roomId ? (
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="rounded-full"
                                    onClick={() => {
                                        void handleRefreshConversation();
                                    }}
                                    disabled={!canStartInquiry || createInquiryRoomMutation.isPending || messagesQuery.isFetching}
                                >
                                    <RefreshCw
                                        className={`h-3.5 w-3.5 ${
                                            createInquiryRoomMutation.isPending || messagesQuery.isFetching ? "animate-spin" : ""
                                        }`}
                                    />
                                    새로고침
                                </Button>
                            ) : null}
                        </div>
                    </div>

                    <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                        {(createInquiryRoomMutation.isPending || messagesQuery.isLoading) && !mergedMessages.length ? (
                            Array.from({ length: 4 }).map((_, index) => (
                                <div
                                    key={`chat-skeleton-${index}`}
                                    className={`h-14 animate-pulse rounded-2xl bg-muted ${index % 2 === 0 ? "ml-auto w-2/3" : "w-3/4"}`}
                                />
                            ))
                        ) : null}

                        {!createInquiryRoomMutation.isPending && !messagesQuery.isLoading && mergedMessages.length === 0 ? (
                            <div className="grid h-full place-items-center text-center">
                                <div className="space-y-2">
                                    <p className="text-sm font-semibold text-foreground">이 카드 안에서 바로 문의할 수 있습니다</p>
                                    <p className="max-w-[240px] text-xs leading-relaxed text-muted-foreground">
                                        입력창에 커서를 두거나 바로 메시지를 보내면 기존 문의방을 찾고, 없으면 새로 만든 뒤 대화를 이어갑니다.
                                    </p>
                                </div>
                            </div>
                        ) : null}

                        {mergedMessages.map((message) => (
                            <MessageBubble
                                key={message.messageId || message.clientMessageId || message.localKey}
                                message={message}
                            />
                        ))}

                        <div ref={bottomAnchorRef} />
                    </div>
                </div>

                <div className="space-y-3 rounded-2xl border border-border bg-background p-3">
                    <Textarea
                        value={draft}
                        onChange={(event) => setDraft(event.target.value)}
                        onFocus={() => {
                            void handleFocusComposer();
                        }}
                        placeholder={canStartInquiry ? "스토어에 문의 메시지를 입력하세요" : "현재 화면에서는 채팅을 시작할 수 없습니다"}
                        className="min-h-[96px] resize-none border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
                        disabled={!canStartInquiry || createInquiryRoomMutation.isPending || sendMessageMutation.isPending}
                        onKeyDown={(event) => {
                            if (event.key === "Enter" && !event.shiftKey) {
                                event.preventDefault();
                                void handleSendMessage();
                            }
                        }}
                    />

                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground">
                            Enter로 전송, Shift+Enter로 줄바꿈합니다.
                        </p>
                        <Button
                            type="button"
                            onClick={() => {
                                void handleSendMessage();
                            }}
                            disabled={!canStartInquiry || !draft.trim() || createInquiryRoomMutation.isPending || sendMessageMutation.isPending}
                            className="rounded-full px-4"
                        >
                            {createInquiryRoomMutation.isPending || sendMessageMutation.isPending ? (
                                <LoaderCircle className="h-4 w-4 animate-spin" />
                            ) : (
                                <SendHorizonal className="h-4 w-4" />
                            )}
                            보내기
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

export default StickyStoreChat;
