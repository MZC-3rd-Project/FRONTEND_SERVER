import { Outlet } from "react-router";

import { useAuthBootstrap } from "@/common/hooks/useAuthBootstrap.js";
import { useAuthStore } from "@/common/store/useAuthStore.js";
import Header from "@/components/layout/Header.jsx";
import { useNotificationSse } from "@/domains/client/notifications/hooks/useNotificationSse";
import { useNotificationUnreadCountQuery } from "@/domains/client/notifications/query/useNotificationQueries";

function MainLayout() {
    useAuthBootstrap();
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const unreadCountQuery = useNotificationUnreadCountQuery({ enabled: isAuthenticated });
    useNotificationSse({ enabled: isAuthenticated && unreadCountQuery.isSuccess });

    return (
        <div className="app-shell relative min-h-screen">
            <div className="app-shell-glow pointer-events-none absolute inset-0" />

            <Header
                isLoggedIn={isAuthenticated}
                hasNotifications={isAuthenticated ? (unreadCountQuery.data?.unreadCount ?? 0) : 0}
            />
            <main className="relative mx-auto max-w-[1250px] px-4 pb-12 pt-24 sm:px-6 md:pb-16 md:pt-28">
                <Outlet />
            </main>
        </div>
    );
}

export default MainLayout;
