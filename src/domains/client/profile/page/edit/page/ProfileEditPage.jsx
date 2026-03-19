import { Link } from "react-router";
import { ArrowLeft, CheckCircle2, Clock, MapPin, User } from "lucide-react";
import { useActionState, useRef, useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import FormField from "@/components/profile/edit/FormField.jsx";
import AvatarUpload from "@/components/profile/edit/AvartarUpload.jsx";
import {
    confirmCodeAction,
    requestCodeAction,
    saveProfileAction
} from "@/domains/client/profile/actions/profileSchema.js";

// ─────────────────────────────────────────────
// 상수
// ─────────────────────────────────────────────
const initialProfile = {
    email: "hong@example.com",
    nickname: "길동이",
    phone: "010-1234-5678",
    delivery: "서울특별시 강남구 테헤란로 123, 456동 789호",
    imageUrl: null,
};

const STEP = { LOCKED: "locked", EDITING: "editing", CODE_SENT: "code_sent", VERIFIED: "verified" };
const CODE_TTL = 180;

function formatTimer(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${m}:${s}`;
}


// ─────────────────────────────────────────────
// 컴포넌트
// ─────────────────────────────────────────────
export default function ProfileEditPage() {
    const [form, setForm] = useState(initialProfile);
    const [previewUrl, setPreviewUrl] = useState(initialProfile.imageUrl);
    const [_imageFile, setImageFile] = useState(null);

    // 이메일 인증 단계 상태 (UI 전환용)
    const [emailStep, setEmailStep] = useState(STEP.LOCKED);
    const [newEmail, setNewEmail] = useState(initialProfile.email);
    const [timer, setTimer] = useState(CODE_TTL);
    const timerRef = useRef(null);

    const [requestState, requestAction, isRequestPending] = useActionState(requestCodeAction, {
        success: false, errors: {}, serverError: null,
    });

    const [confirmState, confirmAction, isConfirmPending] = useActionState(confirmCodeAction, {
        success: false, errors: {}, serverError: null,
    });

    const [saveState, saveAction, isSavePending] = useActionState(saveProfileAction, {
        success: false, errors: {}, serverError: null,
    });

    // ── 인증번호 요청 성공 → 타이머 시작 ──────
    useEffect(() => {
        if (!requestState.success) return;

        setEmailStep(STEP.CODE_SENT);
        setTimer(CODE_TTL);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setEmailStep(STEP.EDITING);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timerRef.current);
    }, [requestState.success]);

    // ── 인증번호 확인 성공 → 이메일 업데이트 ──
    useEffect(() => {
        if (!confirmState.success) return;

        clearInterval(timerRef.current);
        setForm((prev) => ({ ...prev, email: newEmail }));
        setEmailStep(STEP.VERIFIED);
    }, [confirmState.success]);

    // ── 이메일 변경 취소 ──────────────────────
    const handleCancelEmailEdit = () => {
        clearInterval(timerRef.current);
        setNewEmail(form.email);
        setEmailStep(STEP.LOCKED);
    };

    // ── 이미지 ───────────────────────────────
    const handleImageChange = (dataUrl, file) => {
        setPreviewUrl(dataUrl);
        setImageFile(file);
    };

    const handleImageRemove = () => {
        setPreviewUrl(null);
        setImageFile(null);
    };

    const handleChange = (key) => (e) => setForm((prev) => ({ ...prev, [key]: e.target.value }));

    // ── 이메일 안내 문구 ──────────────────────
    const emailHint =
        emailStep === STEP.VERIFIED  ? "이메일이 성공적으로 변경됐습니다." :
            emailStep === STEP.CODE_SENT ? "입력하신 이메일로 인증번호를 발송했습니다." :
                emailStep === STEP.EDITING   ? "새 이메일 주소를 입력하고 인증번호를 요청하세요." :
                    "이메일을 변경하려면 인증이 필요합니다.";

    return (
        <div className="space-y-5 pb-10 max-w-2xl mx-auto">

            {/* ── Page Header ───────────────────────────────────────── */}
            <div className="flex items-center gap-3">
                <Button asChild variant="outline" size="icon" className="h-9 w-9 rounded-full flex-shrink-0">
                    <Link to="/my/profile"><ArrowLeft className="w-4 h-4" /></Link>
                </Button>
                <div>
                    <p className="text-xs font-semibold text-muted-foreground">My Account</p>
                    <h1 className="text-2xl font-black text-foreground leading-tight">프로필 수정</h1>
                </div>
            </div>

            {/* ── Avatar Upload ──────────────────────────────────────── */}
            <section className="bg-card border border-border rounded-3xl p-8 text-center">
                <AvatarUpload
                    imageUrl={previewUrl}
                    onImageChange={handleImageChange}
                    onImageRemove={handleImageRemove}
                />
            </section>

            {/* ── Basic Info ────────────────────────────────────────── */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                        <User className="w-4 h-4" />
                        기본 정보
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">

                    {/* ── 이메일 ────────────────────────────────────── */}
                    <div className="space-y-3">
                        <FormField id="email" label="이메일" required hint={emailHint}>

                            {/* 인증번호 요청 폼 */}
                            <form action={requestAction} className="space-y-1">
                                {/* 이메일 값을 hidden input으로 전달 (controlled input과 분리) */}
                                <input type="hidden" name="email" value={newEmail} />

                                <div className="flex gap-2">
                                    <Input
                                        id="email"
                                        type="email"
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        disabled={
                                            emailStep === STEP.LOCKED ||
                                            emailStep === STEP.CODE_SENT ||
                                            emailStep === STEP.VERIFIED
                                        }
                                        placeholder="이메일 주소"
                                        className="h-11 rounded-xl flex-1"
                                    />

                                    {emailStep === STEP.LOCKED && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setEmailStep(STEP.EDITING)}
                                            className="h-11 rounded-xl whitespace-nowrap"
                                        >
                                            이메일 변경
                                        </Button>
                                    )}

                                    {emailStep === STEP.EDITING && (
                                        <Button
                                            type="submit"
                                            disabled={isRequestPending}
                                            className="h-11 rounded-xl whitespace-nowrap"
                                        >
                                            {isRequestPending ? "발송 중..." : "인증번호 요청"}
                                        </Button>
                                    )}

                                    {emailStep === STEP.CODE_SENT && (
                                        <Button
                                            type="submit"
                                            variant="outline"
                                            disabled={isRequestPending}
                                            className="h-11 rounded-xl whitespace-nowrap"
                                        >
                                            {isRequestPending ? "발송 중..." : "재발송"}
                                        </Button>
                                    )}

                                    {emailStep === STEP.VERIFIED && (
                                        <div className="flex items-center gap-1.5 px-3 text-primary text-sm font-semibold whitespace-nowrap">
                                            <CheckCircle2 className="w-4 h-4" />
                                            인증 완료
                                        </div>
                                    )}
                                </div>

                                {requestState.errors?.email && (
                                    <p className="text-xs text-destructive font-medium">
                                        {requestState.errors.email[0]}
                                    </p>
                                )}
                                {requestState.serverError && emailStep === STEP.EDITING && (
                                    <p className="text-xs text-destructive font-medium">
                                        {requestState.serverError}
                                    </p>
                                )}
                            </form>
                        </FormField>

                        {/* 인증번호 확인 폼 */}
                        {emailStep === STEP.CODE_SENT && (
                            <form action={confirmAction} className="space-y-2">
                                <input type="hidden" name="email" value={newEmail} />

                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            name="code"
                                            type="text"
                                            inputMode="numeric"
                                            placeholder="인증번호 6자리"
                                            maxLength={6}
                                            className="h-11 rounded-xl pr-16"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                                            <Clock className="w-3 h-3" />
                                            {formatTimer(timer)}
                                        </span>
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={isConfirmPending}
                                        className="h-11 rounded-xl whitespace-nowrap"
                                    >
                                        {isConfirmPending ? "확인 중..." : "확인"}
                                    </Button>
                                </div>

                                {confirmState.errors?.code && (
                                    <p className="text-xs text-destructive font-medium">
                                        {confirmState.errors.code[0]}
                                    </p>
                                )}
                                {timer === 0 && (
                                    <p className="text-xs text-destructive font-medium">
                                        인증 시간이 만료됐습니다. 다시 요청해 주세요.
                                    </p>
                                )}
                                {confirmState.serverError && (
                                    <p className="text-xs text-destructive font-medium">
                                        {confirmState.serverError}
                                    </p>
                                )}
                            </form>
                        )}

                        {(emailStep === STEP.EDITING || emailStep === STEP.CODE_SENT) && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={handleCancelEmailEdit}
                                className="h-auto p-0 text-xs text-muted-foreground underline underline-offset-2"
                            >
                                변경 취소
                            </Button>
                        )}
                    </div>

                    {/* ── 닉네임 / 전화번호 ─────────────────────────── */}
                    <FormField
                        id="nickname"
                        label="닉네임"
                        hint={saveState.errors?.nickname?.[0]}
                        hintError={!!saveState.errors?.nickname}
                    >
                        <Input
                            id="nickname"
                            type="text"
                            value={form.nickname}
                            onChange={handleChange("nickname")}
                            placeholder="사용할 닉네임을 입력하세요"
                            maxLength={20}
                            className="h-11 rounded-xl"
                        />
                    </FormField>

                    <FormField
                        id="phone"
                        label="전화번호"
                        hint={saveState.errors?.phone?.[0]}
                        hintError={!!saveState.errors?.phone}
                    >
                        <Input
                            id="phone"
                            type="tel"
                            value={form.phone}
                            onChange={handleChange("phone")}
                            placeholder="010-0000-0000"
                            maxLength={15}
                            className="h-11 rounded-xl"
                        />
                    </FormField>
                </CardContent>
            </Card>

            {/* ── Delivery Info ─────────────────────────────────────── */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        배송 정보
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <FormField
                        id="delivery"
                        label="기본 배송지"
                        hint={saveState.errors?.delivery?.[0] ?? "주문 시 기본으로 사용할 배송지입니다."}
                        hintError={!!saveState.errors?.delivery}
                    >
                        <Input
                            id="delivery"
                            type="text"
                            value={form.delivery}
                            onChange={handleChange("delivery")}
                            placeholder="기본 배송지 주소를 입력하세요"
                            maxLength={100}
                            className="h-11 rounded-xl"
                        />
                    </FormField>
                </CardContent>
            </Card>

            {/* ── Action Buttons ────────────────────────────────────── */}
            <form action={saveAction} className="flex gap-3">
                {/* controlled 값들을 hidden input으로 폼 데이터에 포함 */}
                <input type="hidden" name="nickname" value={form.nickname} />
                <input type="hidden" name="phone" value={form.phone} />
                <input type="hidden" name="delivery" value={form.delivery} />

                <Button asChild variant="outline" className="flex-1 h-12 rounded-full font-bold">
                    <Link to="/my/profile">취소</Link>
                </Button>
                <Button
                    type="submit"
                    disabled={isSavePending}
                    className="flex-[2] h-12 rounded-full font-bold"
                >
                    {isSavePending ? "저장 중..." : "저장하기"}
                </Button>
            </form>

            {saveState.success && (
                <p className="text-sm text-primary font-semibold text-center">프로필이 저장되었습니다.</p>
            )}
            {saveState.serverError && (
                <p className="text-sm text-destructive font-semibold text-center">{saveState.serverError}</p>
            )}
        </div>
    );
}