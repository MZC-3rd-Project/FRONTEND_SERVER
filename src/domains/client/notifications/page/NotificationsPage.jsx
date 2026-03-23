import { useMemo } from "react";
import { Link } from "react-router";
import {
    BellRing,
    CheckCircle2,
    ExternalLink,
    LoaderCircle,
    LogIn,
    RefreshCw,
    Trash2,
} from "lucide-react";

import { useInfiniteScrollTrigger } from "@/common/hooks/useInfiniteScrollTrigger";
import InfiniteListFooter from "@/components/search/InfiniteListFooter.jsx";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty.tsx";
import {
    buildNotificationTargetPath,
    flattenNotificationPages,
    mapNotificationChannelLabel,
    mapNotificationTypeLabel,
} from "@/domains/client/notifications/lib/notificationMappers";
import {
    useDeleteNotificationMutation,
    useInfiniteNotificationsQuery,
    useMarkAllNotificationsReadMutation,
    useMarkNotificationReadMutation,
    useNotificationUnreadCountQuery,
} from "@/domains/client/notifications/query/useNotificationQueries";

function NotificationSkeletonList() {
    return (
        <div className="space-y-2">
            {[0, 1, 2, 3].map((index) => (
                <div key={`notification-skeleton-${index}`} className="rounded-2xl border border-border bg-card p-4">
                    <div className="animate-pulse space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <div className="h-5 w-20 rounded-full bg-muted" />
                            <div className="h-4 w-16 rounded bg-muted" />
                        </div>
                        <div className="h-4 w-40 rounded bg-muted" />
                        <div className="h-3 w-full rounded bg-muted" />
                        <div className="h-3 w-4/5 rounded bg-muted" />
                    </div>
                </div>
            ))}
        </div>
    );
}

