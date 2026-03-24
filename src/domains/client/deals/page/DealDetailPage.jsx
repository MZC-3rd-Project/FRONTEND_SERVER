import { useCallback, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router";
import {
    AlertCircle,
    CheckCircle2,
    Flame,
    LoaderCircle,
    LogIn,
    PackageCheck,
    RefreshCw,
    Store,
    Timer,
} from "lucide-react";

import StickyStoreChat from "@/components/chat/StickyStoreChat.jsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Modal } from "@/components/ui/modal.jsx";
import { useAuthStore } from "@/common/store/useAuthStore.js";
import { encodeIdPathSegment } from "@/common/utils/id";
import { DEAL_IMAGE_PLACEHOLDER } from "@/domains/client/deals/lib/dealsMappers";
import { useHotDealQueueSse } from "@/domains/client/deals/hooks/useHotDealQueueSse.js";
import {
    useEnterHotDealQueueMutation,
    useHotDealDetailQuery,
    useHotDealQueueStatusQuery,
    usePurchaseHotDealMutation,
} from "@/domains/client/deals/query/useDealsQueries";

const HOT_DEAL_QUEUE_TOKEN_STORAGE_KEY_PREFIX = "hotdeal:queue-token:";
const ESTIMATED_QUEUE_SECONDS_PER_USER = 2;

function ratingText(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function getQueueStorage() {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        return window.sessionStorage;
    } catch {
        return null;
    }
}

function queueTokenStorageKey(hotDealId) {
    return `${HOT_DEAL_QUEUE_TOKEN_STORAGE_KEY_PREFIX}${hotDealId}`;
}

function readStoredQueueToken(hotDealId) {
    if (!hotDealId) {
        return "";
    }

    const storage = getQueueStorage();
    if (!storage) {
        return "";
    }

    try {
        return storage.getItem(queueTokenStorageKey(hotDealId)) ?? "";
    } catch {
        return "";
    }
}

function persistQueueToken(hotDealId, token) {
    if (!hotDealId) {
        return;
    }

    const storage = getQueueStorage();
    if (!storage) {
        return;
    }

    try {
        if (token) {
            storage.setItem(queueTokenStorageKey(hotDealId), token);
            return;
        }

        storage.removeItem(queueTokenStorageKey(hotDealId));
    } catch {
        // Ignore storage failures and keep the queue flow in-memory.
    }
}

function estimateWaitSeconds(position) {
    const normalizedPosition = Number(position);

    if (!Number.isFinite(normalizedPosition) || normalizedPosition <= 0) {
        return 0;
    }

    return normalizedPosition * ESTIMATED_QUEUE_SECONDS_PER_USER;
}

function formatWaitLabel(totalSeconds) {
    const normalizedSeconds = Number(totalSeconds);

    if (!Number.isFinite(normalizedSeconds) || normalizedSeconds <= 0) {
        return "곧 구매 가능합니다.";
    }

    if (normalizedSeconds < 60) {
        return `약 ${normalizedSeconds}초 남음`;
    }

    const minutes = Math.floor(normalizedSeconds / 60);
    const seconds = normalizedSeconds % 60;
    return `약 ${minutes}분 ${seconds}초 남음`;
}

function formatDateTimeText(value) {
    if (!value) {
        return "시간 정보 없음";
    }

    const date = new Date(String(value).replace(" ", "T"));
    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return date.toLocaleString("ko-KR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function DealDetailSkeleton() {
    return (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <div className="order-2 space-y-6 lg:order-1">
                <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                        <div className="h-56 animate-pulse rounded-2xl bg-muted sm:h-64" />
                        <div className="space-y-3">
                            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                            <div className="h-8 w-3/4 animate-pulse rounded bg-muted" />
                            <div className="h-4 w-full animate-pulse rounded bg-muted" />
                            <div className="h-20 w-full animate-pulse rounded-2xl bg-muted" />
                        </div>
                    </div>
                </section>
                <Card className="h-48 animate-pulse bg-card" />
                <Card className="h-48 animate-pulse bg-card" />
            </div>
            <aside className="order-1 lg:order-2">
                <Card className="h-48 animate-pulse bg-card" />
            </aside>
        </div>
    );
}

function renderProductImage(imageUrl, title, className) {
    if (!imageUrl) {
        return (
            <div className={`${className} grid place-items-center rounded-2xl bg-muted text-sm text-muted-foreground`}>
                이미지 준비 중
            </div>
        );
    }

    return <img src={imageUrl} alt={title} className={className} />;
}

function DealDetailContent({ dealId, searchParams }) {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const itemId = searchParams.get("itemId") ?? "";
    const itemType = searchParams.get("itemType") ?? "PRODUCT";
    const { data: deal, isLoading, isError, error, refetch, isFetching } = useHotDealDetailQuery({
        hotDealId: dealId,
        itemId,
        itemType,
    });
    const enterQueueMutation = useEnterHotDealQueueMutation();
    const purchaseMutation = usePurchaseHotDealMutation();

    const [queueToken, setQueueToken] = useState(() => readStoredQueueToken(dealId));
    const [queueSnapshot, setQueueSnapshot] = useState({
        position: null,
        canPurchase: false,
        estimatedWaitSeconds: null,
    });
    const [isQueueModalOpen, setQueueModalOpen] = useState(false);
    const [queueFeedback, setQueueFeedback] = useState(null);
    const [purchaseResult, setPurchaseResult] = useState(null);

    const queueStatusQuery = useHotDealQueueStatusQuery(deal?.hotDealId, {
        enabled: isAuthenticated && Boolean(queueToken) && Boolean(deal?.hotDealId) && !purchaseResult,
        refetchInterval: (query) => {
            if (!isAuthenticated || !queueToken || purchaseResult) {
                return false;
            }

            if (query.state.error?.status === 401) {
                return false;
            }

            return query.state.data?.canPurchase ? false : 5_000;
        },
    });
    const queueSessionExpired = queueStatusQuery.error?.status === 401;
    const activeQueueToken = queueSessionExpired ? "" : queueToken;
    const effectiveQueueState = useMemo(() => {
        if (queueSessionExpired) {
            return {
                position: null,
                canPurchase: false,
                estimatedWaitSeconds: null,
            };
        }

        if (queueStatusQuery.data) {
            return {
                position: queueStatusQuery.data.position,
                canPurchase: queueStatusQuery.data.canPurchase,
                estimatedWaitSeconds: queueStatusQuery.data.canPurchase
                    ? 0
                    : estimateWaitSeconds(queueStatusQuery.data.position),
            };
        }

        return queueSnapshot;
    }, [queueSessionExpired, queueSnapshot, queueStatusQuery.data]);

    const handleQueueStatusEvent = useCallback((payload, eventName) => {
        if (eventName === "queue-connected") {
            return;
        }

        const nextPosition = typeof payload?.position === "number" ? payload.position : null;
        const nextCanPurchase = Boolean(payload?.canPurchase);

        setQueueSnapshot({
            position: nextPosition,
            canPurchase: nextCanPurchase,
            estimatedWaitSeconds: nextCanPurchase ? 0 : estimateWaitSeconds(nextPosition),
        });

        if (eventName === "queue-admitted" || nextCanPurchase) {
            setQueueModalOpen(true);
            setQueueFeedback({
                type: "success",
                message: "구매 차례가 되었습니다. 지금 바로 구매하세요.",
            });
        }
    }, []);

    useHotDealQueueSse({
        hotDealId: deal?.hotDealId,
        enabled: isAuthenticated && Boolean(activeQueueToken) && Boolean(deal?.hotDealId) && !purchaseResult,
        onStatus: handleQueueStatusEvent,
    });

    if (isLoading) {
        return <DealDetailSkeleton />;
    }

    if (isError) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>핫딜 상품을 불러오지 못했습니다</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>상세 조회 실패</AlertTitle>
                            <AlertDescription>{error?.message ?? "잠시 후 다시 시도해 주세요."}</AlertDescription>
                        </Alert>
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" onClick={() => refetch()} disabled={isFetching}>
                                <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                                다시 시도
                            </Button>
                            <Button asChild variant="outline">
                                <Link to="/deals">핫딜 목록으로 이동</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!deal) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>핫딜 상품을 찾을 수 없습니다</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="rounded-full px-5">
                            <Link to="/deals">핫딜 목록으로 이동</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const product = deal.item;
    const store = deal.store;
    const reviews = deal.reviews;
    const loginRedirectPath = `/deals/${encodeIdPathSegment(deal.hotDealId)}${itemId ? `?itemId=${encodeURIComponent(itemId)}&itemType=${encodeURIComponent(itemType)}` : ""}`;
    const dealOpenForQueue = deal.canPurchase;
    const isWaitingInQueue = Boolean(activeQueueToken) && !effectiveQueueState.canPurchase && !purchaseResult;
    const canRequestPurchase = Boolean(activeQueueToken) && effectiveQueueState.canPurchase && !purchaseResult;
    const actionBusy = enterQueueMutation.isPending || purchaseMutation.isPending;
    const queueStatusMessage = queueSessionExpired
        ? "대기열 세션이 만료되었습니다. 다시 입장해 주세요."
        : queueStatusQuery.error?.status && queueStatusQuery.error?.status !== 401
            ? (queueStatusQuery.error?.message ?? "대기열 상태를 확인하지 못했습니다.")
            : "";
    const shouldShowQueueModal = (Boolean(activeQueueToken) || Boolean(purchaseResult)) && isQueueModalOpen;
    const queueModalTitle = purchaseResult
        ? "핫딜 주문 접수 완료"
        : canRequestPurchase
            ? "구매 차례입니다"
            : "핫딜 대기열";
    const queueModalDescription = purchaseResult
        ? "주문 번호와 유효 시간을 확인한 뒤 주문 상세로 이동하세요."
        : canRequestPurchase
            ? "지금 구매 버튼이 열려 있습니다. 기회를 놓치지 말고 바로 진행하세요."
            : "순번과 예상 대기 시간을 크게 보여드립니다.";

    const handleEnterQueue = async () => {
        if (!deal?.hotDealId) {
            return;
        }

        setQueueFeedback(null);
        setPurchaseResult(null);

        try {
            const response = await enterQueueMutation.mutateAsync(deal.hotDealId);
            const nextToken = response?.token ?? "";

            setQueueToken(nextToken);
            persistQueueToken(deal.hotDealId, nextToken);
            setQueueSnapshot({
                position: response?.position ?? null,
                canPurchase: (response?.position ?? null) === 0,
                estimatedWaitSeconds:
                    typeof response?.estimatedWaitSeconds === "number"
                        ? response.estimatedWaitSeconds
                        : estimateWaitSeconds(response?.position),
            });
            setQueueFeedback({
                type: (response?.position ?? null) === 0 ? "success" : "default",
                message:
                    (response?.position ?? null) === 0
                        ? "바로 구매 가능한 상태입니다."
                        : "핫딜 대기열에 진입했습니다.",
            });
            setQueueModalOpen(true);
        } catch (queueError) {
            setQueueFeedback({
                type: "error",
                message: queueError?.message ?? "핫딜 대기열 입장에 실패했습니다.",
            });
        }
    };

    const handlePurchase = async () => {
        if (!deal?.hotDealId) {
            return;
        }

        setQueueFeedback(null);

        try {
            const result = await purchaseMutation.mutateAsync({
                hotDealId: deal.hotDealId,
                payload: {
                    quantity: 1,
                    token: queueToken || undefined,
                },
            });

            persistQueueToken(deal.hotDealId, "");
            setQueueToken("");
            setQueueSnapshot({
                position: null,
                canPurchase: false,
                estimatedWaitSeconds: null,
            });
            setPurchaseResult(result);
            setQueueModalOpen(true);
            setQueueFeedback({
                type: "success",
                message: "핫딜 주문이 접수되었습니다.",
            });
            void refetch();
        } catch (purchaseError) {
            setQueueFeedback({
                type: "error",
                message: purchaseError?.message ?? "핫딜 구매 요청에 실패했습니다.",
            });

            if (purchaseError?.status === 401 || purchaseError?.status === 403) {
                void queueStatusQuery.refetch();
            }
        }
    };

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <Modal
                open={shouldShowQueueModal}
                onClose={() => setQueueModalOpen(false)}
                title={queueModalTitle}
                description={queueModalDescription}
                className="max-w-2xl"
            >
                <div className="space-y-5">
                    {purchaseResult ? (
                        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-emerald-900">
                            <p className="text-sm font-semibold uppercase tracking-[0.18em]">Hot Deal Success</p>
                            <p className="mt-3 text-3xl font-black">{purchaseResult.orderId}</p>
                            <p className="mt-2 text-sm">주문 유효시간 {formatDateTimeText(purchaseResult.expiresAt)}</p>
                        </div>
                    ) : (
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-3xl border border-border bg-card p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">현재 순번</p>
                                <p className="mt-3 text-4xl font-black text-foreground">
                                    {effectiveQueueState.position ?? 0}
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    {canRequestPurchase ? "지금 바로 구매 가능합니다." : "0이면 구매 허용 상태입니다."}
                                </p>
                            </div>
                            <div className="rounded-3xl border border-border bg-card p-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">예상 대기</p>
                                <p className="mt-3 text-2xl font-black text-foreground">
                                    {formatWaitLabel(effectiveQueueState.estimatedWaitSeconds)}
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    SSE와 상태 조회가 동시에 갱신됩니다.
                                </p>
                            </div>
                        </div>
                    )}

                    {queueStatusMessage ? (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>대기열 상태 확인 실패</AlertTitle>
                            <AlertDescription>{queueStatusMessage}</AlertDescription>
                        </Alert>
                    ) : null}

                    {queueFeedback ? (
                        <Alert variant={queueFeedback.type === "error" ? "destructive" : "default"}>
                            {queueFeedback.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4" />}
                            <AlertTitle>{queueFeedback.type === "error" ? "대기열 처리 실패" : "대기열 상태"}</AlertTitle>
                            <AlertDescription>{queueFeedback.message}</AlertDescription>
                        </Alert>
                    ) : null}

                    <div className="flex flex-wrap gap-2">
                        {canRequestPurchase ? (
                            <Button
                                type="button"
                                onClick={handlePurchase}
                                disabled={actionBusy}
                                className="rounded-full px-5"
                            >
                                {purchaseMutation.isPending ? (
                                    <LoaderCircle className="h-4 w-4 animate-spin" />
                                ) : (
                                    <CheckCircle2 className="h-4 w-4" />
                                )}
                                {purchaseMutation.isPending ? "구매 요청 중..." : "핫딜 1개 구매하기"}
                            </Button>
                        ) : null}

                        {purchaseResult?.orderId ? (
                            <Button asChild variant="outline" className="rounded-full px-5">
                                <Link to={`/my/orders/${encodeIdPathSegment(purchaseResult.orderId)}`}>
                                    주문 상세 보기
                                </Link>
                            </Button>
                        ) : null}

                        <Button
                            type="button"
                            variant="outline"
                            className="rounded-full px-5"
                            onClick={() => {
                                if (activeQueueToken) {
                                    void queueStatusQuery.refetch();
                                }
                                setQueueModalOpen(false);
                            }}
                            disabled={queueStatusQuery.isFetching}
                        >
                            <RefreshCw className={`h-4 w-4 ${queueStatusQuery.isFetching ? "animate-spin" : ""}`} />
                            상태 다시 확인
                        </Button>
                    </div>
                </div>
            </Modal>

            <div className="order-2 space-y-6 lg:order-1">
                <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <div className="grid gap-5 md:grid-cols-[1.1fr_0.9fr]">
                        {renderProductImage(
                            product.thumbnailUrl || deal.thumbnailUrl || DEAL_IMAGE_PLACEHOLDER,
                            product.title,
                            "h-56 w-full rounded-2xl object-cover sm:h-64"
                        )}
                        <div className="space-y-3">
                            <p className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-destructive">
                                <Flame className="h-3.5 w-3.5" />
                                Hot Deal Product
                            </p>
                            <h2 className="text-2xl font-black tracking-tight text-foreground">{product.title}</h2>
                            <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="destructive">{deal.discountLabel}</Badge>
                                <Badge>{deal.status}</Badge>
                                <Badge variant="outline">{deal.category}</Badge>
                            </div>
                            {store.name ? <p className="text-sm text-muted-foreground">판매 스토어: {store.name}</p> : null}
                            <p className="text-sm text-muted-foreground">{deal.summary}</p>

                            <div className="rounded-2xl border border-border bg-accent/40 p-3">
                                <p className="text-xs text-muted-foreground">핫딜 가격</p>
                                {deal.originalPrice ? (
                                    <p className="text-xs text-muted-foreground line-through">{deal.originalPriceText}</p>
                                ) : null}
                                <p className="text-2xl font-bold text-foreground">{deal.discountedPriceText}</p>
                                <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                                    <Timer className="h-3.5 w-3.5" />
                                    남은 시간 {deal.leftLabel} · 할인율 {deal.discountLabel}
                                </p>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    남은 수량 {deal.remainingQuantity.toLocaleString()}개 · 판매 {deal.soldQuantity.toLocaleString()}개
                                </p>
                                {deal.maxPerUser ? (
                                    <p className="mt-1 text-xs text-muted-foreground">1인당 최대 {deal.maxPerUser}개 구매 가능</p>
                                ) : null}
                            </div>

                            {queueFeedback ? (
                                <Alert variant={queueFeedback.type === "error" ? "destructive" : "default"}>
                                    {queueFeedback.type === "error" ? (
                                        <AlertCircle className="h-4 w-4" />
                                    ) : (
                                        <CheckCircle2 className="h-4 w-4" />
                                    )}
                                    <AlertTitle>{queueFeedback.type === "error" ? "대기열 처리 실패" : "대기열 상태"}</AlertTitle>
                                    <AlertDescription>{queueFeedback.message}</AlertDescription>
                                </Alert>
                            ) : null}

                            <div className="flex flex-wrap gap-2 pt-1">
                                {!isAuthenticated ? (
                                    <Button asChild className="rounded-full px-5">
                                        <Link to={`/auth/login?redirect=${encodeURIComponent(loginRedirectPath)}`}>
                                            <LogIn className="h-4 w-4" />
                                            로그인하고 대기열 입장
                                        </Link>
                                    </Button>
                                ) : null}

                                {isAuthenticated && dealOpenForQueue && !activeQueueToken && !purchaseResult ? (
                                    <Button
                                        type="button"
                                        onClick={handleEnterQueue}
                                        disabled={actionBusy}
                                        className="rounded-full px-5"
                                    >
                                        {enterQueueMutation.isPending ? (
                                            <LoaderCircle className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Flame className="h-4 w-4" />
                                        )}
                                        {enterQueueMutation.isPending ? "입장 중..." : "대기열 입장"}
                                    </Button>
                                ) : null}

                                {isAuthenticated && canRequestPurchase ? (
                                    <Button
                                        type="button"
                                        onClick={() => setQueueModalOpen(true)}
                                        disabled={actionBusy}
                                        className="rounded-full px-5"
                                    >
                                        <CheckCircle2 className="h-4 w-4" />
                                        구매 차례 확인
                                    </Button>
                                ) : null}

                                {isAuthenticated && isWaitingInQueue ? (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="rounded-full px-5"
                                        onClick={() => setQueueModalOpen(true)}
                                    >
                                        <Timer className="h-4 w-4" />
                                        대기열 상태 보기
                                    </Button>
                                ) : null}

                                {isAuthenticated && !dealOpenForQueue ? (
                                    <Button disabled className="rounded-full px-5">구매 불가</Button>
                                ) : null}

                                <Button
                                    type="button"
                                    variant="outline"
                                    className="rounded-full px-5"
                                    onClick={() => {
                                        void refetch();
                                        if (activeQueueToken) {
                                            void queueStatusQuery.refetch();
                                        }
                                    }}
                                    disabled={isFetching || queueStatusQuery.isFetching}
                                >
                                    <RefreshCw
                                        className={`h-4 w-4 ${(isFetching || queueStatusQuery.isFetching) ? "animate-spin" : ""}`}
                                    />
                                    상태 새로고침
                                </Button>
                                <Button asChild variant="ghost" className="rounded-full px-5">
                                    <Link to="/deals">목록으로</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </section>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">상품 핵심 포인트</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-muted-foreground">
                        {product.features.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {product.features.map((feature) => (
                                    <Badge key={feature} variant="outline">{feature}</Badge>
                                ))}
                            </div>
                        ) : (
                            <p>등록된 핵심 포인트가 없습니다.</p>
                        )}
                    </CardContent>
                </Card>

                <section className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary">Product Story</p>
                        <h3 className="mt-1 text-xl font-bold text-foreground">상품 상세 소개</h3>
                    </div>
                    {product.detailSections.length > 0 ? (
                        product.detailSections.map((section) => (
                            <Card key={section.id} className="overflow-hidden">
                                {renderProductImage(
                                    section.image || DEAL_IMAGE_PLACEHOLDER,
                                    section.title,
                                    "h-64 w-full object-cover sm:h-80"
                                )}
                                <CardContent className="space-y-3 pt-5">
                                    <h4 className="text-lg font-bold text-foreground">{section.title}</h4>
                                    <p className="text-sm text-muted-foreground">{section.description}</p>
                                    {section.highlights.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {section.highlights.map((highlight) => (
                                                <Badge key={highlight} variant="outline">{highlight}</Badge>
                                            ))}
                                        </div>
                                    ) : null}
                                </CardContent>
                            </Card>
                        ))
                    ) : (
                        <Card>
                            <CardContent className="pt-6 text-sm text-muted-foreground">
                                상품 상세 소개는 준비 중입니다.
                            </CardContent>
                        </Card>
                    )}
                </section>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <PackageCheck className="h-4 w-4 text-primary" />
                            구매 후기
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review.id} className="rounded-xl border border-border bg-accent/40 p-3 text-sm">
                                    <p className="font-semibold text-foreground">
                                        {review.user} <span className="ml-1 text-yellow-400">{ratingText(review.rating)}</span>
                                    </p>
                                    <p className="mt-1 text-muted-foreground">{review.comment}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-sm text-muted-foreground">등록된 구매 후기가 없습니다.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Store className="h-4 w-4 text-primary" />
                            핫딜 안내
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-xs text-muted-foreground">
                        {store.name ? <p>{store.name}</p> : null}
                        {store.tagline ? <p>{store.tagline}</p> : null}
                        <p>핫딜은 대기열 순서에 따라 구매 차례가 열립니다.</p>
                        <p>현재 재고 {deal.stock.availableQuantity.toLocaleString()}개 기준으로 입장 인원이 조절됩니다.</p>
                        <p>구매 허용 후 일정 시간 안에 주문을 완료해야 기회를 유지할 수 있습니다.</p>
                    </CardContent>
                </Card>
                <div className="mt-4">
                    <StickyStoreChat
                        storeName={store.name || "스토어"}
                        itemId={deal.itemId}
                    />
                </div>
            </aside>
        </div>
    );
}

export default function DealDetailPage() {
    const { dealId } = useParams();
    const [searchParams] = useSearchParams();

    return (
        <DealDetailContent
            key={dealId ?? "deal"}
            dealId={dealId}
            searchParams={searchParams}
        />
    );
}
