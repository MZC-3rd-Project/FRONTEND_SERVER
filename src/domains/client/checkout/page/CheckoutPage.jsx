import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AlertCircle, BadgeCheck, CreditCard, MapPin, RefreshCw, ShieldCheck, TicketPercent } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCartQuery } from "@/domains/client/cart/query/useCartQueries";
import { formatPrice, parsePriceText } from "@/domains/client/common/utils/format.js";
import { coupons, paymentMethods, shippingAddresses } from "@/domains/client/order/mock/orderData.js";
import { findStoreProduct } from "@/domains/client/store/mock/storeData.js";

function calculateCouponDiscount(selectedCoupon, subtotal, shippingFee) {
    if (!selectedCoupon) return 0;
    if (subtotal < selectedCoupon.minimumAmount) return 0;

    if (selectedCoupon.discountType === "amount") {
        return selectedCoupon.amount;
    }

    if (selectedCoupon.discountType === "shipping") {
        return Math.min(selectedCoupon.amount, shippingFee);
    }

    if (selectedCoupon.discountType === "percent") {
        const discount = Math.floor((subtotal * selectedCoupon.amount) / 100);
        return Math.min(discount, selectedCoupon.maximumDiscount ?? discount);
    }

    return 0;
}

function buildDirectCheckoutItem(storeId, productType, productId, ticketGrade, ticketQuantity) {
    const result = findStoreProduct(storeId, productType, productId);
    if (!result) return null;

    const { store, product } = result;
    if (productType === "ticket") {
        const parsedQuantity = Number(ticketQuantity);
        const requestedQuantity = Number.isFinite(parsedQuantity) && parsedQuantity > 0 ? Math.floor(parsedQuantity) : 1;
        const selectedTier =
            product.tiers.find((tier) => tier.grade === ticketGrade) ??
            product.tiers[0];
        const maxQuantity = Math.max(0, selectedTier?.remaining ?? 0);
        if (maxQuantity <= 0) return null;

        const safeQuantity = Math.min(requestedQuantity, maxQuantity);
        return {
            id: `direct-ticket-${product.id}`,
            kind: "티켓형",
            storeId: store.id,
            storeName: store.name,
            name: product.name,
            option: selectedTier ? `${selectedTier.grade} · ${product.eventDate}` : product.eventDate,
            thumbnail: product.thumbnail,
            quantity: safeQuantity,
            unitPrice: selectedTier ? parsePriceText(selectedTier.price) : 0,
        };
    }

    return {
        id: `direct-stock-${product.id}`,
        kind: "재고형",
        storeId: store.id,
        storeName: store.name,
        name: product.name,
        option: product.status,
        thumbnail: product.thumbnail,
        quantity: 1,
        unitPrice: parsePriceText(product.price),
    };
}

function mapCartItemToCheckoutItem(item) {
    return {
        id: item.lineKey,
        kind: item.channelTypeLabel,
        storeId: item.storeId,
        storeName: item.storeName,
        name: item.itemTitle,
        option: item.salesStatus ? `${item.channelTypeLabel} · ${item.salesStatus}` : item.channelTypeLabel,
        thumbnail: item.thumbnailUrl,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
    };
}

function CheckoutPageSkeleton() {
    return (
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <Card className="h-72 animate-pulse bg-card" />
            <Card className="h-72 animate-pulse bg-card" />
        </div>
    );
}

function CheckoutPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const directMode = searchParams.get("mode") === "direct";
    const directStoreId = searchParams.get("storeId") ?? "";
    const directProductType = searchParams.get("productType") ?? "";
    const directProductId = searchParams.get("productId") ?? "";
    const directTicketGrade = searchParams.get("ticketGrade") ?? "";
    const directTicketQuantity = searchParams.get("ticketQuantity") ?? "1";
    const {
        data: cart,
        isLoading: isCartLoading,
        isError: isCartError,
        error: cartError,
        refetch: refetchCart,
        isFetching: isCartFetching,
    } = useCartQuery({
        enabled: !directMode,
    });

    const directItem = useMemo(
        () =>
            directMode
                ? buildDirectCheckoutItem(
                    directStoreId,
                    directProductType,
                    directProductId,
                    directTicketGrade,
                    directTicketQuantity
                )
                : null,
        [directMode, directProductId, directProductType, directStoreId, directTicketGrade, directTicketQuantity]
    );
    const cartCheckoutItems = useMemo(
        () => (directMode ? [] : (cart?.selectedItems ?? []).map(mapCartItemToCheckoutItem)),
        [cart?.selectedItems, directMode]
    );
    const checkoutItems = useMemo(
        () => (directMode ? (directItem ? [directItem] : []) : cartCheckoutItems),
        [cartCheckoutItems, directItem, directMode]
    );
    const directBackLink = useMemo(() => {
        if (!directItem) return "/cart";

        const ticketQueryParts = [];
        if (directProductType === "ticket" && directTicketGrade) {
            ticketQueryParts.push(`ticketGrade=${encodeURIComponent(directTicketGrade)}`);
        }
        if (directProductType === "ticket" && directTicketQuantity) {
            ticketQueryParts.push(`ticketQuantity=${encodeURIComponent(directTicketQuantity)}`);
        }
        const ticketQuery = ticketQueryParts.length > 0 ? `?${ticketQueryParts.join("&")}` : "";
        return `/store/${directItem.storeId}/product/${directProductType}/${directProductId}${ticketQuery}`;
    }, [directItem, directProductId, directProductType, directTicketGrade, directTicketQuantity]);

    const [selectedAddressId, setSelectedAddressId] = useState(shippingAddresses[0]?.id ?? "");
    const [selectedCouponId, setSelectedCouponId] = useState("");
    const [selectedPaymentId, setSelectedPaymentId] = useState(paymentMethods[0]?.id ?? "");
    const [deliveryMessage, setDeliveryMessage] = useState("문 앞에 두고 벨 눌러주세요.");
    const [usedPoint, setUsedPoint] = useState(3000);

    const subtotal = useMemo(
        () => checkoutItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
        [checkoutItems]
    );
    const shippingFee = subtotal >= 70000 ? 0 : 3500;
    const selectedCoupon = coupons.find((coupon) => coupon.id === selectedCouponId);
    const couponDiscount = calculateCouponDiscount(selectedCoupon, subtotal, shippingFee);
    const maxUsablePoint = Math.min(12000, subtotal - couponDiscount);
    const safeUsedPoint = Math.min(Math.max(0, Number(usedPoint) || 0), Math.max(0, maxUsablePoint));
    const finalAmount = Math.max(0, subtotal + shippingFee - couponDiscount - safeUsedPoint);

    const selectedAddress = shippingAddresses.find((address) => address.id === selectedAddressId) ?? shippingAddresses[0];
    const selectedPayment = paymentMethods.find((method) => method.id === selectedPaymentId) ?? paymentMethods[0];
    const isCheckoutReady = checkoutItems.length > 0;

    const submitCheckout = ({ success }) => {
        if (!isCheckoutReady) return;

        const orderId = `DM${Date.now()}`;
        if (success) {
            navigate(`/order/complete?orderId=${orderId}&amount=${finalAmount}`);
            return;
        }
        navigate(`/order/fail?orderId=${orderId}&code=PAY_PROCESS_ERROR`);
    };

    if (!directMode && isCartLoading) {
        return <CheckoutPageSkeleton />;
    }

    if (!directMode && isCartError) {
        return (
            <div className="grid min-h-[60vh] place-items-center">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <CardTitle>장바구니 주문서를 준비하지 못했습니다</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>장바구니 조회 실패</AlertTitle>
                            <AlertDescription>{cartError?.message ?? "잠시 후 다시 시도해 주세요."}</AlertDescription>
                        </Alert>
                        <div className="flex flex-wrap gap-2">
                            <Button type="button" onClick={() => refetchCart()} disabled={isCartFetching}>
                                <RefreshCw className={`h-4 w-4 ${isCartFetching ? "animate-spin" : ""}`} />
                                다시 시도
                            </Button>
                            <Button asChild variant="outline">
                                <Link to="/cart">장바구니로 돌아가기</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-5">
                <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Checkout</p>
                    <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">
                        {directItem ? "바로 구매 주문서" : "주문서 / 결제"}
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        결제 모듈은 토스페이먼츠 기준으로 설계되어 있고, 현재는 결제 성공/실패 화면만 프론트 데모로 연결되어 있습니다.
                    </p>
                    {directItem ? (
                        <p className="mt-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
                            선택 상품: <span className="font-semibold">{directItem.name}</span> {directItem.quantity}건을 결제합니다.
                        </p>
                    ) : (
                        <p className="mt-2 rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-foreground">
                            장바구니에서 선택한 상품 <span className="font-semibold">{cart?.selectedItemCount ?? checkoutItems.length}건</span>을 결제합니다.
                        </p>
                    )}
                </section>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <MapPin className="h-4 w-4 text-primary" />
                            배송지 선택
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {shippingAddresses.map((address) => (
                            <button
                                key={address.id}
                                type="button"
                                onClick={() => setSelectedAddressId(address.id)}
                                className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                                    selectedAddressId === address.id
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-card text-foreground hover:border-primary"
                                }`}
                            >
                                <p className="text-sm font-semibold">
                                    {address.label} {address.isDefault && <span className="ml-1 text-xs opacity-80">기본 배송지</span>}
                                </p>
                                <p className="mt-1 text-sm">
                                    {address.receiver} · {address.phone}
                                </p>
                                <p className="mt-1 text-xs opacity-85">
                                    ({address.zipCode}) {address.address1} {address.address2}
                                </p>
                            </button>
                        ))}

                        <div className="space-y-2 pt-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">배송 요청사항</p>
                            <Input
                                value={deliveryMessage}
                                onChange={(event) => setDeliveryMessage(event.target.value)}
                                placeholder="배송 요청사항을 입력하세요."
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CreditCard className="h-4 w-4 text-primary" />
                            결제 수단 (토스페이먼츠)
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {paymentMethods.map((method) => (
                            <button
                                key={method.id}
                                type="button"
                                onClick={() => setSelectedPaymentId(method.id)}
                                className={`w-full rounded-2xl border p-4 text-left transition-colors ${
                                    selectedPaymentId === method.id
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-border bg-card text-foreground hover:border-primary"
                                }`}
                            >
                                <p className="text-sm font-semibold">{method.name}</p>
                                <p className="mt-1 text-xs opacity-85">{method.description}</p>
                            </button>
                        ))}

                        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
                            결제창 호출, 결제 승인/실패 콜백, 웹훅 검증은 실제 연동 시 토스페이먼츠 SDK로 연결합니다.
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-5 md:sticky md:top-24 md:self-start">
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">주문 상품</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {checkoutItems.length > 0 ? (
                            checkoutItems.map((item) => (
                                <div key={item.id} className="flex gap-3 rounded-xl border border-border bg-muted p-3">
                                    {item.thumbnail ? (
                                        <img src={item.thumbnail} alt={item.name} className="h-16 w-16 rounded-lg object-cover" />
                                    ) : (
                                        <div className="grid h-16 w-16 place-items-center rounded-lg bg-card text-xs text-muted-foreground">
                                            이미지 없음
                                        </div>
                                    )}
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-muted-foreground">{item.storeName}</p>
                                        <p className="line-clamp-1 text-sm font-semibold text-foreground">{item.name}</p>
                                        <p className="line-clamp-1 text-xs text-muted-foreground">{item.option}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-muted-foreground">x {item.quantity}</p>
                                        <p className="text-sm font-semibold text-foreground">
                                            {formatPrice(item.unitPrice * item.quantity)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="rounded-xl border border-border bg-muted p-3 text-xs text-muted-foreground">
                                {directMode
                                    ? "직접 구매 정보가 유효하지 않습니다. 상품 상세에서 좌석/수량을 다시 선택해 주세요."
                                    : "장바구니에서 선택된 상품이 없습니다. 결제할 상품을 다시 선택해 주세요."}
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <TicketPercent className="h-4 w-4 text-primary" />
                            쿠폰 / 포인트
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">쿠폰 선택</p>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setSelectedCouponId("")}
                                    className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                                        selectedCouponId === ""
                                            ? "border-primary bg-primary text-primary-foreground"
                                            : "border-border bg-card text-foreground hover:border-primary"
                                    }`}
                                >
                                    사용 안 함
                                </button>
                                {coupons.map((coupon) => (
                                    <button
                                        key={coupon.id}
                                        type="button"
                                        onClick={() => setSelectedCouponId(coupon.id)}
                                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors ${
                                            selectedCouponId === coupon.id
                                                ? "border-primary bg-primary text-primary-foreground"
                                                : "border-border bg-card text-foreground hover:border-primary"
                                        }`}
                                    >
                                        {coupon.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">포인트 사용</p>
                            <Input
                                type="number"
                                min={0}
                                max={maxUsablePoint}
                                value={safeUsedPoint}
                                onChange={(event) => setUsedPoint(event.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">최대 사용 가능 포인트: {maxUsablePoint.toLocaleString()}P</p>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base">최종 결제 금액</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>상품 금액</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>배송비</span>
                            <span>{formatPrice(shippingFee)}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>쿠폰 할인</span>
                            <span className="text-primary">- {formatPrice(couponDiscount)}</span>
                        </div>
                        <div className="flex items-center justify-between text-muted-foreground">
                            <span>포인트 사용</span>
                            <span className="text-primary">- {formatPrice(safeUsedPoint)}</span>
                        </div>
                        <div className="my-2 h-px bg-border" />
                        <div className="flex items-center justify-between text-base font-bold text-foreground">
                            <span>총 결제금액</span>
                            <span>{formatPrice(finalAmount)}</span>
                        </div>

                        <div className="rounded-2xl border border-border bg-muted p-3 text-xs text-muted-foreground">
                            선택 결제수단: <span className="font-semibold text-foreground">{selectedPayment.name}</span>
                            <br />
                            수령인: <span className="font-semibold text-foreground">{selectedAddress.receiver}</span>
                        </div>

                        <Button
                            type="button"
                            onClick={() => submitCheckout({ success: true })}
                            disabled={!isCheckoutReady}
                            className="mt-2 h-10 w-full rounded-full text-sm font-semibold"
                        >
                            토스페이먼츠 결제 요청
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => submitCheckout({ success: false })}
                            disabled={!isCheckoutReady}
                            className="h-10 w-full rounded-full text-sm font-semibold"
                        >
                            실패 화면 테스트
                        </Button>
                        <Button asChild variant="ghost" className="h-9 w-full rounded-full">
                            <Link to={directBackLink}>
                                {directItem ? "상품 상세로 돌아가기" : "장바구니로 돌아가기"}
                            </Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                    <CardContent className="p-4 text-xs text-foreground">
                        <p className="inline-flex items-center gap-1 font-semibold">
                            <ShieldCheck className="h-3.5 w-3.5" />
                            Checkout 연결 상태
                        </p>
                        <p className="mt-1">
                            장바구니 선택 상품은 실제 API 데이터로 렌더링 중입니다. 결제 승인과 주문 submit은 아직 프론트 데모 플로우입니다.
                        </p>
                    </CardContent>
                </Card>

                {!directMode ? (
                    <Card className="border-emerald-200/60 bg-emerald-50/70 dark:border-emerald-300/20 dark:bg-emerald-400/10">
                        <CardContent className="p-4 text-xs text-emerald-900 dark:text-emerald-100">
                            <p className="inline-flex items-center gap-1 font-semibold">
                                <BadgeCheck className="h-3.5 w-3.5" />
                                Cart 연동 완료
                            </p>
                            <p className="mt-1">
                                결제 대상은 장바구니에서 체크된 상품만 반영됩니다. 선택 상태나 수량을 바꾸려면 장바구니로 돌아가서 수정하세요.
                            </p>
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </div>
    );
}

export default CheckoutPage;
