import { useState, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";

import { axiosInstance } from "@/common/api/apiInstacne";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

const joinSchema = z
    .object({
        nickname: z
            .string()
            .min(2, "닉네임은 최소 2자 이상이어야 합니다.")
            .max(50, "닉네임은 50자 이하여야 합니다."),
        email: z.string().email("올바른 이메일 형식이 아닙니다."),
        password: z
            .string()
            .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
            .regex(/[a-zA-Z]/, "영문자가 포함되어야 합니다.")
            .regex(/[0-9]/, "숫자가 포함되어야 합니다."),
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "비밀번호가 일치하지 않습니다.",
        path: ["confirmPassword"],
    });

function FieldError({ message, id }) {
    if (!message) return null;
    return (
        <p id={id} className="mt-1 text-xs text-red-500 dark:text-red-400" role="alert">
            {message}
        </p>
    );
}

// 'idle' | 'checking' | 'available' | 'unavailable'
const IDLE = "idle";
const CHECKING = "checking";
const AVAILABLE = "available";
const UNAVAILABLE = "unavailable";

function CheckBadge({ status }) {
    if (status === AVAILABLE)
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    if (status === UNAVAILABLE)
        return <XCircle className="h-4 w-4 text-red-500" />;
    return null;
}

function JoinPage() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nickname: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [fieldErrors, setFieldErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [serverFeedback, setServerFeedback] = useState(null);

    const [emailCheck, setEmailCheck] = useState({ status: IDLE, checkedValue: "" });
    const [nicknameCheck, setNicknameCheck] = useState({ status: IDLE, checkedValue: "" });

    // 이메일 인증 상태
    const [emailVerif, setEmailVerif] = useState({
        isSending: false,
        sent: false,
        code: "",
        isVerifying: false,
        verified: false,
        error: null,
    });
    const [countdown, setCountdown] = useState(0);
    const countdownRef = useRef(null);

    const RESEND_COOLDOWN = 300; // 분

    const formatCountdown = (sec) => {
        const m = Math.floor(sec / 60).toString().padStart(2, "0");
        const s = (sec % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const startCountdown = useCallback(() => {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setCountdown(RESEND_COOLDOWN);
        countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    const stopCountdown = useCallback(() => {
        if (countdownRef.current) clearInterval(countdownRef.current);
        setCountdown(0);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        }
        if (name === "email") {
            setEmailCheck({ status: IDLE, checkedValue: "" });
            setEmailVerif({ isSending: false, sent: false, code: "", isVerifying: false, verified: false, error: null });
        }
        if (name === "nickname") setNicknameCheck({ status: IDLE, checkedValue: "" });
    };

    const handleCheckEmail = async () => {
        const emailResult = z.string().email().safeParse(formData.email);
        if (!emailResult.success) {
            setFieldErrors((prev) => ({ ...prev, email: "올바른 이메일 형식이 아닙니다." }));
            return;
        }
        setEmailCheck({ status: CHECKING, checkedValue: formData.email });
        try {
            const { data } = await axiosInstance.get("/v1/auth/emails/check", {
                params: { email: formData.email },
            });
            // TODO: 실제 응답 구조 확인 후 제거
            console.log("[이메일 중복확인 응답]", data);
            const available = data?.available ?? data?.data?.available;
            setEmailCheck({
                status: available ? AVAILABLE : UNAVAILABLE,
                checkedValue: formData.email,
            });
            if (!available) {
                setFieldErrors((prev) => ({ ...prev, email: "이미 사용 중인 이메일입니다." }));
            } else {
                setFieldErrors((prev) => ({ ...prev, email: undefined }));
            }
        } catch {
            setEmailCheck({ status: IDLE, checkedValue: "" });
            setFieldErrors((prev) => ({ ...prev, email: "중복 확인 중 오류가 발생했습니다." }));
        }
    };

    const handleCheckNickname = async () => {
        if (formData.nickname.length < 2 || formData.nickname.length > 50) {
            setFieldErrors((prev) => ({
                ...prev,
                nickname: "닉네임은 2~50자 사이여야 합니다.",
            }));
            return;
        }
        setNicknameCheck({ status: CHECKING, checkedValue: formData.nickname });
        try {
            const { data } = await axiosInstance.get("/v1/auth/nicknames/check", {
                params: { nickname: formData.nickname },
            });
            // TODO: 실제 응답 구조 확인 후 제거
            console.log("[닉네임 중복확인 응답]", data);
            const available = data?.available ?? data?.data?.available;
            setNicknameCheck({
                status: available ? AVAILABLE : UNAVAILABLE,
                checkedValue: formData.nickname,
            });
            if (!available) {
                setFieldErrors((prev) => ({
                    ...prev,
                    nickname: "이미 사용 중인 닉네임입니다.",
                }));
            } else {
                setFieldErrors((prev) => ({ ...prev, nickname: undefined }));
            }
        } catch {
            setNicknameCheck({ status: IDLE, checkedValue: "" });
            setFieldErrors((prev) => ({
                ...prev,
                nickname: "중복 확인 중 오류가 발생했습니다.",
            }));
        }
    };

    const handleClearField = (name) => {
        setFormData((prev) => ({ ...prev, [name]: "" }));
        setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
        if (name === "email") {
            setEmailCheck({ status: IDLE, checkedValue: "" });
            setEmailVerif({ isSending: false, sent: false, code: "", isVerifying: false, verified: false, error: null });
            stopCountdown();
        }
        if (name === "nickname") setNicknameCheck({ status: IDLE, checkedValue: "" });
    };

    const handleSendVerification = async () => {
        setEmailVerif((prev) => ({ ...prev, isSending: true, error: null }));
        try {
            await axiosInstance.post("/v1/auth/emails/verification", {
                email: formData.email,
            });
            setEmailVerif((prev) => ({ ...prev, isSending: false, sent: true, code: "", error: null }));
            startCountdown();
        } catch {
            setEmailVerif((prev) => ({
                ...prev,
                isSending: false,
                error: "인증번호 발송에 실패했습니다. 다시 시도해 주세요.",
            }));
        }
    };

    const handleVerifyCode = async () => {
        if (!emailVerif.code.trim()) {
            setEmailVerif((prev) => ({ ...prev, error: "인증번호를 입력해 주세요." }));
            return;
        }
        setEmailVerif((prev) => ({ ...prev, isVerifying: true, error: null }));
        try {
            await axiosInstance.post("/v1/auth/emails/verification/confirm", {
                email: formData.email,
                code: emailVerif.code,
            });
            setEmailVerif((prev) => ({ ...prev, isVerifying: false, verified: true }));
        } catch {
            setEmailVerif((prev) => ({
                ...prev,
                isVerifying: false,
                error: "인증번호가 올바르지 않습니다.",
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerFeedback(null);

        const result = joinSchema.safeParse(formData);
        if (!result.success) {
            const errors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0];
                if (field && !errors[field]) errors[field] = issue.message;
            }
            setFieldErrors(errors);
            return;
        }

        const emailPassed =
            emailCheck.status === AVAILABLE && emailCheck.checkedValue === formData.email;
        const nicknamePassed =
            nicknameCheck.status === AVAILABLE && nicknameCheck.checkedValue === formData.nickname;

        if (!emailPassed || !nicknamePassed) {
            const errors = {};
            if (!emailPassed) errors.email = "이메일 중복 확인을 해주세요.";
            if (!nicknamePassed) errors.nickname = "닉네임 중복 확인을 해주세요.";
            setFieldErrors((prev) => ({ ...prev, ...errors }));
            return;
        }

        if (!emailVerif.verified) {
            setEmailVerif((prev) => ({ ...prev, error: "이메일 인증을 완료해 주세요." }));
            return;
        }

        setIsSubmitting(true);
        try {
            await axiosInstance.post("/v1/auth/signup", {
                email: formData.email,
                password: formData.password,
                nickname: formData.nickname,
            });
            navigate("/auth/login", {
                state: { message: "회원가입이 완료되었습니다. 로그인해 주세요." },
            });
        } catch (error) {
            const msg =
                error.response?.data?.message ||
                "회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.";
            setServerFeedback({ type: "error", message: msg });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid min-h-[70vh] place-items-center py-6">
            <Card className="w-full max-w-md border-zinc-200/80 bg-white/95 dark:border-zinc-700/80 dark:bg-zinc-900/95">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        회원가입
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {serverFeedback?.type === "error" && (
                        <Alert variant="destructive" className="mb-4">
                            <AlertDescription>{serverFeedback.message}</AlertDescription>
                        </Alert>
                    )}

                    <form noValidate onSubmit={handleSubmit} className="space-y-4">
                        {/* 닉네임 */}
                        <div>
                            <label
                                htmlFor="nickname"
                                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                            >
                                닉네임
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        id="nickname"
                                        name="nickname"
                                        type="text"
                                        placeholder="2~50자"
                                        value={formData.nickname}
                                        onChange={handleChange}
                                        aria-invalid={!!fieldErrors.nickname}
                                        aria-describedby={fieldErrors.nickname ? "nickname-error" : undefined}
                                        className="pr-8 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                                        disabled={isSubmitting}
                                        autoComplete="nickname"
                                    />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                        <CheckBadge status={nicknameCheck.status} />
                                    </span>
                                </div>
                                {nicknameCheck.status === UNAVAILABLE ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleClearField("nickname")}
                                        className="shrink-0 text-xs text-red-500 hover:text-red-600"
                                    >
                                        전체 삭제
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCheckNickname}
                                        disabled={isSubmitting || nicknameCheck.status === CHECKING || !formData.nickname}
                                        className="shrink-0 text-xs"
                                    >
                                        {nicknameCheck.status === CHECKING ? "확인 중..." : "중복 확인"}
                                    </Button>
                                )}
                            </div>
                            <FieldError message={fieldErrors.nickname} id="nickname-error" />
                        </div>

                        {/* 이메일 */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                            >
                                이메일
                            </label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="example@email.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        aria-invalid={!!fieldErrors.email}
                                        aria-describedby={fieldErrors.email ? "email-error" : undefined}
                                        className="pr-8 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                                        disabled={isSubmitting || emailCheck.status === AVAILABLE}
                                        autoComplete="email"
                                    />
                                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2">
                                        <CheckBadge status={emailCheck.status} />
                                    </span>
                                </div>
                                {emailCheck.status === UNAVAILABLE ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleClearField("email")}
                                        className="shrink-0 text-xs text-red-500 hover:text-red-600"
                                    >
                                        전체 삭제
                                    </Button>
                                ) : emailCheck.status === AVAILABLE ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleClearField("email")}
                                        className="shrink-0 text-xs"
                                    >
                                        변경
                                    </Button>
                                ) : (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={handleCheckEmail}
                                        disabled={isSubmitting || emailCheck.status === CHECKING || !formData.email}
                                        className="shrink-0 text-xs"
                                    >
                                        {emailCheck.status === CHECKING ? "확인 중..." : "중복 확인"}
                                    </Button>
                                )}
                            </div>
                            <FieldError message={fieldErrors.email} id="email-error" />

                            {/* 인증번호 발송 영역: 이메일 중복확인 통과 후 표시 */}
                            {emailCheck.status === AVAILABLE && !emailVerif.verified && (
                                <div className="mt-2 space-y-2 rounded-md border border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-800/50">
                                    {!emailVerif.sent ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleSendVerification}
                                            disabled={emailVerif.isSending || isSubmitting}
                                            className="w-full text-xs"
                                        >
                                            {emailVerif.isSending ? "발송 중..." : "인증번호 발송"}
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Input
                                                type="text"
                                                placeholder="인증번호 6자리"
                                                value={emailVerif.code}
                                                onChange={(e) =>
                                                    setEmailVerif((prev) => ({ ...prev, code: e.target.value, error: null }))
                                                }
                                                maxLength={6}
                                                className="h-8 flex-1 text-sm dark:border-zinc-700 dark:bg-zinc-900"
                                                disabled={isSubmitting}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={handleVerifyCode}
                                                disabled={emailVerif.isVerifying || isSubmitting}
                                                className="shrink-0 text-xs"
                                            >
                                                {emailVerif.isVerifying ? "확인 중..." : "확인"}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleSendVerification}
                                                disabled={emailVerif.isSending || isSubmitting || countdown > 0}
                                                className="shrink-0 text-xs text-zinc-400"
                                            >
                                                {countdown > 0
                                                    ? formatCountdown(countdown)
                                                    : "재발송"}
                                            </Button>
                                        </div>
                                    )}
                                    {emailVerif.error && (
                                        <p className="text-xs text-red-500">{emailVerif.error}</p>
                                    )}
                                </div>
                            )}

                            {/* 인증 완료 메시지 */}
                            {emailVerif.verified && (
                                <p className="mt-1.5 flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    이메일 인증이 완료되었습니다.
                                </p>
                            )}
                        </div>

                        {/* 비밀번호 */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                            >
                                비밀번호
                            </label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="8자 이상, 영문+숫자 포함"
                                    value={formData.password}
                                    onChange={handleChange}
                                    aria-invalid={!!fieldErrors.password}
                                    aria-describedby={fieldErrors.password ? "password-error" : undefined}
                                    className="pr-10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                                    disabled={isSubmitting}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                                    aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <FieldError message={fieldErrors.password} id="password-error" />
                        </div>

                        {/* 비밀번호 확인 */}
                        <div>
                            <label
                                htmlFor="confirmPassword"
                                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                            >
                                비밀번호 확인
                            </label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="비밀번호 재입력"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    aria-invalid={!!fieldErrors.confirmPassword}
                                    aria-describedby={
                                        fieldErrors.confirmPassword ? "confirmPassword-error" : undefined
                                    }
                                    className="pr-10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                                    disabled={isSubmitting}
                                    autoComplete="new-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword((p) => !p)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
                                    aria-label={showConfirmPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                                    tabIndex={-1}
                                >
                                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            <FieldError message={fieldErrors.confirmPassword} id="confirmPassword-error" />
                        </div>

                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                        >
                            {isSubmitting ? "처리 중..." : "가입하기"}
                        </Button>

                        <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                            이미 계정이 있나요?{" "}
                            <Link
                                to="/auth/login"
                                className="font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
                            >
                                로그인
                            </Link>
                        </p>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default JoinPage;
