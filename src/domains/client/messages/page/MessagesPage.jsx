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
            <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Chat</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900">채팅</h2>
                <p className="mt-2 text-sm text-zinc-600">스토어와의 문의 내역을 확인하고 빠르게 답변받을 수 있습니다.</p>
            </section>

            <Card className="border-zinc-200/80 bg-white/95">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
                        <MessageCircleMore className="h-4 w-4 text-cyan-700" />
                        최근 대화
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {threads.map((thread) => (
                        <div key={thread.store} className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                            <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-zinc-900">{thread.store}</p>
                                <div className="flex items-center gap-2">
                                    {thread.unread > 0 && (
                                        <span className="rounded-full bg-rose-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                                            {thread.unread}
                                        </span>
                                    )}
                                    <span className="text-xs text-zinc-500">{thread.time}</span>
                                </div>
                            </div>
                            <p className="mt-1 text-zinc-600">{thread.lastMessage}</p>
                        </div>
                    ))}

                    <div className="pt-2">
                        <Button className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
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
