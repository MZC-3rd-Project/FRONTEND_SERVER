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
                        ? "border-zinc-200/70 bg-white/75 shadow-[0_10px_30px_rgba(15,23,42,0.1)] dark:border-zinc-700/70 dark:bg-zinc-950/80 dark:shadow-[0_10px_30px_rgba(2,8,23,0.45)]"
                        : "border-white/60 bg-white/60 shadow-[0_10px_40px_rgba(56,189,248,0.15)] dark:border-zinc-800/70 dark:bg-zinc-950/65 dark:shadow-[0_10px_40px_rgba(2,8,23,0.5)]"
                )}
            >
                <div className="flex h-16 items-center justify-between gap-3">
                    <Link to="/" className="inline-flex items-center gap-2.5 font-black tracking-tight text-zinc-900 dark:text-white">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-zinc-900 text-white dark:border dark:border-cyan-300/40 dark:bg-cyan-300/20 dark:text-cyan-100">
                            <Sparkles className="h-4 w-4" />
                        </span>
                        <span className="text-base sm:text-lg">Don-Moa | 돈모아</span>
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex">
                        {menus.map((menu) => {
                            const active = isActiveMenu(menu.to);
                            return (
                                <Link
                                    key={menu.name}
                                    to={menu.to}
                                    className={cn(
                                        "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                                        active
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                >
                                    {menu.name}
                                </Link>
                            );
                        })}
                    </nav>
                    <div className="hidden items-center gap-2 lg:flex">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="rounded-full text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-800"
                            onClick={toggleTheme}
                            aria-label={isDark ? "라이트 모드 전환" : "다크 모드 전환"}
                        >
                            {isDark ? <Sun className="h-4 w-4"/> : <Moon className="h-4 w-4"/>}
                        </Button>

                        <Button
                            asChild
                            variant="outline"
                            className="h-9 rounded-full border-zinc-300 bg-white/80 px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900/80 dark:text-zinc-100 dark:hover:bg-zinc-800"
                        >
                            <Link to="/cart">장바구니</Link>
                        </Button>
                        <Button
                            asChild
                            variant="ghost"
                            className="h-9 rounded-full px-4 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:text-zinc-100 dark:hover:bg-zinc-800"
                        >
                            <Link to="/my">마이페이지</Link>
                        </Button>

                        {isLoggedIn ? (
                            <UserNavigation hasNotifications={hasNotifications} hasMessages={hasMessages} />
                        ) : (
                            <AuthButtons />
                        )}
                    </div>

                    <button
                        type="button"
                        className="grid h-9 w-9 place-items-center rounded-full border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 lg:hidden"
                        aria-label="모바일 메뉴"
                        onClick={() => setMobileOpen((prev) => !prev)}
                    >
                        {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>

                <div
                    className={cn(
                        "overflow-hidden transition-[max-height,opacity,padding] duration-300 lg:hidden",
                        mobileOpen ? "max-h-[340px] pb-4 opacity-100" : "max-h-0 pb-0 opacity-0"
                    )}
                >
                    <div className="space-y-2 border-t border-zinc-200/70 pt-3 dark:border-zinc-700/70">
                        {menus.map((menu) => (
                            <Link
                                key={menu.name}
                                to={menu.to}
                                onClick={() => setMobileOpen(false)}
                                className={cn(
                                    "block rounded-xl px-3 py-2 text-sm font-semibold",
                                    isActiveMenu(menu.to)
                                        ? "bg-zinc-900 text-white dark:bg-cyan-400/20 dark:text-cyan-100"
                                        : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-white"
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
                                className="rounded-full border-zinc-300 bg-white px-4 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                                onClick={toggleTheme}
                            >
                                {isDark ? "라이트 모드" : "다크 모드"}
                            </Button>
                            <Button
                                asChild
                                size="sm"
                                className="rounded-full bg-zinc-900 px-4 text-white hover:bg-zinc-700 dark:bg-cyan-400/20 dark:text-cyan-100 dark:hover:bg-cyan-400/30"
                            >
                                <Link to="/cart" onClick={() => setMobileOpen(false)}>
                                    장바구니
                                </Link>
                            </Button>

                            {isLoggedIn ? (
                                <UserNavigation hasNotifications={hasNotifications} hasMessages={hasMessages} />
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
