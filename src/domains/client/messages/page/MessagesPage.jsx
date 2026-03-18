import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
    AlertCircle,
    LoaderCircle,
    MessageCircleMore,
    RefreshCw,
    SendHorizonal,
    Wifi,
    WifiOff,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty.tsx";
import { Textarea } from "@/components/ui/textarea";
import { chatKeys, useChatRoomsQuery, useInfiniteChatMessagesQuery, useSendChatMessageMutation, useUpdateChatReadPointerMutation } from "@/domains/client/chat/query/useChatQueries";
import { createClientMessageId, flattenChatMessagePages } from "@/domains/client/chat/lib/chatUtils";
import { useChatRoomSocket } from "@/domains/client/chat/hooks/useChatRoomSocket";

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

function buildConnectionBadge(connectionState) {
    switch (connectionState) {
        case "subscribed":
            return { label: "실시간 연결", variant: "default", icon: Wifi };
        case "connected":
            return { label: "구독 대기", variant: "secondary", icon: Wifi };
        case "connecting":
            return { label: "연결 중", variant: "secondary", icon: LoaderCircle };
        default:
            return { label: "재연결 중", variant: "secondary", icon: WifiOff };
    }
}

function getRoomLabel(room) {
    return room?.storeName || room?.title || "문의 채팅";
}

