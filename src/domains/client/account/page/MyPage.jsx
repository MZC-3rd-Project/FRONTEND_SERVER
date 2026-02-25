import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const activities = [
    "후원한 펀딩 3건 업데이트 확인",
    "배송중 주문 2건",
    "보유 쿠폰 5장",
];

function MyPage() {
    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">My Page</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900">내 활동</h2>
                <p className="mt-2 text-sm text-zinc-600">주문, 후원, 쿠폰 상태를 한 번에 확인할 수 있습니다.</p>
            </section>

            <Card className="border-zinc-200/80 bg-white/95">
                <CardHeader>
                    <CardTitle className="text-base text-zinc-900">요약</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-zinc-600">
                    {activities.map((activity) => (
                        <div key={activity} className="rounded-xl border border-zinc-200 px-4 py-3">
                            {activity}
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}

export default MyPage;
