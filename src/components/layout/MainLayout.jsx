import { Outlet } from "react-router";
import Header from "@/components/layout/Header.jsx";

function MainLayout() {
    return (
        <div className="app-shell relative min-h-screen">
            <div className="app-shell-glow pointer-events-none absolute inset-0" />

            <Header />
            <main className="relative mx-auto max-w-[1250px] px-4 pb-12 pt-24 sm:px-6 md:pb-16 md:pt-28">
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;