function MessageBubble({ message }) {
    const isOwnMessage = Boolean(message.fromSelf);

    return (
        <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] space-y-1 ${isOwnMessage ? "items-end text-right" : "items-start text-left"}`}>
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

function MessagesPage() {
    const queryClient = useQueryClient();
    const [searchParams, setSearchParams] = useSearchParams();
    const [draftState, setDraftState] = useState({ roomId: "", value: "" });
    const [liveMessageState, setLiveMessageState] = useState({ roomId: "", messages: [] });
    const [knownSelfSenderIds, setKnownSelfSenderIds] = useState([]);
    const bottomAnchorRef = useRef(null);
    const lastReadMessageIdRef = useRef("");

    const selectedRoomId = searchParams.get("roomId") ?? "";
    const ownSenderIdSet = useMemo(() => new Set(knownSelfSenderIds), [knownSelfSenderIds]);
    const draft = draftState.roomId === selectedRoomId ? draftState.value : "";
    const liveMessages = useMemo(
        () => (liveMessageState.roomId === selectedRoomId ? liveMessageState.messages : []),
        [liveMessageState.messages, liveMessageState.roomId, selectedRoomId]
    );

    const roomsQuery = useChatRoomsQuery({ size: 20 });
    const sendMessageMutation = useSendChatMessageMutation();
    const { mutateAsync: updateReadPointer } = useUpdateChatReadPointerMutation();

    const rooms = useMemo(() => roomsQuery.data?.items ?? [], [roomsQuery.data?.items]);
    const selectedRoom = useMemo(
        () => rooms.find((room) => room.roomId === selectedRoomId) ?? null,
        [rooms, selectedRoomId]
    );

    const messagesQuery = useInfiniteChatMessagesQuery(selectedRoomId, 50, ownSenderIdSet);
    const historyMessages = useMemo(
        () => flattenChatMessagePages(messagesQuery.data?.pages, ownSenderIdSet),
        [messagesQuery.data?.pages, ownSenderIdSet]
    );
    const mergedMessages = useMemo(
        () => mergeMessageCollections(historyMessages, liveMessages),
        [historyMessages, liveMessages]
    );
    const latestConfirmedMessageId = useMemo(
        () => [...mergedMessages].reverse().find((message) => message.messageId)?.messageId ?? "",
        [mergedMessages]
    );

    function rememberSelfSenderId(senderId) {
        if (!senderId) {
            return;
        }

        setKnownSelfSenderIds((previousIds) =>
            previousIds.includes(senderId) ? previousIds : [...previousIds, senderId]
        );
    }

    const invalidateRooms = useCallback(async () => {
        await queryClient.invalidateQueries({ queryKey: chatKeys.rooms() });
    }, [queryClient]);

    function setDraftForSelectedRoom(nextDraft) {
        setDraftState({
            roomId: selectedRoomId,
            value: nextDraft,
        });
    }

    function updateLiveMessages(updater) {
        setLiveMessageState((previousState) => {
            const previousMessages =
                previousState.roomId === selectedRoomId ? previousState.messages : [];
            const nextMessages =
                typeof updater === "function" ? updater(previousMessages) : updater;

            return {
                roomId: selectedRoomId,
                messages: nextMessages,
            };
        });
    }

    async function commitRead(lastReadMessageId) {
        if (!selectedRoomId || !lastReadMessageId || lastReadMessageIdRef.current === lastReadMessageId) {
            return;
        }

        lastReadMessageIdRef.current = lastReadMessageId;
        const didSendThroughSocket = sendSocketRead(lastReadMessageId);

        if (didSendThroughSocket) {
            return;
        }

        try {
            await updateReadPointer({
                roomId: selectedRoomId,
                lastReadMessageId,
            });
            await invalidateRooms();
        } catch {
            lastReadMessageIdRef.current = "";
        }
    }

    const chatSocket = useChatRoomSocket({
        roomId: selectedRoomId,
        lastReceivedMessageId: latestConfirmedMessageId,
        enabled: Boolean(selectedRoomId),
        onSubscribed: () => {
            if (!document.hidden && latestConfirmedMessageId) {
                void commitRead(latestConfirmedMessageId);
            }
        },
        onMessageAck: (payload) => {
            updateLiveMessages((previousMessages) =>
                previousMessages.map((message) =>
                    message.clientMessageId === payload.clientMessageId
                        ? {
                            ...message,
                            messageId: payload.messageId || message.messageId,
                            createdAt: payload.createdAt || message.createdAt,
                            createdAtLabel: payload.createdAt || message.createdAtLabel,
                            deliveryState: payload.duplicated ? "sent" : "sent",
                        }
                        : message
                )
            );
        },
        onReadAck: async ({ lastReadMessageId }) => {
            lastReadMessageIdRef.current = lastReadMessageId;
            await invalidateRooms();
        },
        onRoomMessage: async (message) => {
            const fromSelf = ownSenderIdSet.has(message.senderId) || liveMessages.some(
                (candidate) => candidate.messageId && candidate.messageId === message.messageId && candidate.fromSelf
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

            if (!document.hidden && message.messageId) {
                void commitRead(message.messageId);
            }

            await invalidateRooms();
        },
        onError: ({ message }) => {
            if (!message) {
                return;
            }

            updateLiveMessages((previousMessages) => [
                ...previousMessages,
                {
                    localKey: `system-${Date.now()}`,
                    roomId: selectedRoomId,
                    messageId: "",
                    clientMessageId: "",
                    senderId: "",
                    messageType: "SYSTEM",
                    content: `실시간 채팅 오류: ${message}`,
                    createdAt: new Date().toISOString(),
                    createdAtLabel: "시스템",
                    fromSelf: false,
                    deliveryState: "sent",
                },
            ]);
        },
    });
    const sendSocketMessage = chatSocket.sendMessage;
    const sendSocketRead = chatSocket.sendRead;

    useEffect(() => {
        if (selectedRoomId || !rooms[0]?.roomId) {
            return;
        }

        const nextSearchParams = new URLSearchParams(searchParams);
        nextSearchParams.set("roomId", rooms[0].roomId);
        setSearchParams(nextSearchParams, { replace: true });
    }, [rooms, searchParams, selectedRoomId, setSearchParams]);

    useEffect(() => {
        lastReadMessageIdRef.current = "";
    }, [selectedRoomId]);

    useEffect(() => {
        bottomAnchorRef.current?.scrollIntoView({ block: "end" });
    }, [mergedMessages.length, selectedRoomId]);

    useEffect(() => {
        if (!selectedRoomId) {
            return undefined;
        }

        async function syncReadState() {
            if (!document.hidden && latestConfirmedMessageId) {
                if (lastReadMessageIdRef.current === latestConfirmedMessageId) {
                    return;
                }

                lastReadMessageIdRef.current = latestConfirmedMessageId;
                const didSendThroughSocket = sendSocketRead(latestConfirmedMessageId);

                if (didSendThroughSocket) {
                    return;
                }

                try {
                    await updateReadPointer({
                        roomId: selectedRoomId,
                        lastReadMessageId: latestConfirmedMessageId,
                    });
                    await invalidateRooms();
                } catch {
                    lastReadMessageIdRef.current = "";
                }
            }
        }

        window.addEventListener("focus", syncReadState);
        document.addEventListener("visibilitychange", syncReadState);

        return () => {
            window.removeEventListener("focus", syncReadState);
            document.removeEventListener("visibilitychange", syncReadState);
        };
    }, [invalidateRooms, latestConfirmedMessageId, selectedRoomId, sendSocketRead, updateReadPointer]);

    async function handleSendMessage() {
        const content = draft.trim();

        if (!content || !selectedRoomId) {
            return;
        }

        const clientMessageId = createClientMessageId();
        const optimisticMessage = {
            localKey: clientMessageId,
            roomId: selectedRoomId,
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

        updateLiveMessages((previousMessages) => upsertMessage(previousMessages, optimisticMessage));
        setDraftForSelectedRoom("");

        const didSendThroughSocket = sendSocketMessage({
            clientMessageId,
            content,
            messageType: "CHAT",
            metadata: {
                source: "chat-room",
            },
        });

        if (didSendThroughSocket) {
            return;
        }

        try {
            const sentMessage = await sendMessageMutation.mutateAsync({
                roomId: selectedRoomId,
                payload: {
                    clientMessageId,
                    messageType: "CHAT",
                    content,
                    metadata: {
                        source: "chat-room",
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
            );
            await invalidateRooms();
        } catch {
            updateLiveMessages((previousMessages) =>
                previousMessages.map((message) =>
                    message.clientMessageId === clientMessageId
                        ? {
                            ...message,
                            deliveryState: "failed",
                        }
                        : message
                )
            );
        }
    }

    const connectionBadge = buildConnectionBadge(chatSocket.connectionState);
    const ConnectionIcon = connectionBadge.icon;

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Chat</p>
                        <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">채팅</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            문의방 목록과 실시간 대화를 한 화면에서 확인합니다. 신규 문의는 상품 상세에서 시작합니다.
                        </p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="rounded-full"
                        onClick={() => {
                            void roomsQuery.refetch();
                            if (selectedRoomId) {
                                void messagesQuery.refetch();
                            }
                        }}
                        disabled={roomsQuery.isFetching || messagesQuery.isFetching}
                    >
                        <RefreshCw
                            className={`h-4 w-4 ${(roomsQuery.isFetching || messagesQuery.isFetching) ? "animate-spin" : ""}`}
                        />
                        새로고침
                    </Button>
                </div>
            </section>

            {roomsQuery.isError ? (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>{roomsQuery.error?.status === 401 ? "로그인이 필요합니다" : "채팅방을 불러오지 못했습니다"}</AlertTitle>
                    <AlertDescription className="mt-2 flex flex-wrap items-center gap-2">
                        <span>{roomsQuery.error?.message ?? "잠시 후 다시 시도해 주세요."}</span>
                        {roomsQuery.error?.status === 401 ? (
                            <Button asChild type="button" size="sm" variant="outline">
                                <Link to="/auth/login">로그인하러 가기</Link>
                            </Button>
                        ) : null}
                        <Button type="button" size="sm" variant="outline" onClick={() => roomsQuery.refetch()}>
                            다시 시도
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : null}

            {!roomsQuery.isError ? (
                <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
                    <Card className="border-border bg-card">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <MessageCircleMore className="h-4 w-4 text-primary" />
                                최근 대화
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {roomsQuery.isLoading ? (
                                Array.from({ length: 4 }).map((_, index) => (
                                    <div key={`chat-room-skeleton-${index}`} className="h-20 animate-pulse rounded-2xl bg-muted" />
                                ))
                            ) : null}

                            {!roomsQuery.isLoading && rooms.length === 0 ? (
                                <Empty className="rounded-2xl border border-border bg-muted/40 p-6">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <MessageCircleMore className="size-5" />
                                        </EmptyMedia>
                                        <EmptyTitle>문의 내역이 없습니다</EmptyTitle>
                                        <EmptyDescription>
                                            판매, 펀딩, 핫딜 상세에서 문의하기를 누르면 채팅방이 생성됩니다.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                    <EmptyContent>
                                        <Button asChild variant="outline" className="rounded-full">
                                            <Link to="/funding">상품 보러 가기</Link>
                                        </Button>
                                    </EmptyContent>
                                </Empty>
                            ) : null}

                            {!roomsQuery.isLoading && rooms.length > 0 ? (
                                rooms.map((room) => {
                                    const isSelected = room.roomId === selectedRoomId;
                                    const roomLabel = getRoomLabel(room);

                                    return (
                                        <button
                                            key={room.roomId}
                                            type="button"
                                            onClick={() => {
                                                const nextSearchParams = new URLSearchParams(searchParams);
                                                nextSearchParams.set("roomId", room.roomId);
                                                setSearchParams(nextSearchParams);
                                            }}
                                            className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
                                                isSelected
                                                    ? "border-primary bg-primary/10"
                                                    : "border-border bg-muted/40 hover:border-primary/40 hover:bg-accent/50"
                                            }`}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="font-semibold text-foreground">{roomLabel}</p>
                                                <div className="flex items-center gap-2">
                                                    {room.unreadCount > 0 ? (
                                                        <span className="rounded-full bg-destructive px-2 py-0.5 text-[11px] font-semibold text-destructive-foreground">
                                                            {room.unreadCount}
                                                        </span>
                                                    ) : null}
                                                    <span className="text-xs text-muted-foreground">{room.updatedAtLabel}</span>
                                                </div>
                                            </div>
                                            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{room.lastMessageText}</p>
                                        </button>
                                    );
                                })
                            ) : null}
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card">
                        <CardHeader className="border-b border-border pb-4">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <CardTitle className="text-base text-foreground">
                                        {selectedRoom ? getRoomLabel(selectedRoom) : "대화를 선택하세요"}
                                    </CardTitle>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {selectedRoom
                                            ? selectedRoom.title || "실시간 메시지는 WebSocket으로 동기화됩니다."
                                            : "좌측 목록에서 채팅방을 선택하면 메시지를 불러옵니다."}
                                    </p>
                                </div>
                                <Badge variant={connectionBadge.variant} className="gap-1.5 rounded-full px-3 py-1">
                                    <ConnectionIcon
                                        className={`h-3.5 w-3.5 ${chatSocket.connectionState === "connecting" ? "animate-spin" : ""}`}
                                    />
                                    {connectionBadge.label}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4 p-4">
                            {!selectedRoomId ? (
                                <Empty className="min-h-[420px] rounded-2xl border border-border bg-muted/30">
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <MessageCircleMore className="size-5" />
                                        </EmptyMedia>
                                        <EmptyTitle>대화방을 선택하세요</EmptyTitle>
                                        <EmptyDescription>
                                            최근 대화 목록에서 방을 선택하면 기존 메시지와 실시간 응답을 확인할 수 있습니다.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            ) : null}

                            {selectedRoomId && messagesQuery.isError ? (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle>메시지 목록을 불러오지 못했습니다</AlertTitle>
                                    <AlertDescription className="mt-2 flex flex-wrap items-center gap-2">
                                        <span>{messagesQuery.error?.message ?? "잠시 후 다시 시도해 주세요."}</span>
                                        <Button type="button" size="sm" variant="outline" onClick={() => messagesQuery.refetch()}>
                                            다시 시도
                                        </Button>
                                    </AlertDescription>
                                </Alert>
                            ) : null}

                            {selectedRoomId && !messagesQuery.isError ? (
                                <>
                                    <div className="flex h-[480px] flex-col rounded-2xl border border-border bg-muted/30">
                                        <div className="border-b border-border px-4 py-2">
                                            <div className="flex items-center justify-between gap-2">
                                                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                                                    Conversation
                                                </p>
                                                {messagesQuery.hasNextPage ? (
                                                    <Button
                                                        type="button"
                                                        size="sm"
                                                        variant="ghost"
                                                        onClick={() => messagesQuery.fetchNextPage()}
                                                        disabled={messagesQuery.isFetchingNextPage}
                                                        className="rounded-full"
                                                    >
                                                        {messagesQuery.isFetchingNextPage ? (
                                                            <>
                                                                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                                                이전 메시지 불러오는 중
                                                            </>
                                                        ) : (
                                                            "이전 메시지 더 보기"
                                                        )}
                                                    </Button>
                                                ) : null}
                                            </div>
                                        </div>

                                        <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                                            {messagesQuery.isLoading ? (
                                                Array.from({ length: 5 }).map((_, index) => (
                                                    <div
                                                        key={`message-skeleton-${index}`}
                                                        className={`h-14 animate-pulse rounded-2xl bg-muted ${index % 2 === 0 ? "ml-auto w-2/3" : "w-3/4"}`}
                                                    />
                                                ))
                                            ) : null}

                                            {!messagesQuery.isLoading && mergedMessages.length === 0 ? (
                                                <div className="grid h-full place-items-center">
                                                    <div className="max-w-sm text-center">
                                                        <p className="text-sm font-semibold text-foreground">아직 메시지가 없습니다</p>
                                                        <p className="mt-1 text-sm text-muted-foreground">
                                                            첫 메시지를 보내면 이 방에서 실시간으로 대화를 이어갈 수 있습니다.
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : null}

                                            {!messagesQuery.isLoading
                                                ? mergedMessages.map((message) => (
                                                    <MessageBubble
                                                        key={message.messageId || message.clientMessageId || message.localKey}
                                                        message={message}
                                                    />
                                                ))
                                                : null}

                                            <div ref={bottomAnchorRef} />
                                        </div>
                                    </div>

                                    <div className="space-y-3 rounded-2xl border border-border bg-background p-3">
                                        <Textarea
                                            value={draft}
                                            onChange={(event) => setDraftForSelectedRoom(event.target.value)}
                                            placeholder="메시지를 입력하세요"
                                            className="min-h-[96px] resize-none border-0 bg-transparent px-0 py-0 shadow-none focus-visible:ring-0"
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
                                                className="rounded-full px-4"
                                                onClick={() => {
                                                    void handleSendMessage();
                                                }}
                                                disabled={!draft.trim() || sendMessageMutation.isPending}
                                            >
                                                {sendMessageMutation.isPending ? (
                                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <SendHorizonal className="h-4 w-4" />
                                                )}
                                                보내기
                                            </Button>
                                        </div>
                                    </div>
                                </>
                            ) : null}
                        </CardContent>
                    </Card>
                </div>
            ) : null}
        </div>
    );
}

export default MessagesPage;
