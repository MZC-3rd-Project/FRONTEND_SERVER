import { useState } from "react";
import { Link, useLocation } from "react-router";

import { useKeycloak } from "@/common/auth/KeycloakProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

function LoginPage() {
    const { login } = useKeycloak();
    const [email, setEmail] = useState("");
    const { state } = useLocation();

    const handleLogin = (e) => {
        e.preventDefault();
        login({ loginHint: email });
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
                    <form onSubmit={handleLogin} className="space-y-3">
                        <Input
                            type="email"
                            placeholder="이메일 주소"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            autoComplete="email"
                            required
                            className="dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                        />
                        <Button
                            type="submit"
                            className="w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
                        >
                            로그인
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
