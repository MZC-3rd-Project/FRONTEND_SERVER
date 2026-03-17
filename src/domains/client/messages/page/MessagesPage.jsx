import { MessageCircleMore, SendHorizonal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const threads = [
    {
        store: "NOVA LIVE STAGE",
        lastMessage: "티켓 배송은 공연 2일 전에 일괄 발송됩니다.",
        unread: 2,
        time: "방금",
    },
    {
        store: "URBAN FIT LAB",
        lastMessage: "사이즈 교환은 배송 완료 후 7일 이내 가능합니다.",
        unread: 0,
        time: "24분 전",
    },
    {
        store: "MIZU SHOP",
        lastMessage: "요청하신 컬러는 다음 주 재입고 예정입니다.",
        unread: 1,
        time: "1시간 전",
    },
];

function MessagesPage() {
    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Chat</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">채팅</h2>
                <p className="mt-2 text-sm text-muted-foreground">스토어와의 문의 내역을 확인하고 빠르게 답변받을 수 있습니다.</p>
            </section>

            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                        <MessageCircleMore className="h-4 w-4 text-primary" />
                        최근 대화
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {threads.map((thread) => (
                        <div key={thread.store} className="rounded-xl border border-border bg-muted px-4 py-3 text-sm">
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-foreground">{thread.store}</p>
                                <div className="flex items-center gap-2">
                                    {thread.unread > 0 && (
                                        <span className="rounded-full bg-destructive px-2 py-0.5 text-[11px] font-semibold text-destructive-foreground">
                                            {thread.unread}
                                        </span>
                                    )}
                                    <span className="text-xs text-muted-foreground">{thread.time}</span>
                                </div>
                            </div>
                            <p className="mt-1 text-muted-foreground">{thread.lastMessage}</p>
                        </div>
                    ))}

                    <div className="pt-2">
                        <Button className="rounded-full px-5">
                            <SendHorizonal className="h-4 w-4" />
                            새 문의 시작
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default MessagesPage;
