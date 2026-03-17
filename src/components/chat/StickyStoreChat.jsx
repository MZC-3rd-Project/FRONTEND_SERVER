import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function StickyStoreChat({ storeName }) {
    const [chatDraft, setChatDraft] = useState("");
    const [chatMessages, setChatMessages] = useState([
        { id: "chat-1", from: "store", text: `안녕하세요! ${storeName} 입니다. 찾는 상품이나 좌석 문의 주시면 바로 도와드릴게요.` },
        { id: "chat-2", from: "user", text: "재고형 상품 재입고 일정이 궁금해요." },
        { id: "chat-3", from: "store", text: "상품별로 다르지만 평균 3~5일 내 입고되고, 재입고 알림도 설정 가능합니다." },
    ]);

    const sendMessage = () => {
        const trimmed = chatDraft.trim();
        if (!trimmed) return;

        const userMessage = {
            id: `chat-user-${Date.now()}`,
            from: "user",
            text: trimmed,
        };
        const storeReply = {
            id: `chat-store-${Date.now() + 1}`,
            from: "store",
            text: "문의 확인했습니다. 담당자가 상세 재고/티켓 상태를 확인해 빠르게 안내드릴게요.",
        };

        setChatMessages((prev) => [...prev, userMessage, storeReply]);
        setChatDraft("");
    };

    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                    <MessageCircle className="h-4 w-4 text-primary" />
                    {storeName} 채팅
                </CardTitle>
                <p className="text-xs text-muted-foreground">문의가 생기면 바로 대화하고, 답변 기록을 확인할 수 있어요.</p>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="max-h-[340px] space-y-2 overflow-y-auto rounded-2xl border border-border bg-muted p-3">
                    {chatMessages.map((message) => (
                        <div
                            key={message.id}
                            className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}
                        >
                            <p
                                className={`max-w-[90%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                                    message.from === "user"
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-card text-foreground"
                                }`}
                            >
                                {message.text}
                            </p>
                        </div>
                    ))}
                </div>

                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={chatDraft}
                        onChange={(event) => setChatDraft(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key === "Enter") sendMessage();
                        }}
                        placeholder="가게에 문의 메시지 보내기"
                        className="h-10 flex-1 rounded-full px-4"
                    />
                    <Button
                        type="button"
                        onClick={sendMessage}
                        className="h-10 rounded-full px-4"
                    >
                        <Send className="h-4 w-4" />
                    </Button>
                </div>

                <div className="rounded-xl border border-border bg-accent/40 px-3 py-2 text-xs text-accent-foreground">
                    지금은 데모 채팅이며, 실제 런칭 시 WebSocket + 알림 연동으로 확장하면 됩니다.
                </div>
            </CardContent>
        </Card>
    );
}

export default StickyStoreChat;