function NotificationCard({
    notification,
    onMarkRead,
    onDelete,
    isMarkingRead,
    isDeleting,
}) {
    const targetPath = buildNotificationTargetPath(notification);

    return (
        <div
            className={`rounded-2xl border px-4 py-4 text-sm transition-colors ${
                notification.read
                    ? "border-border bg-card"
                    : "border-primary/20 bg-primary/5"
            }`}
        >
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={notification.read ? "outline" : "default"}>
                        {mapNotificationTypeLabel(notification.type)}
                    </Badge>
                    <Badge variant="outline">{mapNotificationChannelLabel(notification.channel)}</Badge>
                    {!notification.read ? (
                        <span className="text-xs font-semibold text-primary">미읽음</span>
                    ) : null}
                </div>
                <span className="text-xs text-muted-foreground">{notification.relativeTimeLabel}</span>
            </div>

            <div className="mt-3 space-y-1">
                <p className="font-semibold text-foreground">{notification.title}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{notification.message}</p>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
                {targetPath ? (
                    <Button asChild variant="ghost" size="sm" className="rounded-full px-3">
                        <Link
                            to={targetPath}
                            onClick={() => {
                                if (!notification.read) {
                                    onMarkRead(notification.id);
                                }
                            }}
                        >
                            바로가기
                            <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                    </Button>
                ) : null}

                {!notification.read ? (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="rounded-full px-3"
                        onClick={() => onMarkRead(notification.id)}
                        disabled={isMarkingRead}
                    >
                        {isMarkingRead ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                        읽음
                    </Button>
                ) : null}

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full px-3"
                    onClick={() => onDelete(notification.id)}
                    disabled={isDeleting}
                >
                    {isDeleting ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    삭제
                </Button>
            </div>
        </div>
    );
}

function NotificationsPage() {
    const notificationsQuery = useInfiniteNotificationsQuery({ size: 20 });
    const unreadCountQuery = useNotificationUnreadCountQuery();
    const markReadMutation = useMarkNotificationReadMutation();
    const markAllMutation = useMarkAllNotificationsReadMutation();
    const deleteMutation = useDeleteNotificationMutation();

    const notifications = useMemo(
        () => flattenNotificationPages(notificationsQuery.data?.pages),
        [notificationsQuery.data?.pages]
    );
    const unreadCount = unreadCountQuery.data?.unreadCount ?? 0;
    const isUnauthorized = notificationsQuery.error?.status === 401;
    const actionError =
        markReadMutation.error?.message
        || markAllMutation.error?.message
        || deleteMutation.error?.message
        || "";

    const sentinelRef = useInfiniteScrollTrigger({
        enabled: notificationsQuery.hasNextPage && !notificationsQuery.isFetchingNextPage,
        onIntersect: () => notificationsQuery.fetchNextPage(),
    });

    const handleMarkRead = (notificationId) => {
        markReadMutation.mutate(notificationId);
    };

    const handleDelete = (notificationId) => {
        deleteMutation.mutate(notificationId);
    };

    return (
        <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Notifications</p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">알림 센터</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    주문, 펀딩, 채팅, 재고 알림을 한곳에서 확인하고 바로 처리하세요.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <Badge variant={unreadCount > 0 ? "default" : "outline"}>
                        미읽음 {unreadCount}건
                    </Badge>
                    <Badge variant="outline">실시간 SSE 연동</Badge>
                </div>
            </section>

            {actionError ? (
                <Alert variant="destructive">
                    <AlertTitle>알림 작업 실패</AlertTitle>
                    <AlertDescription>{actionError}</AlertDescription>
                </Alert>
            ) : null}

            {isUnauthorized ? (
                <Alert>
                    <LogIn className="h-4 w-4" />
                    <AlertTitle>로그인이 필요합니다</AlertTitle>
                    <AlertDescription className="space-y-3">
                        <p>알림 이력과 실시간 알림은 로그인 후 확인할 수 있습니다.</p>
                        <Button asChild size="sm" className="rounded-full">
                            <Link to={`/auth/login?redirect=${encodeURIComponent("/my/notifications")}`}>
                                로그인하러 가기
                            </Link>
                        </Button>
                    </AlertDescription>
                </Alert>
            ) : null}

            {!isUnauthorized ? (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between gap-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <BellRing className="h-4 w-4 text-primary" />
                            최근 알림
                        </CardTitle>
                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-full px-4 text-xs"
                                onClick={() => notificationsQuery.refetch()}
                                disabled={notificationsQuery.isPending || notificationsQuery.isFetching}
                            >
                                <RefreshCw className={`h-3.5 w-3.5 ${notificationsQuery.isFetching ? "animate-spin" : ""}`} />
                                새로고침
                            </Button>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="rounded-full px-4 text-xs"
                                onClick={() => markAllMutation.mutate()}
                                disabled={unreadCount === 0 || markAllMutation.isPending}
                            >
                                {markAllMutation.isPending ? (
                                    <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                )}
                                전체 읽음
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {notificationsQuery.isPending ? <NotificationSkeletonList /> : null}

                        {!notificationsQuery.isPending && notificationsQuery.isError ? (
                            <Alert variant="destructive">
                                <AlertTitle>알림 목록을 불러오지 못했습니다</AlertTitle>
                                <AlertDescription>
                                    {notificationsQuery.error?.message ?? "잠시 후 다시 시도해 주세요."}
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        {!notificationsQuery.isPending && !notificationsQuery.isError && notifications.length === 0 ? (
                            <Empty className="rounded-3xl border border-dashed border-border bg-muted/30">
                                <EmptyHeader>
                                    <EmptyMedia variant="icon">
                                        <BellRing />
                                    </EmptyMedia>
                                    <EmptyTitle>도착한 알림이 없습니다</EmptyTitle>
                                    <EmptyDescription>
                                        새 주문, 펀딩 상태, 채팅 답변이 생기면 이곳에 순서대로 쌓입니다.
                                    </EmptyDescription>
                                </EmptyHeader>
                                <EmptyContent>
                                    <Button asChild variant="outline" className="rounded-full">
                                        <Link to="/">둘러보러 가기</Link>
                                    </Button>
                                </EmptyContent>
                            </Empty>
                        ) : null}

                        {!notificationsQuery.isPending && !notificationsQuery.isError && notifications.length > 0 ? (
                            <>
                                <div className="space-y-2">
                                    {notifications.map((notification) => (
                                        <NotificationCard
                                            key={notification.id}
                                            notification={notification}
                                            onMarkRead={handleMarkRead}
                                            onDelete={handleDelete}
                                            isMarkingRead={
                                                markReadMutation.isPending
                                                && String(markReadMutation.variables) === notification.id
                                            }
                                            isDeleting={
                                                deleteMutation.isPending
                                                && String(deleteMutation.variables) === notification.id
                                            }
                                        />
                                    ))}
                                </div>

                                <InfiniteListFooter
                                    sentinelRef={sentinelRef}
                                    hasNextPage={notificationsQuery.hasNextPage}
                                    isFetchingNextPage={notificationsQuery.isFetchingNextPage}
                                    endMessage="알림을 모두 확인했습니다."
                                />
                            </>
                        ) : null}
                    </CardContent>
                </Card>
            ) : null}
        </div>
    );
}

export default NotificationsPage;
