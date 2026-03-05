import {Card, CardContent} from "@/components/ui/card.js";

export default function InfoCard({ icon: Icon, label, value, delay = 0 }) {
    return (
        <Card
            className="border-zinc-200/70 bg-white/90 shadow-[0_8px_24px_rgba(15,23,42,0.07)] transition hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(15,23,42,0.1)] reveal-up"
            style={{ animationDelay: `${delay}ms` }}
        >
            <CardContent className="p-5">
                <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-zinc-500 mb-2">
                    <Icon className="w-3.5 h-3.5" />
                    {label}
                </p>
                {value ? (
                    <p className="text-[0.95rem] font-bold text-zinc-900">{value}</p>
                ) : (
                    <p className="text-[0.9rem] font-medium text-zinc-400 italic">미입력</p>
                )}
            </CardContent>
        </Card>
    );
}