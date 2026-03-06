import { Link } from "react-router";
import {
    ArrowLeft, FileText, Image, MapPin, Phone
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {useState} from "react";
import {ADDRESS_TYPES, IMAGE_TYPES} from "@/domains/client/store/constant/constant.js";
import FormField from "@/components/store/FormField.jsx";
import SectionCard from "@/components/store/SectionCard.jsx";
import AddressSection from "@/components/store/AddressSection.jsx";
import ContactSection from "@/components/store/ContactSection.jsx";
import ImageUploadBlock from "@/components/store/ImageUploadBlock.jsx";


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