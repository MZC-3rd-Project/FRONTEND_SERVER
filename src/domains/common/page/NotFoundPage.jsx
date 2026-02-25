import { Link } from "react-router";

import { Button } from "@/components/ui/button";

function NotFoundPage() {
    return (
        <div className="grid min-h-[60vh] place-items-center px-4">
            <div className="max-w-md space-y-4 text-center">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">404</p>
                <h2 className="text-3xl font-black tracking-tight text-zinc-900">페이지를 찾을 수 없습니다</h2>
                <p className="text-sm text-zinc-600">요청하신 페이지가 이동되었거나 주소가 잘못되었습니다.</p>
                <div className="flex justify-center gap-2">
                    <Button asChild className="rounded-full bg-zinc-900 px-5 text-white hover:bg-zinc-700">
                        <Link to="/">클라이언트 홈</Link>
                    </Button>
                    <Button asChild variant="outline" className="rounded-full border-zinc-300 bg-white px-5 text-zinc-700 hover:bg-zinc-100">
                        <Link to="/store">가게 둘러보기</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default NotFoundPage;
