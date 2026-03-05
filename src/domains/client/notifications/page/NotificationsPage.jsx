import { BellRing, CheckCircle2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const notifications = [
    { type: "주문", message: "주문 OD-240225-101이 배송 준비 중입니다.", time: "5분 전" },
    { type: "펀딩", message: "후원한 프로젝트가 목표 금액 80%를 달성했습니다.", time: "19분 전" },
    { type: "쿠폰", message: "이번 주말 한정 10% 할인 쿠폰이 발급되었습니다.", time: "1시간 전" },
    { type: "채팅", message: "스토어에서 고객 문의에 답변이 도착했습니다.", time: "2시간 전" },
];

function NotificationsPage() {
    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Notifications</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900">알림 센터</h2>
                <p className="mt-2 text-sm text-zinc-600">주문, 펀딩, 쿠폰, 채팅 알림을 한곳에서 확인하세요.</p>
            </section>

            <Card className="border-zinc-200/80 bg-white/95">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-base text-zinc-900">
                        <BellRing className="h-4 w-4 text-cyan-700" />
                        최근 알림
                    </CardTitle>
                    <Button variant="outline" className="rounded-full border-zinc-300 bg-white px-4 text-xs text-zinc-700 hover:bg-zinc-100">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        전체 읽음
                    </Button>
                </CardHeader>
                <CardContent className="space-y-2">
                    {notifications.map((notification, idx) => (
                        <div
                            key={`${notification.message}-${idx}`}
                            className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span className="rounded-full border border-zinc-300 bg-white px-2 py-0.5 text-xs text-zinc-700">
                                    {notification.type}
                                </span>
                                <span className="text-xs text-zinc-500">{notification.time}</span>
                            </div>
                            <p className="mt-2 text-zinc-700">{notification.message}</p>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

export default NotificationsPage;
