import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function LoginPage() {
    return (
        <div className="grid min-h-[70vh] place-items-center py-6">
            <Card className="w-full max-w-md border-zinc-200/80 bg-white/95">
                <CardHeader>
                    <CardTitle className="text-xl font-bold text-zinc-900">로그인</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Input type="email" placeholder="이메일" />
                    <Input type="password" placeholder="비밀번호" />
                    <Button className="w-full rounded-full bg-zinc-900 text-white hover:bg-zinc-700">로그인</Button>
                    <p className="text-center text-xs text-zinc-500">
                        계정이 없나요? <Link to="/auth/join" className="font-semibold text-zinc-900">회원가입</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default LoginPage;
