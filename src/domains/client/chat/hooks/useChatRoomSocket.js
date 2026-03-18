import { useEffect, useRef, useState } from "react";

import {
    buildChatWebSocketUrl,
    buildPingFrame,
    buildReadFrame,
    buildSendMessageFrame,
    buildSubscribeRoomFrame,
    CHAT_HEARTBEAT_INTERVAL_MS,
    CHAT_HEARTBEAT_TIMEOUT_MS,
    mapChatMessage,
    parseChatFrame,
} from "@/domains/client/chat/lib/chatUtils";

function noop() {}

export function useChatRoomSocket({
    roomId,
    lastReceivedMessageId,
    enabled = true,
    onSubscribed = noop,
    onMessageAck = noop,
    onReadAck = noop,
    onRoomMessage = noop,
    onError = noop,
    onPong = noop,
}) {
    const wsRef = useRef(null);
    const reconnectTimerRef = useRef(null);
    const heartbeatTimerRef = useRef(null);
    const reconnectAttemptRef = useRef(0);
    const manualCloseRef = useRef(false);
    const lastReceivedMessageIdRef = useRef(lastReceivedMessageId);
    const lastPongAtRef = useRef(null);
    const handlersRef = useRef({
        onSubscribed,
        onMessageAck,
        onReadAck,
        onRoomMessage,
        onError,
        onPong,
    });

    const [connectionState, setConnectionState] = useState("idle");
    const [lastPongAt, setLastPongAt] = useState(null);
    const [subscribedRoomId, setSubscribedRoomId] = useState("");

    useEffect(() => {
        lastReceivedMessageIdRef.current = lastReceivedMessageId;
    }, [lastReceivedMessageId]);

    useEffect(() => {
        handlersRef.current = {
            onSubscribed,
            onMessageAck,
            onReadAck,
            onRoomMessage,
            onError,
            onPong,
        };
    }, [onSubscribed, onMessageAck, onReadAck, onRoomMessage, onError, onPong]);

    useEffect(() => {
        if (!enabled || !roomId || typeof window === "undefined") {
            return undefined;
        }

        manualCloseRef.current = false;
        let cancelled = false;

        function clearTimers() {
            if (reconnectTimerRef.current) {
                window.clearTimeout(reconnectTimerRef.current);
                reconnectTimerRef.current = null;
            }

            if (heartbeatTimerRef.current) {
                window.clearInterval(heartbeatTimerRef.current);
                heartbeatTimerRef.current = null;
            }
        }

        function closeSocket() {
            const current = wsRef.current;

            if (current) {
                current.onopen = null;
                current.onmessage = null;
                current.onclose = null;
                current.onerror = null;
                current.close();
                wsRef.current = null;
            }
        }

        function scheduleReconnect() {
            if (cancelled || manualCloseRef.current) {
                return;
            }

            const delay = Math.min(1_000 * 2 ** reconnectAttemptRef.current, 5_000);
            reconnectAttemptRef.current += 1;

            reconnectTimerRef.current = window.setTimeout(() => {
                connect();
            }, delay);
        }

        function startHeartbeat() {
            if (heartbeatTimerRef.current) {
                window.clearInterval(heartbeatTimerRef.current);
            }

            heartbeatTimerRef.current = window.setInterval(() => {
                const socket = wsRef.current;

                if (!socket || socket.readyState !== WebSocket.OPEN) {
                    return;
                }

                const lastPong = lastPongAtRef.current ?? Date.now();

                if (Date.now() - lastPong > CHAT_HEARTBEAT_TIMEOUT_MS) {
                    socket.close();
                    return;
                }

                socket.send(JSON.stringify(buildPingFrame()));
            }, CHAT_HEARTBEAT_INTERVAL_MS);
        }

        function connect() {
            if (cancelled) {
                return;
            }

            clearTimers();
            closeSocket();
            setConnectionState("connecting");

            const socket = new WebSocket(buildChatWebSocketUrl());
            wsRef.current = socket;

            socket.onopen = () => {
                reconnectAttemptRef.current = 0;
                setConnectionState("connected");
                lastPongAtRef.current = Date.now();
                setLastPongAt(lastPongAtRef.current);
                startHeartbeat();

                socket.send(
                    JSON.stringify(
                        buildSubscribeRoomFrame(roomId, lastReceivedMessageIdRef.current)
                    )
                );
            };

            socket.onmessage = (event) => {
                const frame = parseChatFrame(event.data);

                if (!frame) {
                    return;
                }

                switch (frame.type) {
                    case "SUBSCRIBED":
                        setSubscribedRoomId(String(frame?.payload?.roomId ?? roomId));
                        setConnectionState("subscribed");
                        handlersRef.current.onSubscribed(frame.payload ?? {});
                        return;
                    case "MESSAGE_ACK":
                        handlersRef.current.onMessageAck({
                            clientMessageId:
                                frame?.payload?.clientMessageId != null
                                    ? String(frame.payload.clientMessageId)
                                    : "",
                            messageId:
                                frame?.payload?.messageId != null
                                    ? String(frame.payload.messageId)
                                    : "",
                            createdAt: frame?.payload?.createdAt ?? null,
                            duplicated: Boolean(frame?.payload?.duplicated),
                        });
                        return;
                    case "READ_ACK":
                        handlersRef.current.onReadAck({
                            roomId:
                                frame?.payload?.roomId != null ? String(frame.payload.roomId) : "",
                            lastReadMessageId:
                                frame?.payload?.lastReadMessageId != null
                                    ? String(frame.payload.lastReadMessageId)
                                    : "",
                        });
                        return;
                    case "ROOM_MESSAGE":
                        handlersRef.current.onRoomMessage(
                            mapChatMessage({
                                roomId,
                                ...frame?.payload,
                            })
                        );
                        return;
                    case "PONG":
                        lastPongAtRef.current = Date.now();
                        setLastPongAt(lastPongAtRef.current);
                        handlersRef.current.onPong();
                        return;
                    case "ERROR":
                        handlersRef.current.onError(frame?.payload ?? {});
                        return;
                    default:
                        return;
                }
            };

            socket.onerror = () => {
                setConnectionState("error");
            };

            socket.onclose = () => {
                setSubscribedRoomId("");
                setConnectionState("disconnected");
                clearTimers();
                wsRef.current = null;

                if (!cancelled && !manualCloseRef.current) {
                    scheduleReconnect();
                }
            };
        }

        connect();

        return () => {
            cancelled = true;
            manualCloseRef.current = true;
            setSubscribedRoomId("");
            clearTimers();
            closeSocket();
        };
    }, [enabled, roomId]);

    function sendJsonFrame(frame) {
        const socket = wsRef.current;

        if (!socket || socket.readyState !== WebSocket.OPEN) {
            return false;
        }

        socket.send(JSON.stringify(frame));
        return true;
    }

    return {
        connectionState,
        isConnected: connectionState === "connected" || connectionState === "subscribed",
        isSubscribed: connectionState === "subscribed",
        lastPongAt,
        subscribedRoomId,
        sendMessage: ({ clientMessageId, content, messageType = "CHAT", metadata }) =>
            sendJsonFrame(
                buildSendMessageFrame({
                    roomId,
                    clientMessageId,
                    content,
                    messageType,
                    metadata,
                })
            ),
        sendRead: (lastReadMessageId) =>
            sendJsonFrame(buildReadFrame(roomId, lastReadMessageId)),
    };
}
