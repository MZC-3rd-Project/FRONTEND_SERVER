import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function LoginPage() {
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
                            `/bff` 요청에 사용자 컨텍스트가 자동으로 붙습니다.
                        </p>
                    </div>
                    <form action="/login" method="post" className="space-y-3">
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
                        <Button type="submit" className="w-full rounded-full">
                            세션 로그인
                        </Button>
                    </form>
                    <p className="text-center text-xs text-muted-foreground">
                        로그인 후 다시 상품 화면으로 돌아가면 됩니다.
                    </p>
                    <p className="text-center text-xs text-muted-foreground">
                        직접 게이트웨이 페이지가 필요하면 <a href="/login" className="font-semibold text-foreground underline underline-offset-2">/login</a> 으로 이동할 수 있습니다.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}

export default LoginPage;
