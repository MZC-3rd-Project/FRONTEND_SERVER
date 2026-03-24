import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { normalizeAuthRedirectPath } from "@/common/api/authNavigation.js";
import { useAuthStore } from "@/common/store/useAuthStore.js";
import { fetchProfile } from "@/domains/client/profile/api/profileApi.js";
import { normalizeProfile } from "@/domains/client/profile/lib/profileMappers.js";

function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { state } = useLocation();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const login = useAuthStore((state) => state.login);
    const redirectPath = useMemo(
        () => normalizeAuthRedirectPath(searchParams.get("redirect")),
        [searchParams]
    );

    const handleSubmit = async (event) => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const body = new URLSearchParams();

        body.set("username", String(formData.get("username") ?? ""));
        body.set("password", String(formData.get("password") ?? ""));

        setIsSubmitting(true);
        setSubmitError("");

        try {
            const response = await fetch("/login", {
                method: "POST",
                body,
                credentials: "include",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            const finalUrl = response.url ? new URL(response.url, window.location.origin) : null;
            const isGatewayLoginPage = finalUrl?.pathname === "/login";
            const hasLoginError = finalUrl?.searchParams?.has("error") === true;

            if (!response.ok || isGatewayLoginPage || hasLoginError) {
                const errorParam = finalUrl?.searchParams?.get("error") ?? "";
                if (errorParam === "email_not_verified") {
                    setSubmitError("EMAIL_NOT_VERIFIED");
                } else {
                    setSubmitError("로그인에 실패했습니다. 아이디와 비밀번호를 다시 확인해 주세요.");
                }
                return;
            }

            try {
                const profilePayload = await fetchProfile({ skipAuthRedirect: true });
                login(normalizeProfile(profilePayload));
            } catch {
                login({ email: body.get("username") });
            }
            navigate(redirectPath, { replace: true });
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "로그인 요청에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid min-h-[70vh] place-items-center py-6">
            <Card className="w-full max-w-md border-zinc-200/80 bg-white/95 dark:border-zinc-700/80 dark:bg-zinc-900/95">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        로그인
                    </CardTitle>
                    <CardDescription>이메일과 비밀번호로 로그인하세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {state?.message && (
                        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                            <AlertDescription>{state.message}</AlertDescription>
                        </Alert>
                    )}
                    {submitError === "EMAIL_NOT_VERIFIED" ? (
                        <Alert variant="destructive">
                            <AlertTitle>이메일 인증 필요</AlertTitle>
                            <AlertDescription>
                                이메일 인증이 필요합니다.{" "}
                                <Link to="/auth/join" className="font-semibold underline underline-offset-2">
                                    이메일 인증하기
                                </Link>
                            </AlertDescription>
                        </Alert>
                    ) : submitError ? (
                        <Alert variant="destructive">
                            <AlertTitle>로그인 실패</AlertTitle>
                            <AlertDescription>{submitError}</AlertDescription>
                        </Alert>
                    ) : null}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label
                                htmlFor="username"
                                className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300"
                            >
                                이메일
                            </label>
                            <Input
                                id="username"
                                type="text"
                                name="username"
                                placeholder="이메일 주소"
                                autoComplete="username"
                                required
                                className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                                disabled={isSubmitting}
                            />
                        </div>
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
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="비밀번호"
                                    autoComplete="current-password"
                                    required
                                    className="pr-10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                                    disabled={isSubmitting}
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
                        </div>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                        >
                            {isSubmitting ? "로그인 중..." : "로그인"}
                        </Button>
                    </form>
                    <p className="text-center text-xs text-zinc-500 dark:text-zinc-400">
                        계정이 없나요?{" "}
                        <Link
                            to="/auth/join"
                            className="font-semibold text-zinc-900 hover:underline dark:text-zinc-100"
                        >
                            회원가입
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default LoginPage;
