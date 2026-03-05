import { Link } from "react-router";
import { ArrowLeft, Camera, MapPin, Phone, Trash2, Upload, User } from "lucide-react";

import { Button } from "@/components/ui/button.js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card.js";
import { Input } from "@/components/ui/input.js";
import FormField from "@/components/profile/edit/FormField.jsx";
import AvatarUpload from "@/components/profile/edit/AvartarUpload.jsx";
import {useState} from "react";


// ── Mock initial data (replace with API / context) ───────────────────────────
const initialProfile = {
    email: "hong@example.com",
    nickname: "길동이",
    phone: "010-1234-5678",
    delivery: "서울특별시 강남구 테헤란로 123, 456동 789호",
    imageUrl: null,
};



function ProfileEditPage() {
    const [form, setForm] = useState(initialProfile);
    const [previewUrl, setPreviewUrl] = useState(initialProfile.imageUrl);
    const [imageFile, setImageFile] = useState(null);

    const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

    const handleImageChange = (dataUrl, file) => {
        setPreviewUrl(dataUrl);
        setImageFile(file);
    };

    const handleImageRemove = () => {
        setPreviewUrl(null);
        setImageFile(null);
    };

    const handleSave = () => {
        const payload = {
            nickname: form.nickname,
            phone: form.phone,
            delivery: form.delivery,
            imageFile, // FormData 로 묶어 PATCH /api/profile 에 전송
        };
        console.log("저장할 데이터:", payload);
        // TODO: API 연동
        alert("프로필이 저장되었습니다.");
    };

    return (
        <div className="space-y-5 pb-10 max-w-2xl mx-auto">

            {/* ── Page Header ───────────────────────────────────────── */}
            <div className="reveal-up flex items-center gap-3">
                <Button
                    asChild
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 flex-shrink-0"
                >
                    <Link to="/my/profile">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div>
                    <p className="text-xs font-semibold text-zinc-500">My Account</p>
                    <h1 className="text-2xl font-black text-zinc-900 leading-tight">프로필 수정</h1>
                </div>
            </div>

            {/* ── Avatar Upload ──────────────────────────────────────── */}
            <section
                className="reveal-up relative overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-white/90 via-zinc-50/80 to-white/70 p-8 shadow-[0_24px_80px_rgba(31,38,66,0.16)] backdrop-blur text-center"
                style={{ animationDelay: "60ms" }}
            >
                <div className="pointer-events-none absolute -top-20 -right-16 h-60 w-60 rounded-full bg-gradient-to-br from-cyan-300/40 to-indigo-400/10 blur-3xl" />
                <div className="relative z-10">
                    <AvatarUpload
                        imageUrl={previewUrl}
                        onImageChange={handleImageChange}
                        onImageRemove={handleImageRemove}
                    />
                </div>
            </section>

            {/* ── Basic Info ────────────────────────────────────────── */}
            <Card
                className="reveal-up border-zinc-200/70 bg-white/95 shadow-[0_12px_36px_rgba(15,23,42,0.08)]"
                style={{ animationDelay: "120ms" }}
            >
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-bold text-zinc-700">
                        <User className="w-4 h-4 text-cyan-600" />
                        기본 정보
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                    <FormField
                        id="email"
                        label="이메일"
                        required
                        hint="이메일은 변경할 수 없습니다."
                    >
                        <Input
                            id="email"
                            type="email"
                            value={form.email}
                            disabled
                            className="h-11 rounded-xl border-zinc-200 bg-zinc-100 text-zinc-500 font-medium cursor-not-allowed"
                        />
                    </FormField>

                    <FormField id="nickname" label="닉네임">
                        <Input
                            id="nickname"
                            type="text"
                            value={form.nickname}
                            onChange={handleChange("nickname")}
                            placeholder="사용할 닉네임을 입력하세요"
                            maxLength={100}
                            className="h-11 rounded-xl border-zinc-200 bg-zinc-50 font-medium focus:border-zinc-400 focus:ring-zinc-200"
                        />
                    </FormField>

                    <FormField id="phone" label="전화번호">
                        <Input
                            id="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange("phone")}
                            placeholder="010-0000-0000"
                            maxLength={15}
                            className="h-11 rounded-xl border-zinc-200 bg-zinc-50 font-medium focus:border-zinc-400 focus:ring-zinc-200"
                        />
                    </FormField>
                </CardContent>
            </Card>

            {/* ── Delivery Info ─────────────────────────────────────── */}
            <Card
                className="reveal-up border-zinc-200/70 bg-white/95 shadow-[0_12px_36px_rgba(15,23,42,0.08)]"
                style={{ animationDelay: "180ms" }}
            >
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-bold text-zinc-700">
                        <MapPin className="w-4 h-4 text-cyan-600" />
                        배송 정보
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <FormField
                        id="delivery"
                        label="기본 배송지"
                        hint="주문 시 기본으로 사용할 배송지입니다."
                    >
                        <Input
                            id="delivery"
                            type="text"
                            value={form.delivery}
                            onChange={handleChange("delivery")}
                            placeholder="기본 배송지 주소를 입력하세요"
                            maxLength={100}
                            className="h-11 rounded-xl border-zinc-200 bg-zinc-50 font-medium focus:border-zinc-400 focus:ring-zinc-200"
                        />
                    </FormField>
                </CardContent>
            </Card>

            {/* ── Action Buttons ────────────────────────────────────── */}
            <div
                className="reveal-up flex gap-3"
                style={{ animationDelay: "240ms" }}
            >
                <Button
                    asChild
                    variant="outline"
                    className="flex-1 h-12 rounded-full border-zinc-300 bg-white text-zinc-700 font-bold hover:bg-zinc-100"
                >
                    <Link to="/profile">취소</Link>
                </Button>
                <Button
                    className="flex-[2] h-12 rounded-full bg-zinc-950 text-white font-bold hover:bg-zinc-800"
                    onClick={handleSave}
                >
                    저장하기
                </Button>
            </div>

        </div>
    );
}

export default ProfileEditPage;