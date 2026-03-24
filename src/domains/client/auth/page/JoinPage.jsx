import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { signup, verifyEmail, resendVerificationEmail } from "@/domains/client/auth/api/authApi.js";

const signupSchema = z
    .object({
        name: z.string().min(1, "이름을 입력해주세요."),
        username: z.string().min(1, "아이디를 입력해주세요."),
        email: z.string().min(1, "이메일을 입력해주세요.").email("유효한 이메일 형식이 아닙니다."),
        password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
        passwordConfirm: z.string().min(1, "비밀번호 확인을 입력해주세요."),
    })
    .refine((data) => data.password === data.passwordConfirm, {
        message: "비밀번호가 일치하지 않습니다.",
        path: ["passwordConfirm"],
    });

const verifyCodeSchema = z.object({
    code: z.string().min(1, "인증번호를 입력해주세요.").length(6, "인증번호는 6자리입니다."),
});

const ERROR_CODE_MESSAGES = {
    "AUTH-050": "인증 코드가 만료되었습니다. 재발송해주세요.",
    "AUTH-051": "인증 코드가 일치하지 않습니다.",
    "AUTH-052": "이미 인증된 이메일입니다.",
    "AUTH-053": "인증 요청을 찾을 수 없습니다. 회원가입을 다시 진행해주세요.",
};

function SignupForm({ onSuccess }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState({});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setFieldErrors({});

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get("name")?.toString() ?? "",
            username: formData.get("username")?.toString() ?? "",
            email: formData.get("email")?.toString() ?? "",
            password: formData.get("password")?.toString() ?? "",
            passwordConfirm: formData.get("passwordConfirm")?.toString() ?? "",
        };

        const result = signupSchema.safeParse(data);
        if (!result.success) {
            const errors = {};
            for (const issue of result.error.issues) {
                const key = issue.path[0];
                if (!errors[key]) errors[key] = issue.message;
            }
            setFieldErrors(errors);
            return;
        }

        setIsSubmitting(true);
        try {
            const { name, passwordConfirm: _, ...rest } = result.data;
            await signup({ ...rest, firstName: name, lastName: "" });
            onSuccess(result.data.email);
        } catch (err) {
            setError(err.message || "회원가입에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const fields = [
        { name: "name", label: "이름", type: "text", placeholder: "이름", autoComplete: "name" },
        { name: "username", label: "아이디", type: "text", placeholder: "아이디", autoComplete: "username" },
        { name: "email", label: "이메일", type: "email", placeholder: "example@email.com", autoComplete: "email" },
        { name: "password", label: "비밀번호", type: "password", placeholder: "8자 이상", autoComplete: "new-password" },
        { name: "passwordConfirm", label: "비밀번호 확인", type: "password", placeholder: "비밀번호 확인", autoComplete: "new-password" },
    ];

    return (
        <>
            <CardHeader>
                <CardTitle className="text-xl font-bold">회원가입</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {error ? (
                    <Alert variant="destructive">
                        <AlertTitle>회원가입 실패</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}
                <form onSubmit={handleSubmit} className="space-y-3">
                    {fields.map((f) => (
                        <label key={f.name} className="block space-y-1 text-sm">
                            <span className="font-medium text-foreground">{f.label}</span>
                            <Input
                                type={f.type}
                                name={f.name}
                                placeholder={f.placeholder}
                                autoComplete={f.autoComplete}
                            />
                            {fieldErrors[f.name] ? (
                                <p className="text-xs text-destructive">{fieldErrors[f.name]}</p>
                            ) : null}
                        </label>
                    ))}
                    <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                        {isSubmitting ? "가입 중..." : "가입하기"}
                    </Button>
                </form>
                <p className="text-center text-xs text-muted-foreground">
                    이미 계정이 있나요?{" "}
                    <Link to="/auth/login" className="font-semibold text-foreground">
                        로그인
                    </Link>
                </p>
            </CardContent>
        </>
    );
}

function VerifyCodeForm({ email, onSuccess }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState("");
    const [fieldError, setFieldError] = useState("");
    const [resendMessage, setResendMessage] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setFieldError("");

        const formData = new FormData(e.currentTarget);
        const data = { code: formData.get("code")?.toString() ?? "" };

        const result = verifyCodeSchema.safeParse(data);
        if (!result.success) {
            setFieldError(result.error.issues[0].message);
            return;
        }

        setIsSubmitting(true);
        try {
            await verifyEmail({ email, code: result.data.code });
            onSuccess();
        } catch (err) {
            const msg = ERROR_CODE_MESSAGES[err.code] || err.message || "이메일 인증에 실패했습니다.";
            setError(msg);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setResendMessage("");
        setError("");
        try {
            await resendVerificationEmail(email);
            setResendMessage("인증 코드가 재발송되었습니다.");
        } catch (err) {
            setError(err.message || "인증 메일 재발송에 실패했습니다.");
        } finally {
            setIsResending(false);
        }
    };

    return (
        <>
            <CardHeader>
                <CardTitle className="text-xl font-bold">이메일 인증</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{email}</span>로 6자리 인증 코드가
                    발송되었습니다.
                </p>
                {error ? (
                    <Alert variant="destructive">
                        <AlertTitle>인증 실패</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                ) : null}
                {resendMessage ? (
                    <Alert>
                        <AlertDescription>{resendMessage}</AlertDescription>
                    </Alert>
                ) : null}
                <form onSubmit={handleSubmit} className="space-y-3">
                    <label className="block space-y-1 text-sm">
                        <span className="font-medium text-foreground">인증 코드</span>
                        <Input
                            type="text"
                            name="code"
                            placeholder="6자리 인증 코드"
                            maxLength={6}
                            inputMode="numeric"
                            autoComplete="one-time-code"
                        />
                        {fieldError ? <p className="text-xs text-destructive">{fieldError}</p> : null}
                    </label>
                    <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                        {isSubmitting ? "인증 중..." : "인증하기"}
                    </Button>
                </form>
                <p className="text-center text-xs text-muted-foreground">
                    코드를 받지 못하셨나요?{" "}
                    <button
                        type="button"
                        onClick={handleResend}
                        disabled={isResending}
                        className="font-semibold text-foreground underline-offset-2 hover:underline disabled:opacity-50"
                    >
                        {isResending ? "발송 중..." : "인증 코드 재발송"}
                    </button>
                </p>
            </CardContent>
        </>
    );
}

function CompletionStep() {
    const navigate = useNavigate();

    return (
        <>
            <CardHeader>
                <CardTitle className="text-xl font-bold">인증 완료</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    이메일 인증이 완료되었습니다! 이제 로그인할 수 있습니다.
                </p>
                <Button className="w-full rounded-full" onClick={() => navigate("/auth/login")}>
                    로그인하기
                </Button>
            </CardContent>
        </>
    );
}

function JoinPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");

    const handleSignupSuccess = (signupEmail) => {
        setEmail(signupEmail);
        setStep(2);
    };

    const handleVerifySuccess = () => {
        setStep(3);
    };

    return (
        <div className="grid min-h-[70vh] place-items-center py-6">
            <Card className="w-full max-w-md">
                {step === 1 && <SignupForm onSuccess={handleSignupSuccess} />}
                {step === 2 && <VerifyCodeForm email={email} onSuccess={handleVerifySuccess} />}
                {step === 3 && <CompletionStep />}
            </Card>
        </div>
    );
}

export default JoinPage;
