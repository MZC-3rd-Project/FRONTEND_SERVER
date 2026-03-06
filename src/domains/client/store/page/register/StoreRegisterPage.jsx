import { useRef, useState } from "react";
import { Link } from "react-router";
import {
    ArrowLeft, Building2, FileText, Image, ImagePlus,
    Mail, MapPin, Phone, Plus, Trash2, Upload, X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

// ── Constants ─────────────────────────────────────────────────────────────────
const ADDRESS_TYPES = [
    { value: "MAIN",      label: "본점 주소",   required: true  },
    { value: "PICKUP",    label: "픽업 주소",   required: false },
    { value: "RETURN",    label: "반품 주소",   required: false },
    { value: "WAREHOUSE", label: "창고 주소",   required: false },
];

const IMAGE_TYPES = [
    { value: "THUMBNAIL", label: "썸네일",   desc: "가게 목록에 표시되는 대표 이미지",  maxCount: 1  },
    { value: "BANNER",    label: "배너",     desc: "가게 상단에 표시되는 와이드 이미지", maxCount: 3  },
    { value: "INTRODUCE", label: "소개 이미지", desc: "가게 소개 섹션 이미지",           maxCount: 5  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function makeid() {
    return Math.random().toString(36).slice(2, 9);
}

// ── Sub-components ────────────────────────────────────────────────────────────
function SectionCard({ icon: Icon, title, delay = 0, children }) {
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

function FormField({ id, label, required, hint, children }) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id} className="text-xs font-semibold text-zinc-600">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </Label>
            {children}
            {hint && <p className="text-[11px] text-zinc-400">{hint}</p>}
        </div>
    );
}

// ── Image Upload Block ────────────────────────────────────────────────────────
function ImageUploadBlock({ type, label, desc, maxCount, images, onChange }) {
    const fileRef = useRef(null);

    const handleFiles = (e) => {
        const files = Array.from(e.target.files ?? []);
        const remaining = maxCount - images.length;
        const toAdd = files.slice(0, remaining).map((file) => ({
            id: makeid(),
            file,
            preview: URL.createObjectURL(file),
        }));
        onChange([...images, ...toAdd]);
        e.target.value = "";
    };

    const remove = (id) => onChange(images.filter((img) => img.id !== id));

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-zinc-700">{label}</p>
                    <p className="text-[11px] text-zinc-400">{desc}</p>
                </div>
                <Badge variant="outline" className="text-[10px] text-zinc-500 border-zinc-200">
                    {images.length} / {maxCount}
                </Badge>
            </div>

            <div className="flex flex-wrap gap-2">
                {images.map((img) => (
                    <div key={img.id} className="relative w-20 h-20 rounded-xl overflow-hidden border border-zinc-200 group">
                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                        <button
                            type="button"
                            onClick={() => remove(img.id)}
                            className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {images.length < maxCount && (
                    <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="w-20 h-20 rounded-xl border-2 border-dashed border-zinc-300 bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-400 flex flex-col items-center justify-center gap-1 transition-colors"
                    >
                        <ImagePlus className="w-5 h-5 text-zinc-400" />
                        <span className="text-[10px] text-zinc-400 font-medium">추가</span>
                    </button>
                )}
            </div>

            <input
                ref={fileRef}
                type="file"
                accept="image/*"
                multiple={maxCount > 1}
                className="hidden"
                onChange={handleFiles}
            />
        </div>
    );
}

// ── Address Section ───────────────────────────────────────────────────────────
function AddressSection({ addresses, onChange }) {
    const update = (type, value) =>
        onChange({ ...addresses, [type]: value });

    return (
        <div className="space-y-4">
            {ADDRESS_TYPES.map(({ value, label, required }) => (
                <FormField key={value} id={`addr-${value}`} label={label} required={required}>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <Input
                            id={`addr-${value}`}
                            type="text"
                            value={addresses[value] ?? ""}
                            onChange={(e) => update(value, e.target.value)}
                            placeholder={`${label}을 입력하세요`}
                            className="h-11 pl-9 rounded-xl border-zinc-200 bg-zinc-50 font-medium focus:border-zinc-400"
                        />
                    </div>
                </FormField>
            ))}
        </div>
    );
}

// ── Contact Section ───────────────────────────────────────────────────────────
function ContactSection({ contacts, onChange }) {
    const update = (type, value) =>
        onChange({ ...contacts, [type]: value });

    return (
        <div className="space-y-4">
            <FormField id="contact-phone" label="전화번호" required>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                        id="contact-phone"
                        type="tel"
                        value={contacts.PHONE ?? ""}
                        onChange={(e) => update("PHONE", e.target.value)}
                        placeholder="02-0000-0000"
                        maxLength={20}
                        className="h-11 pl-9 rounded-xl border-zinc-200 bg-zinc-50 font-medium focus:border-zinc-400"
                    />
                </div>
            </FormField>

            <FormField id="contact-email" label="이메일">
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <Input
                        id="contact-email"
                        type="email"
                        value={contacts.EMAIL ?? ""}
                        onChange={(e) => update("EMAIL", e.target.value)}
                        placeholder="store@example.com"
                        className="h-11 pl-9 rounded-xl border-zinc-200 bg-zinc-50 font-medium focus:border-zinc-400"
                    />
                </div>
            </FormField>
        </div>
    );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function StoreRegisterPage() {
    // stores
    const [storeName, setStoreName] = useState("");

    // store_addresses  { MAIN, PICKUP, RETURN, WAREHOUSE }
    const [addresses, setAddresses] = useState({
        MAIN: "", PICKUP: "", RETURN: "", WAREHOUSE: "",
    });

    // store_contacts  { PHONE, EMAIL }
    const [contacts, setContacts] = useState({ PHONE: "", EMAIL: "" });

    // store_profiles
    const [description, setDescription] = useState("");

    // store_images  { THUMBNAIL: [], BANNER: [], INTRODUCE: [] }
    const [images, setImages] = useState({ THUMBNAIL: [], BANNER: [], INTRODUCE: [] });

    const updateImages = (type) => (list) =>
        setImages((prev) => ({ ...prev, [type]: list }));

    // ── Submit ──────────────────────────────────────────────────────────────
    const handleSubmit = () => {
        // 필수값 체크
        if (!storeName.trim()) { alert("가게 이름을 입력해주세요."); return; }
        if (!addresses.MAIN.trim()) { alert("본점 주소를 입력해주세요."); return; }
        if (!contacts.PHONE.trim()) { alert("전화번호를 입력해주세요."); return; }

        const payload = {
            // POST /api/stores
            store: { storeName },

            // POST /api/stores/:id/addresses  (빈 값 제외)
            addresses: ADDRESS_TYPES
                .filter(({ value }) => addresses[value]?.trim())
                .map(({ value }, i) => ({
                    addressType: value,
                    address: addresses[value].trim(),
                    isDefault: value === "MAIN",
                    sortOrder: i,
                })),

            // POST /api/stores/:id/contacts  (빈 값 제외)
            contacts: ["PHONE", "EMAIL"]
                .filter((t) => contacts[t]?.trim())
                .map((t, i) => ({
                    contactType: t,
                    contactValue: contacts[t].trim(),
                    isPrimary: i === 0,
                })),

            // POST /api/stores/:id/profile
            profile: { description: description.trim() },

            // POST /api/stores/:id/images  (FormData)
            images: Object.entries(images).flatMap(([type, list]) =>
                list.map((img, i) => ({ imageType: type, file: img.file, sortOrder: i }))
            ),
        };

        console.log("가게 개설 payload:", payload);
        // TODO: API 연동
        alert("가게가 개설되었습니다!");
    };

    return (
        <div className="space-y-5 pb-10 max-w-2xl mx-auto">

            {/* ── Page Header ─────────────────────────────────────────── */}
            <div className="reveal-up flex items-center gap-3">
                <Button
                    asChild
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 rounded-full border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 flex-shrink-0"
                >
                    <Link to="/my">
                        <ArrowLeft className="w-4 h-4" />
                    </Link>
                </Button>
                <div>
                    <p className="text-xs font-semibold text-zinc-500">Seller Center</p>
                    <h1 className="text-2xl font-black text-zinc-900 leading-tight">가게 개설</h1>
                </div>
            </div>

            {/* ── Hero Banner ─────────────────────────────────────────── */}
            <section
                className="reveal-up relative overflow-hidden rounded-[2rem] border border-white/60 bg-gradient-to-br from-white/90 via-zinc-50/80 to-white/70 px-8 py-7 shadow-[0_24px_80px_rgba(31,38,66,0.16)] backdrop-blur"
                style={{ animationDelay: "40ms" }}
            >
                <div className="pointer-events-none absolute -top-20 -right-16 h-60 w-60 rounded-full bg-gradient-to-br from-cyan-300/40 to-indigo-400/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 -left-12 h-48 w-48 rounded-full bg-gradient-to-tr from-orange-300/35 to-pink-300/10 blur-3xl" />

                <div className="relative z-10 space-y-4">
                    <span className="inline-flex items-center gap-2 rounded-full border border-zinc-200/70 bg-white/75 px-3 py-1 text-[11px] font-semibold tracking-wide text-zinc-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                        새 가게 만들기
                    </span>

                    <FormField id="storeName" label="가게 이름" required>
                        <Input
                            id="storeName"
                            type="text"
                            value={storeName}
                            onChange={(e) => setStoreName(e.target.value)}
                            placeholder="고객에게 보여질 가게 이름을 입력하세요"
                            maxLength={200}
                            className="h-12 rounded-xl border-zinc-200/80 bg-white/80 text-base font-bold focus:border-zinc-400 focus:bg-white backdrop-blur"
                        />
                    </FormField>
                </div>
            </section>

            {/* ── 주소 ────────────────────────────────────────────────── */}
            <SectionCard icon={MapPin} title="주소 정보" delay={80}>
                <AddressSection addresses={addresses} onChange={setAddresses} />
            </SectionCard>

            {/* ── 연락처 ──────────────────────────────────────────────── */}
            <SectionCard icon={Phone} title="연락처" delay={140}>
                <ContactSection contacts={contacts} onChange={setContacts} />
            </SectionCard>

            {/* ── 가게 소개 ────────────────────────────────────────────── */}
            <SectionCard icon={FileText} title="가게 소개" delay={200}>
                <FormField id="description" label="소개글" hint="가게를 소개하는 글을 작성해주세요. (선택)">
                    <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="가게의 특징, 취급 상품, 운영 방침 등을 자유롭게 작성해주세요."
                        rows={5}
                        maxLength={1000}
                        className="rounded-xl border-zinc-200 bg-zinc-50 font-medium resize-none focus:border-zinc-400"
                    />
                    <p className="text-right text-[11px] text-zinc-400 mt-1">
                        {description.length} / 1000
                    </p>
                </FormField>
            </SectionCard>

            {/* ── 이미지 ──────────────────────────────────────────────── */}
            <SectionCard icon={Image} title="가게 이미지" delay={260}>
                <div className="space-y-6 divide-y divide-zinc-100">
                    {IMAGE_TYPES.map(({ value, label, desc, maxCount }, i) => (
                        <div key={value} className={i > 0 ? "pt-5" : ""}>
                            <ImageUploadBlock
                                type={value}
                                label={label}
                                desc={desc}
                                maxCount={maxCount}
                                images={images[value]}
                                onChange={updateImages(value)}
                            />
                        </div>
                    ))}
                </div>
                <p className="text-[11px] text-zinc-400">JPG, PNG, WEBP · 각 최대 5MB</p>
            </SectionCard>

            {/* ── Action Buttons ───────────────────────────────────────── */}
            <div
                className="reveal-up flex gap-3"
                style={{ animationDelay: "320ms" }}
            >
                <Button
                    asChild
                    variant="outline"
                    className="flex-1 h-12 rounded-full border-zinc-300 bg-white text-zinc-700 font-bold hover:bg-zinc-100"
                >
                    <Link to="/my">취소</Link>
                </Button>
                <Button
                    className="flex-[2] h-12 rounded-full bg-zinc-950 text-white font-bold hover:bg-zinc-800"
                    onClick={handleSubmit}
                >
                    가게 개설하기
                </Button>
            </div>

        </div>
    );
}

export default StoreRegisterPage;