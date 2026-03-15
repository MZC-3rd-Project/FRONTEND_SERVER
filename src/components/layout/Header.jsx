import { Link, useLocation } from "react-router";
import { useEffect, useState } from "react";
import { Menu, Moon, Sparkles, Sun, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { AuthButtons } from "@/components/user/authButton";
import { UserNavigation } from "@/components/user/UserNavigation";
import { useTheme } from "@/common/hooks/useTheme";

const menus = [
    { name: "홈", to: "/" },
    { name: "펀딩", to: "/funding" },
    { name: "판매", to: "/sales" },
    { name: "핫딜", to: "/deals" },
    { name: "스토어", to: "/store" },
];

export default function Header({
                                   isLoggedIn = true,
                                   hasNotifications = 3,
                                   hasMessages = 2,
                               }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const { isDark, toggleTheme } = useTheme();
    const { pathname } = useLocation();
    const isActiveMenu = (to) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 16);
        handleScroll();
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "fixed inset-x-0 top-0 z-50 transition-all duration-300",
                isScrolled ? "pt-2" : "pt-3"
            )}
        >
            <div
                className={cn(
                    "mx-auto max-w-[1200px] rounded-2xl border px-4 sm:px-6",
                    "backdrop-blur-xl transition-all duration-300",
                    isScrolled
                        ? "border-border/70 bg-background/75 shadow-md"
                        : "border-border/50 bg-background/60 shadow-sm"
                )}
            >
                {/* ── 메인 행 ── */}
                <div className="flex h-16 items-center justify-between gap-3">

                    {/* 로고 */}
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2.5 font-black tracking-tight text-foreground"
                    >
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-primary text-primary-foreground">
                            <Sparkles className="h-4 w-4" />
                        </span>
                        <span className="text-base sm:text-lg">Don-Moa | 돈모아</span>
                    </Link>

                    {/* 데스크탑 내비게이션 */}
                    <nav className="hidden items-center gap-1 lg:flex">
                        {menus.map((menu) => {
                            const isActive = isActiveMenu(menu.to);
                            return (
                                <Link
                                    key={menu.name}
                                    to={menu.to}
                                    className={cn(
                                        "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                                        isActive
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                    )}
                                >
                                    {menu.name}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* 데스크탑 액션 영역 */}
                    <div className="hidden items-center gap-2 lg:flex">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="rounded-full"
                            onClick={toggleTheme}
                            aria-label={isDark ? "라이트 모드 전환" : "다크 모드 전환"}
                        >
                            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            className="h-9 rounded-full px-4 text-sm font-semibold"
                        >
                            <Link to="/cart">장바구니</Link>
                        </Button>

                        <Button
                            asChild
                            variant="ghost"
                            className="h-9 rounded-full px-4 text-sm font-semibold"
                        >
                            <Link to="/my">마이페이지</Link>
                        </Button>

                        {isLoggedIn ? (
                            <UserNavigation
                                hasNotifications={hasNotifications}
                                hasMessages={hasMessages}
                            />
                        ) : (
                            <AuthButtons />
                        )}
                    </div>

                    {/* 모바일 햄버거 */}
                    <button
                        type="button"
                        className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-foreground lg:hidden"
                        aria-label="모바일 메뉴"
                        onClick={() => setMobileOpen((prev) => !prev)}
                    >
                        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>

                {/* ── 모바일 드로어 ── */}
                <div
                    className={cn(
                        "overflow-hidden transition-[max-height,opacity,padding] duration-300 lg:hidden",
                        mobileOpen ? "max-h-[340px] pb-4 opacity-100" : "max-h-0 pb-0 opacity-0"
                    )}
                >
                    <div className="space-y-2 border-t border-border/70 pt-3">
                        {menus.map((menu) => (
                            <Link
                                key={menu.name}
                                to={menu.to}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "block rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                                    isActiveMenu(menu.to)
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                )}
                            >
                                {menu.name}
                            </Link>
                        ))}

                        <div className="flex flex-wrap gap-2 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-full px-4"
                                onClick={toggleTheme}
                            >
                                {isDark ? "라이트 모드" : "다크 모드"}
                            </Button>

                            <Button
                                asChild
                                size="sm"
                                className="rounded-full px-4"
                            >
                                <Link to="/cart" onClick={() => setMobileOpen(false)}>
                                    장바구니
                                </Link>
                            </Button>

                            {isLoggedIn ? (
                                <UserNavigation
                                    hasNotifications={hasNotifications}
                                    hasMessages={hasMessages}
                                />
                            ) : (
                                <AuthButtons />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}