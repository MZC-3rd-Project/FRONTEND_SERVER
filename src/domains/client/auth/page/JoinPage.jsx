import { Link } from "react-router";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function JoinPage() {
    return (
        <div className="grid min-h-[70vh] place-items-center py-6">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">회원가입</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    <Input type="text" placeholder="이름" />
                    <Input type="email" placeholder="이메일" />
                    <Input type="password" placeholder="비밀번호" />
                    <Button className="w-full rounded-full">가입하기</Button>
                    <p className="text-center text-xs text-muted-foreground">
                        이미 계정이 있나요? <Link to="/auth/login" className="font-semibold text-foreground">로그인</Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default JoinPage;
