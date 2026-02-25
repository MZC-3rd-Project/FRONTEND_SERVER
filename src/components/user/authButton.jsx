import { Link } from "react-router";

import { Button } from "../ui/button";

export function AuthButtons() {
    return (
        <div className="flex items-center gap-2">
            <Button
                variant="outline"
                asChild
                className="h-9 rounded-full border-zinc-300 bg-white/80 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-100"
            >
                <Link to="/auth/login">로그인</Link>
            </Button>
            <Button
                asChild
                className="h-9 rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-700"
            >
                <Link to="/auth/join">회원가입</Link>
            </Button>
        </div>
    );
}
