import { Link } from "react-router";
import { ArrowRight, CalendarDays, Clock, MapPin, Pencil, Phone, ShieldCheck, User } from "lucide-react";

import { Button } from "@/components/ui/button.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import AvatarDisplay from "@/components/profile/AvatarDisplay.jsx";
import InfoCard from "@/components/profile/InfoCard.jsx";

// ── Mock data (replace with real API response) ──────────────────────────────
const profile = {
    nickname: "길동이",
    email: "hong@example.com",
    phone: "010-1234-5678",
    delivery: "서울특별시 강남구 테헤란로 123, 456동 789호",
    createdAt: "2024. 03. 12",
    updatedAt: "2025. 01. 08",
    imageUrl: null, // null → placeholder
};

function ProfilePage() {
    return (
        <div className="space-y-5 pb-10 max-w-2xl mx-auto">

            {/* ── Hero Card ─────────────────────────────────────────── */}
            <section className="reveal-up relative overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-white/90 via-zinc-50/80 to-white/70 p-6 sm:p-10 shadow-[0_24px_80px_rgba(31,38,66,0.16)] backdrop-blur">
                {/* blobs */}
                <div className="pointer-events-none absolute -top-24 -right-20 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-300/45 to-indigo-400/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-20 -left-16 h-64 w-64 rounded-full bg-gradient-to-tr from-orange-300/45 to-pink-300/10 blur-3xl" />

                <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-6">
                    <AvatarDisplay imageUrl={profile.imageUrl} />

                    <div className="flex-1 min-w-0 space-y-3">
                        {/* badge */}
                        <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/75 px-3 py-1 text-[11px] font-semibold tracking-wide text-zinc-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                            일반 회원
                        </span>

                        <div>
                            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 leading-tight">
                                {profile.nickname ?? "닉네임 없음"}
                            </h1>
                            <p className="text-sm text-zinc-500 mt-0.5">{profile.email}</p>
                        </div>

                        <Button
                            asChild
                            className="h-9 rounded-full bg-zinc-950 px-5 text-sm font-semibold text-white hover:bg-zinc-800"
                        >
                            <Link to="/my/profile/edit">
                                <Pencil className="w-3.5 h-3.5" />
                                프로필 수정
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* ── Info Grid ─────────────────────────────────────────── */}
            <div className="grid grid-cols-2 gap-4">
                <InfoCard icon={User}  label="닉네임"  value={profile.nickname} delay={90} />
                <InfoCard icon={Phone} label="전화번호" value={profile.phone}    delay={150} />
            </div>

            {/* ── Delivery full-width ────────────────────────────────── */}
            <InfoCard icon={MapPin} label="기본 배송지" value={profile.delivery} delay={210} />
        </div>
    );
}

export default ProfilePage;