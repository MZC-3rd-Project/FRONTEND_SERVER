import { useMemo, useState } from "react";
import { Link } from "react-router";
import { Calendar, MapPin, Package, Sparkles, Star, Ticket } from "lucide-react";

import { Modal } from "@/components/ui/modal.jsx";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { encodeIdPathSegment, toIdString } from "@/common/utils/id";
import { formatPrice, parsePriceText } from "@/domains/client/common/utils/format.js";
import { resolveStorePreviewProduct, mapStoreItemRouteProductType } from "@/domains/client/store/lib/storeProductPreview";
import { STORE_IMAGE_PLACEHOLDER } from "@/domains/client/store/lib/storeMappers";

function ratingText(rating) {
    return "★".repeat(rating) + "☆".repeat(5 - rating);
}

function StoreProductPreviewModal({ item, store, open, onClose }) {
    const preview = useMemo(
        () => (item && store ? resolveStorePreviewProduct(store, item) : null),
        [item, store]
    );
    const isTicket = preview?.productType === "ticket";
    const product = preview?.product;
    const tiers = product?.tiers ?? [];
    const [selectedTierGrade, setSelectedTierGrade] = useState("");
    const [ticketQuantity, setTicketQuantity] = useState(1);

    const resolvedTierGrade =
        tiers.find((tier) => tier.grade === selectedTierGrade)?.grade ??
        tiers[0]?.grade ??
        "";
    const selectedTier = isTicket
        ? tiers.find((tier) => tier.grade === resolvedTierGrade) ?? null
        : null;
    const maxTicketQuantity = isTicket ? Math.min(8, Math.max(0, selectedTier?.remaining ?? 0)) : 1;
    const safeTicketQuantity = isTicket
        ? maxTicketQuantity > 0
            ? Math.min(Math.max(ticketQuantity, 1), maxTicketQuantity)
            : 0
        : 1;
    const selectedTierPrice = selectedTier ? parsePriceText(selectedTier.price) : 0;
    const estimatedTicketAmount = selectedTierPrice * safeTicketQuantity;

    if (!preview || !product) {
        return null;
    }

    const routeProductType = mapStoreItemRouteProductType(item?.itemType);
    const resolvedStoreId = toIdString(preview.store.id);
    const resolvedProductId = toIdString(product.id);
    const ticketQuery = isTicket && selectedTier ? `&ticketGrade=${encodeURIComponent(selectedTier.grade)}` : "";
    const quantityQuery = isTicket && safeTicketQuantity > 0 ? `&ticketQuantity=${safeTicketQuantity}` : "";
    const directCheckoutLink = `/checkout?mode=direct&storeId=${encodeURIComponent(resolvedStoreId)}&productType=${encodeURIComponent(preview.productType)}&productId=${encodeURIComponent(resolvedProductId)}${ticketQuery}${quantityQuery}`;
    const detailLink = `/store/${encodeIdPathSegment(resolvedStoreId)}/product/${routeProductType}/${encodeIdPathSegment(resolvedProductId)}`;
    const previewDescription = preview.isSummaryFallback
        ? "스토어 응답 기준의 요약 정보로 빠르게 확인할 수 있게 구성했습니다."
        : "페이지 이동 없이 상품 핵심 정보와 구매 동선을 먼저 확인할 수 있습니다.";

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={product.name}
            description={previewDescription}
            className="max-w-6xl"
        >
            <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                <div className="space-y-5">
                    <section className="relative overflow-hidden rounded-[1.75rem] border border-border/70 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.15),_transparent_42%),linear-gradient(135deg,rgba(255,255,255,0.96),rgba(248,250,252,0.94))] p-5 dark:bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.2),_transparent_40%),linear-gradient(135deg,rgba(10,10,10,0.96),rgba(24,24,27,0.94))] sm:p-6">
                        <div className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
                            <img
                                src={product.thumbnail || STORE_IMAGE_PLACEHOLDER}
                                alt={product.name}
                                className="h-56 w-full rounded-[1.5rem] object-cover shadow-[0_18px_48px_rgba(15,23,42,0.18)] sm:h-72"
                            />
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant="outline">{item?.itemTypeLabel ?? product.category}</Badge>
                                    <Badge variant="secondary">{item?.status ?? product.status}</Badge>
                                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100/80 px-2.5 py-1 text-[11px] font-semibold text-amber-900 dark:bg-amber-300/15 dark:text-amber-100">
                                        <Sparkles className="h-3 w-3" />
                                        Quick Preview
                                    </span>
                                </div>

                                <div>
                                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700 dark:text-cyan-300">
                                        {isTicket ? "Ticket Preview" : "Product Preview"}
                                    </p>
                                    <h3 className="mt-2 text-2xl font-black tracking-tight text-foreground">{product.name}</h3>
                                    <p className="mt-2 text-sm text-muted-foreground">{preview.store.name}</p>
                                </div>

                                {isTicket ? (
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <p className="inline-flex items-center gap-1.5">
                                            <Calendar className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                                            {product.eventDate}
                                        </p>
                                        <p className="inline-flex items-center gap-1.5">
                                            <MapPin className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                                            {product.venue}
                                        </p>
                                        <p className="rounded-2xl border border-cyan-200/70 bg-cyan-50/80 px-3 py-2 text-xs text-cyan-900 dark:border-cyan-300/20 dark:bg-cyan-400/10 dark:text-cyan-100">
                                            현재 선택 좌석 {selectedTier?.grade ?? "-"} · {safeTicketQuantity}매 · 예상 {formatPrice(estimatedTicketAmount)}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <p className="text-2xl font-black text-foreground">{product.price}</p>
                                        <p>{product.stock !== null ? `재고 ${product.stock}개 · ${product.status}` : product.status}</p>
                                        <p>{product.category}</p>
                                    </div>
                                )}

                                <div className="flex flex-wrap gap-2">
                                    {isTicket && (!selectedTier || safeTicketQuantity <= 0) ? (
                                        <Button disabled className="rounded-full px-5">
                                            바로 구매
                                        </Button>
                                    ) : (
                                        <Button asChild className="rounded-full px-5">
                                            <Link to={directCheckoutLink}>바로 구매</Link>
                                        </Button>
                                    )}
                                    <Button asChild variant="outline" className="rounded-full px-5">
                                        <Link
                                            to={detailLink}
                                            state={{
                                                store: {
                                                    id: resolvedStoreId,
                                                    name: preview.store.name,
                                                    description: store?.description ?? preview.store.tagline,
                                                },
                                                itemSummary: item,
                                            }}
                                        >
                                            페이지로 열기
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </section>

                    {isTicket ? (
                        <Card className="overflow-hidden border-border/70">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Ticket className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                                    좌석 / 예매 정보
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">좌석 등급</p>
                                    <div className="flex flex-wrap gap-2">
                                        {tiers.map((tier) => (
                                            <button
                                                key={tier.grade}
                                                type="button"
                                                onClick={() => setSelectedTierGrade(tier.grade)}
                                                className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                                                    resolvedTierGrade === tier.grade
                                                        ? "border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900"
                                                        : "border-border bg-background text-foreground hover:border-cyan-300 hover:bg-cyan-50 dark:hover:bg-cyan-400/10"
                                                }`}
                                            >
                                                {tier.grade} · {tier.price}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="rounded-2xl border border-border bg-muted/60 p-3">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">예매 수량</p>
                                    <div className="mt-2 flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setTicketQuantity(Math.max(1, safeTicketQuantity - 1))}
                                            disabled={safeTicketQuantity <= 1}
                                            className="h-8 w-8 rounded-full border border-border bg-background text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            -
                                        </button>
                                        <input
                                            type="number"
                                            min={maxTicketQuantity > 0 ? 1 : 0}
                                            max={maxTicketQuantity}
                                            value={safeTicketQuantity}
                                            disabled={maxTicketQuantity <= 0}
                                            onChange={(event) => {
                                                const nextQuantity = Number(event.target.value);
                                                if (!Number.isFinite(nextQuantity)) {
                                                    return;
                                                }
                                                setTicketQuantity(Math.floor(Math.max(1, nextQuantity)));
                                            }}
                                            className="h-9 w-16 rounded-lg border border-border bg-background px-2 text-center text-sm text-foreground disabled:cursor-not-allowed disabled:bg-muted"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setTicketQuantity(Math.min(maxTicketQuantity, safeTicketQuantity + 1))}
                                            disabled={safeTicketQuantity >= maxTicketQuantity}
                                            className="h-8 w-8 rounded-full border border-border bg-background text-sm font-semibold text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                                        >
                                            +
                                        </button>
                                        <p className="ml-1 text-xs text-muted-foreground">최대 {maxTicketQuantity}매</p>
                                    </div>
                                </div>

                                <div className="overflow-x-auto rounded-2xl border border-border">
                                    <table className="w-full min-w-[460px] text-left text-sm">
                                        <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
                                            <tr>
                                                <th className="px-3 py-2 font-semibold">등급</th>
                                                <th className="px-3 py-2 font-semibold">가격</th>
                                                <th className="px-3 py-2 font-semibold">잔여석</th>
                                                <th className="px-3 py-2 font-semibold">전체 좌석</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tiers.map((tier) => (
                                                <tr
                                                    key={tier.grade}
                                                    className={resolvedTierGrade === tier.grade ? "bg-cyan-50/80 dark:bg-cyan-400/10" : ""}
                                                >
                                                    <td className="px-3 py-2 font-semibold text-foreground">{tier.grade}</td>
                                                    <td className="px-3 py-2 text-muted-foreground">{tier.price}</td>
                                                    <td className="px-3 py-2 text-muted-foreground">{tier.remaining}석</td>
                                                    <td className="px-3 py-2 text-muted-foreground">{tier.total}석</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card className="border-border/70">
                            <CardHeader className="pb-3">
                                <CardTitle className="flex items-center gap-2 text-base">
                                    <Package className="h-4 w-4 text-violet-700 dark:text-violet-300" />
                                    상품 설명
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 text-sm text-muted-foreground">
                                <p>
                                    {preview.isSummaryFallback
                                        ? `${product.category} 카테고리의 상품이며, 스토어 요약 응답 기준으로 미리보기를 구성했습니다.`
                                        : `${product.category} 카테고리 상품으로, 현재 ${product.status} 상태입니다.`}
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs text-foreground">
                                        {product.category}
                                    </span>
                                    <span className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs text-foreground">
                                        {product.status}
                                    </span>
                                    {product.stock !== null ? (
                                        <span className="rounded-full border border-border bg-muted/60 px-2.5 py-1 text-xs text-foreground">
                                            남은 수량 {product.stock}개
                                        </span>
                                    ) : null}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="space-y-5">
                    <Card className="border-border/70">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">스토어 컨텍스트</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm text-muted-foreground">
                            <p className="text-base font-semibold text-foreground">{preview.store.name}</p>
                            <p>{preview.store.tagline}</p>
                            {!preview.isSummaryFallback && preview.store.reviewCount > 0 ? (
                                <p className="inline-flex items-center gap-1 text-xs">
                                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                                    평점 {preview.store.rating} / 리뷰 {preview.store.reviewCount.toLocaleString()}개
                                </p>
                            ) : (
                                <p className="text-xs">현재 스토어 맥락을 유지한 채 상품만 빠르게 확인하는 팝업입니다.</p>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-border/70">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">리뷰 미리보기</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {product.reviews.length > 0 ? (
                                product.reviews.slice(0, 3).map((review) => (
                                    <div key={`${product.id}-${review.user}`} className="rounded-2xl border border-border bg-muted/50 p-3 text-sm">
                                        <p className="font-semibold text-foreground">
                                            {review.user} <span className="ml-1 text-amber-500">{ratingText(review.rating)}</span>
                                        </p>
                                        <p className="mt-1 text-muted-foreground">{review.comment}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground">리뷰 정보가 아직 준비되지 않았습니다.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </Modal>
    );
}

export default StoreProductPreviewModal;
