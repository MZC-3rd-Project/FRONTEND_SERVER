import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/common/store/useAuthStore.js";

function resolveRedirectPath(rawRedirect) {
    if (typeof rawRedirect !== "string" || !rawRedirect.startsWith("/")) {
        return "/";
    }

    if (rawRedirect.startsWith("/auth/login")) {
        return "/";
    }

    return rawRedirect;
}

function LoginPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const login = useAuthStore((state) => state.login);
    const redirectPath = useMemo(
        () => resolveRedirectPath(searchParams.get("redirect")),
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
                setSubmitError("로그인에 실패했습니다. 아이디와 비밀번호를 다시 확인해 주세요.");
                return;
            }

            login({ username: body.get("username") });
            navigate(redirectPath, { replace: true });
        } catch (error) {
            setSubmitError(error instanceof Error ? error.message : "로그인 요청에 실패했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="grid min-h-[70vh] place-items-center py-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">로그인</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        개발 환경에서는 게이트웨이 dev 세션 로그인을 사용합니다.
                    </p>
                    <div className="rounded-2xl border border-border bg-accent/40 p-4 text-sm">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline">ID: test</Badge>
                            <Badge variant="outline">PW: test123</Badge>
                        </div>
                        <p className="mt-3 text-xs text-muted-foreground">
                            로그인 후 브라우저에 <span className="font-semibold text-foreground">SESSION</span> 쿠키가 저장되면
                            프록시된 `/api`, `/bff` 요청에 사용자 컨텍스트가 자동으로 붙습니다.
                        </p>
                    </div>
                    {submitError ? (
                        <Alert variant="destructive">
                            <AlertTitle>로그인 실패</AlertTitle>
                            <AlertDescription>{submitError}</AlertDescription>
                        </Alert>
                    ) : null}
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <label className="block space-y-1 text-sm">
                            <span className="font-medium text-foreground">아이디</span>
                            <input
                                className="h-11 w-full rounded-2xl border border-input bg-background px-4"
                                type="text"
                                name="username"
                                defaultValue="test"
                                autoComplete="username"
                                required
                            />
                        </label>
                        <label className="block space-y-1 text-sm">
                            <span className="font-medium text-foreground">비밀번호</span>
                            <input
                                className="h-11 w-full rounded-2xl border border-input bg-background px-4"
                                type="password"
                                name="password"
                                defaultValue="test123"
                                autoComplete="current-password"
                                required
                            />
                        </label>
                        <Button type="submit" className="w-full rounded-full" disabled={isSubmitting}>
                            세션 로그인
                        </Button>
                    </form>
                    <p className="text-center text-xs text-muted-foreground">
                        로그인 후 원래 보고 있던 화면으로 자동 이동합니다.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default LoginPage;
