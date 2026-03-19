import { useState } from "react";
import { Link, useParams } from "react-router";
import { AlertCircle, ImageIcon, MapPin, Package, Phone, RefreshCw, Sparkles, Store, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import StickyStoreChat from "@/components/chat/StickyStoreChat.jsx";
import StoreProductPreviewModal from "@/domains/client/store/component/StoreProductPreviewModal.jsx";
import { STORE_IMAGE_PLACEHOLDER } from "@/domains/client/store/lib/storeMappers";
import { useStoreDetailQuery } from "@/domains/client/store/query/useStoreQueries";

function StoreDetailSkeleton() {
    return (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <div className="order-2 space-y-6 lg:order-1">
                <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <div className="h-10 w-2/5 animate-pulse rounded bg-muted" />
                    <div className="mt-4 h-64 animate-pulse rounded-2xl bg-muted" />
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
                        <div className="h-24 animate-pulse rounded-2xl bg-muted" />
                    </div>
                </section>
                <Card className="h-56 animate-pulse bg-card" />
            </div>
            <aside className="order-1 lg:order-2">
                <Card className="h-48 animate-pulse bg-card" />
            </aside>
        </div>
    );
}

function ItemGroupSection({ title, items, onPreviewItem }) {
    if (!items.length) {
        return null;
    }

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold text-foreground">{title}</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                {items.map((item) => (
                    <button
                        key={item.id}
                        type="button"
                        onClick={() => onPreviewItem(item)}
                        className="group relative overflow-hidden rounded-[1.6rem] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
                    >
                        <Card className="overflow-hidden border-border/70 bg-card/95 transition duration-300 group-hover:-translate-y-1 group-hover:border-cyan-300/60 group-hover:shadow-[0_24px_65px_rgba(8,145,178,0.18)] dark:group-hover:border-cyan-300/30">
                            <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.16),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.12),transparent_38%)]" />
                                <div className="absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/60 to-transparent transition-transform duration-700 group-hover:translate-x-[420%]" />
                            </div>

                            <div className="relative">
                                <img
                                    src={item.thumbnailUrl || STORE_IMAGE_PLACEHOLDER}
                                    alt={item.title}
                                    className="h-44 w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                                />
                                <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-zinc-950/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                                    <Sparkles className="h-3 w-3" />
                                    클릭해서 보기
                                </div>
                            </div>

                            <CardHeader className="relative pb-2">
                                <div className="flex items-center justify-between gap-2">
                                    <Badge variant="outline">{item.itemTypeLabel}</Badge>
                                    <Badge variant="secondary">{item.status}</Badge>
                                </div>
                                <CardTitle className="text-base">{item.title}</CardTitle>
                            </CardHeader>
                            <CardContent className="relative space-y-2 text-sm text-muted-foreground">
                                <p>판매자 ID {item.sellerId ?? "-"}</p>
                                <p className="font-semibold text-foreground">{item.priceText}</p>
                                <p className="text-xs text-cyan-700 transition-colors group-hover:text-cyan-800 dark:text-cyan-300 dark:group-hover:text-cyan-200">
                                    마우스를 올리고 클릭하면 이 화면 위에서 바로 미리보기가 열립니다.
                                </p>
                            </CardContent>
                        </Card>
                    </button>
                ))}
            </div>
        </section>
    );
}

