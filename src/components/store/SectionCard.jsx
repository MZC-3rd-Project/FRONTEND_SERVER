import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.js";

export default function SectionCard({ icon: Icon, title, delay = 0, children }) {
    return (
        <Card
            className="reveal-up border-zinc-200/70 bg-white/95 shadow-[0_12px_36px_rgba(15,23,42,0.08)]"
            style={{ animationDelay: `${delay}ms` }}
        >
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm font-bold text-zinc-700">
                    <Icon className="w-4 h-4 text-cyan-600" />
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">{children}</CardContent>
        </Card>
    );
}