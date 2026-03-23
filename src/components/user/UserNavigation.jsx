import { useMemo, useState } from "react";
import { Link } from "react-router";
import {
    BarChart3Icon,
    BellIcon,
    CheckCircle2,
    ExternalLink,
    LoaderCircle,
    LogOutIcon,
    MessageCircleIcon,
    SettingsIcon,
    UserIcon,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
    buildNotificationTargetPath,
    flattenNotificationPages,
    mapNotificationTypeLabel,
} from "@/domains/client/notifications/lib/notificationMappers";
import {
    useInfiniteNotificationsQuery,
    useMarkAllNotificationsReadMutation,
    useMarkNotificationReadMutation,
} from "@/domains/client/notifications/query/useNotificationQueries";

function formatBadgeCount(count) {
    const normalized = Number(count);

    if (!Number.isFinite(normalized) || normalized <= 0) {
        return "";
    }

    return normalized > 99 ? "99+" : String(normalized);
}

function NotificationDropdown({
    hasNotifications,
    onMarkRead,
    onMarkAllRead,
}) {
    const [open, setOpen] = useState(false);
    const notificationBadge = formatBadgeCount(hasNotifications);
    const notificationsPreviewQuery = useInfiniteNotificationsQuery({ size: 6 }, { enabled: open });
    const previewNotifications = useMemo(
        () => flattenNotificationPages(notificationsPreviewQuery.data?.pages).slice(0, 6),
        [notificationsPreviewQuery.data?.pages]
    );

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <BellIcon className="size-4" />
                    {notificationBadge ? (
                        <div className="absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-red-50">
                            {notificationBadge}
                        </div>
                    ) : null}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[360px] p-0">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div>
                        <p className="text-sm font-semibold text-foreground">최근 알림</p>
                        <p className="text-xs text-muted-foreground">미읽음 {Number(hasNotifications) || 0}건</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 rounded-full px-3 text-xs"
                        onClick={() => onMarkAllRead()}
                        disabled={(Number(hasNotifications) || 0) === 0}
                    >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        전체 읽음
                    </Button>
                </div>

                <div className="max-h-[360px] overflow-y-auto p-2">
                    {notificationsPreviewQuery.isPending ? (
                        <div className="space-y-2 p-2">
                            {[0, 1, 2].map((index) => (
                                <div key={`notification-preview-skeleton-${index}`} className="rounded-xl border border-border p-3">
                                    <div className="animate-pulse space-y-2">
                                        <div className="h-4 w-16 rounded bg-muted" />
                                        <div className="h-4 w-full rounded bg-muted" />
                                        <div className="h-3 w-4/5 rounded bg-muted" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : null}

                    {!notificationsPreviewQuery.isPending && notificationsPreviewQuery.isError ? (
                        <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                            알림을 불러오지 못했습니다.
                        </div>
                    ) : null}

                    {!notificationsPreviewQuery.isPending
                    && !notificationsPreviewQuery.isError
                    && previewNotifications.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                            아직 도착한 알림이 없습니다.
                        </div>
                    ) : null}

                    {!notificationsPreviewQuery.isPending
                    && !notificationsPreviewQuery.isError
                    && previewNotifications.length > 0 ? (
                        <div className="space-y-2">
                            {previewNotifications.map((notification) => {
                                const targetPath = buildNotificationTargetPath(notification) || "/my/notifications";

                                return (
                                    <Link
                                        key={notification.id}
                                        to={targetPath}
                                        className={`block rounded-xl border px-3 py-3 transition-colors ${
                                            notification.read
                                                ? "border-border bg-card hover:bg-accent/40"
                                                : "border-primary/20 bg-primary/5 hover:bg-primary/10"
                                        }`}
                                        onClick={() => {
                                            if (!notification.read) {
                                                onMarkRead(notification.id);
                                            }
                                            setOpen(false);
                                        }}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-xs font-semibold text-primary">
                                                {mapNotificationTypeLabel(notification.type)}
                                            </span>
                                            <span className="text-[11px] text-muted-foreground">
                                                {notification.relativeTimeLabel}
                                            </span>
                                        </div>
                                        <p className="mt-2 line-clamp-1 text-sm font-semibold text-foreground">
                                            {notification.title}
                                        </p>
                                        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                                            {notification.message}
                                        </p>
                                        <div className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                                            {notification.read ? "열기" : "읽고 열기"}
                                            <ExternalLink className="h-3 w-3" />
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : null}
                </div>

                <div className="flex items-center justify-between gap-2 border-t border-border p-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="rounded-full px-3"
                        onClick={() => notificationsPreviewQuery.refetch()}
                        disabled={notificationsPreviewQuery.isPending || notificationsPreviewQuery.isFetching}
                    >
                        {notificationsPreviewQuery.isFetching ? (
                            <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                        ) : null}
                        새로고침
                    </Button>
                    <Button asChild variant="outline" size="sm" className="rounded-full px-3">
                        <Link
                            to="/my/notifications"
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            전체 보기
                        </Link>
                    </Button>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function UserNavigation({
                                   hasNotifications,
                                   hasMessages,
                               }) {
    const messageBadge = formatBadgeCount(hasMessages);
    const markReadMutation = useMarkNotificationReadMutation();
    const markAllMutation = useMarkAllNotificationsReadMutation();

    return (
        <div className="flex items-center gap-2">
            <NotificationDropdown
                hasNotifications={hasNotifications}
                onMarkRead={(notificationId) => markReadMutation.mutate(notificationId)}
                onMarkAllRead={() => markAllMutation.mutate()}
            />

            <Button variant="ghost" size="icon" asChild className="relative">
                <Link to="/my/messages">
                    <MessageCircleIcon className="size-4" />
                    {messageBadge && (
                        <div className="absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-red-600 px-1.5 py-0.5 text-[10px] font-bold leading-none text-red-50">
                            {messageBadge}
                        </div>
                    )}
                </Link>
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Avatar>
                        <AvatarImage src="https://github.com/ANchangwan.png" />
                        <AvatarFallback>
                            <span className="text-xs">Loading...</span>
                        </AvatarFallback>
                    </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel className="flex flex-col gap-1">
                        <span className="font-medium">John Doe</span>
                        <span className="text-xs text-muted-foreground">@username</span>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link to="/my/dashboard">
                                <BarChart3Icon className="size-4 mr-2"></BarChart3Icon>
                                Dashboard
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link to="/my/profile">
                                <UserIcon className="size-4 mr-2" />
                                Profile
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link to="/my/settings">
                                <SettingsIcon className="size-4 mr-2" />
                                Settings
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="cursor-pointer">
                            <Link to="/my/logout">
                                <LogOutIcon className="size-4 mr-2" />
                                Logout
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