function StoreDetailPage() {
    const { storeId } = useParams();
    const { data: store, isLoading, isError, error, refetch, isFetching } = useStoreDetailQuery(storeId);
    const [previewItem, setPreviewItem] = useState(null);

    if (isLoading) {
        return <StoreDetailSkeleton />;
    }

    if (isError) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>가게를 불러오지 못했습니다</CardTitle>
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
                                <Link to="/store">가게 목록으로 이동</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!store) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle>가게를 찾을 수 없습니다</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Button asChild className="rounded-full px-5">
                            <Link to="/store">가게 목록으로 이동</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const galleryImages = store.images.all.length > 0
        ? store.images.all
        : [{ mediaId: null, mediaUrl: STORE_IMAGE_PLACEHOLDER, imageType: "THUMBNAIL", sortOrder: 0 }];

    return (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
            <div className="order-2 space-y-6 lg:order-1">
                <section className="rounded-3xl border border-zinc-200/80 bg-white/90 p-6 shadow-[0_14px_45px_rgba(15,23,42,0.08)] sm:p-8">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-700">Store Detail</p>
                            <h2 className="mt-2 text-3xl font-black tracking-tight text-zinc-900">{store.name}</h2>
                            <p className="mt-2 text-sm text-zinc-600">{store.description}</p>
                        </div>
                        <div className="rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm">
                            <p className="font-semibold text-zinc-900">{store.status}</p>
                            <p className="text-xs text-zinc-500">활성 상품 {store.activeItemCount.toLocaleString()}개</p>
                        </div>
                    </div>

                    <img
                        src={galleryImages[0].mediaUrl || STORE_IMAGE_PLACEHOLDER}
                        alt={store.name}
                        className="mt-4 h-56 w-full rounded-2xl object-cover sm:h-72"
                    />

                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">스토어 정보</p>
                            <div className="space-y-2 text-sm text-zinc-600">
                                <p className="inline-flex items-center gap-1.5">
                                    <UserRound className="h-4 w-4" />
                                    운영자 {store.ownerNickname}
                                </p>
                                <p className="inline-flex items-center gap-1.5">
                                    <Phone className="h-4 w-4" />
                                    {store.contactValue}
                                </p>
                                <p className="inline-flex items-center gap-1.5">
                                    <MapPin className="h-4 w-4" />
                                    {store.address}
                                </p>
                            </div>
                        </div>
                        <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
                            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">이미지 갤러리</p>
                            <div className="grid grid-cols-3 gap-2">
                                {galleryImages.slice(0, 6).map((image, index) => (
                                    <img
                                        key={`${image.mediaId ?? "image"}-${index}`}
                                        src={image.mediaUrl || STORE_IMAGE_PLACEHOLDER}
                                        alt={`${store.name} 이미지 ${index + 1}`}
                                        className="h-20 w-full rounded-xl object-cover"
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                <ItemGroupSection title="상품" items={store.groupedItems.PRODUCT} onPreviewItem={setPreviewItem} />
                <ItemGroupSection title="굿즈" items={store.groupedItems.GOODS} onPreviewItem={setPreviewItem} />
                <ItemGroupSection title="공연" items={store.groupedItems.PERFORMANCE} onPreviewItem={setPreviewItem} />

                {store.items.length === 0 ? (
                    <Card>
                        <CardContent className="pt-6 text-sm text-muted-foreground">
                            현재 공개된 상품이 없습니다.
                        </CardContent>
                    </Card>
                ) : null}
            </div>

            <aside className="order-1 lg:order-2 lg:sticky lg:top-24 lg:self-start">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <Store className="h-4 w-4 text-primary" />
                            운영 안내
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm text-muted-foreground">
                        <p>{store.name}</p>
                        <p>운영자 {store.ownerNickname}</p>
                        <p>연락처 {store.contactValue}</p>
                        <p>주소 {store.address}</p>
                        {store.latestItemUpdatedAt ? (
                            <p>최근 상품 갱신 {String(store.latestItemUpdatedAt).replace("T", " ")}</p>
                        ) : null}
                        {store.ownerProfileImageUrl ? (
                            <div className="mt-2 overflow-hidden rounded-2xl border border-border">
                                <img
                                    src={store.ownerProfileImageUrl}
                                    alt={`${store.ownerNickname} 프로필`}
                                    className="h-36 w-full object-cover"
                                />
                            </div>
                        ) : (
                            <div className="mt-2 grid h-36 place-items-center rounded-2xl border border-dashed border-border bg-accent/30 text-xs text-muted-foreground">
                                <ImageIcon className="mb-2 h-5 w-5" />
                                운영자 프로필 이미지 준비 중
                            </div>
                        )}
                    </CardContent>
                </Card>
                <div className="mt-4">
                    <StickyStoreChat
                        storeName={store.name}
                        disabledReason="스토어 상세는 단일 상품이 선택되지 않아 문의방을 바로 만들 수 없습니다. 판매/펀딩/딜 상세에서 문의를 시작해 주세요."
                    />
                </div>
            </aside>

            <StoreProductPreviewModal
                key={previewItem?.id ?? "store-product-preview"}
                open={Boolean(previewItem)}
                item={previewItem}
                store={{
                    id: store.id,
                    name: store.name,
                    description: store.description,
                }}
                onClose={() => setPreviewItem(null)}
            />
        </div>
    );
}

export default StoreDetailPage;
