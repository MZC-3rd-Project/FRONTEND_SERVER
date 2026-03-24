import { Link, useLocation, useSearchParams } from "react-router";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { normalizeAuthRedirectPath } from "@/common/api/authNavigation.js";

function LoginPage() {
    const [searchParams] = useSearchParams();
    const { state } = useLocation();

    const error = searchParams.get("error");

    const handleLogin = () => {
        const redirectPath = normalizeAuthRedirectPath(searchParams.get("redirect"));
        const loginUrl = `/oauth2/authorization/keycloak?redirect=${encodeURIComponent(redirectPath)}`;
        window.location.href = loginUrl;
    };

    return (
        <div className="grid min-h-[70vh] place-items-center py-6">
            <Card className="w-full max-w-md border-zinc-200/80 bg-white/95 dark:border-zinc-700/80 dark:bg-zinc-900/95">
                <CardHeader className="text-center">
                    <CardTitle className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                        로그인
                    </CardTitle>
                    <CardDescription>Keycloak을 통해 안전하게 로그인하세요.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {state?.message && (
                        <Alert className="border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400">
                            <AlertDescription>{state.message}</AlertDescription>
                        </Alert>
                    )}
                    {error === "email_not_verified" ? (
                        <Alert variant="destructive">
                            <AlertTitle>이메일 인증 필요</AlertTitle>
                            <AlertDescription>
                                이메일 인증이 필요합니다.{" "}
                                <Link to="/auth/join" className="font-semibold underline underline-offset-2">
                                    이메일 인증하기
                                </Link>
                            </AlertDescription>
                        </Alert>
                    ) : error ? (
                        <Alert variant="destructive">
                            <AlertTitle>로그인 실패</AlertTitle>
                            <AlertDescription>
                                로그인에 실패했습니다. 다시 시도해 주세요.
                            </AlertDescription>
                        </Alert>
                    ) : null}
                    <Button
                        onClick={handleLogin}
                        className="w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                    >
                        로그인
                    </Button>
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
