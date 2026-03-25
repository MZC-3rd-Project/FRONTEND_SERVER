export const cartItems = [
    {
        id: "cart-ticket-1",
        kind: "티켓형",
        storeId: "nova-live",
        storeName: "NOVA LIVE STAGE",
        name: "2026 SPRING LIVE CONCERT",
        option: "S석 · 2026-03-20 19:30",
        thumbnail:
            "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
        quantity: 2,
        unitPrice: 139000,
    },
    {
        id: "cart-stock-1",
        kind: "재고형",
        storeId: "blue-cup-roastery",
        storeName: "BLUE CUP ROASTERY",
        name: "블루컵 드립백 30입",
        option: "기본 패키지",
        thumbnail:
            "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
        quantity: 1,
        unitPrice: 27000,
    },
    {
        id: "cart-stock-2",
        kind: "재고형",
        storeId: "nextgear-hub",
        storeName: "NEXTGEAR HUB",
        name: "WIRELESS HEADSET X",
        option: "블랙",
        thumbnail:
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
        quantity: 1,
        unitPrice: 159000,
    },
];

export const coupons = [
    {
        id: "coupon-welcome-12k",
        name: "신규 회원 12,000원 할인",
        discountType: "amount",
        amount: 12000,
        minimumAmount: 70000,
        expiresAt: "2026-03-31",
    },
    {
        id: "coupon-shipping-free",
        name: "무료배송 쿠폰",
        discountType: "shipping",
        amount: 3500,
        minimumAmount: 30000,
        expiresAt: "2026-03-12",
    },
    {
        id: "coupon-weekend-10",
        name: "주말 10% 할인",
        discountType: "percent",
        amount: 10,
        maximumDiscount: 15000,
        minimumAmount: 50000,
        expiresAt: "2026-03-08",
    },
];

export const paymentMethods = [
    {
        id: "toss-card",
        vendor: "토스페이먼츠",
        name: "카드 결제",
        description: "국내/해외 카드 결제 가능",
    },
    {
        id: "toss-transfer",
        vendor: "토스페이먼츠",
        name: "계좌이체",
        description: "실시간 계좌이체",
    },
    {
        id: "toss-simple",
        vendor: "토스페이먼츠",
        name: "간편결제",
        description: "토스페이, 네이버페이, 카카오페이",
    },
];

export const wishlistItems = [
    {
        id: "wish-1",
        storeId: "atelier-lumiere",
        storeName: "ATELIER LUMIERE",
        name: "시그니처 소이 캔들 300g",
        category: "홈 프래그런스",
        price: 34000,
        rating: 4.8,
        reviewCount: 681,
        stockStatus: "판매중",
        thumbnail:
            "https://images.unsplash.com/photo-1603006905393-cf4f0f42d119?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: "wish-2",
        storeId: "green-table-farm",
        storeName: "GREEN TABLE FARM",
        name: "고단백 밀키트 4종",
        category: "밀키트",
        price: 36000,
        rating: 4.6,
        reviewCount: 1250,
        stockStatus: "판매중",
        thumbnail:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
    },
    {
        id: "wish-3",
        storeId: "nextgear-hub",
        storeName: "NEXTGEAR HUB",
        name: "MECHANICAL KEYBOARD RGB",
        category: "PC 주변기기",
        price: 109000,
        rating: 4.7,
        reviewCount: 1508,
        stockStatus: "재고부족",
        thumbnail:
            "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
    },
];

export const orderHistory = [
    {
        id: "DM202602250001",
        orderedAt: "2026-02-25 11:42",
        status: "배송중",
        paymentMethod: "토스페이먼츠 · 카드",
        totalAmount: 464500,
        discountAmount: 12000,
        shippingFee: 0,
        usedPoint: 3500,
        items: [
            {
                id: "order-item-1",
                kind: "티켓형",
                storeId: "nova-live",
                storeName: "NOVA LIVE STAGE",
                name: "2026 SPRING LIVE CONCERT",
                option: "S석 · 2매",
                quantity: 2,
                unitPrice: 139000,
                thumbnail:
                    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: "order-item-2",
                kind: "재고형",
                storeId: "nextgear-hub",
                storeName: "NEXTGEAR HUB",
                name: "WIRELESS HEADSET X",
                option: "블랙",
                quantity: 1,
                unitPrice: 159000,
                thumbnail:
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
            },
        ],
        shipping: {
            receiver: "김도윤",
            phone: "010-1234-5678",
            zipCode: "06134",
            address1: "서울특별시 강남구 테헤란로 123",
            address2: "801호",
            message: "문 앞에 두고 벨 눌러주세요.",
            courier: "CJ대한통운",
            trackingNo: "6451-9934-1290",
        },
        timeline: [
            { label: "주문 완료", at: "2026-02-25 11:42", done: true },
            { label: "상품 준비중", at: "2026-02-25 14:10", done: true },
            { label: "배송 시작", at: "2026-02-26 09:20", done: true },
            { label: "배송 완료", at: "-", done: false },
        ],
    },
    {
        id: "DM202602220017",
        orderedAt: "2026-02-22 18:05",
        status: "배송완료",
        paymentMethod: "토스페이먼츠 · 간편결제",
        totalAmount: 97000,
        discountAmount: 3500,
        shippingFee: 3500,
        usedPoint: 0,
        items: [
            {
                id: "order-item-3",
                kind: "재고형",
                storeId: "blue-cup-roastery",
                storeName: "BLUE CUP ROASTERY",
                name: "에티오피아 싱글오리진 1kg",
                option: "분쇄도: 홀빈",
                quantity: 1,
                unitPrice: 38000,
                thumbnail:
                    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
            },
            {
                id: "order-item-4",
                kind: "재고형",
                storeId: "atelier-lumiere",
                storeName: "ATELIER LUMIERE",
                name: "린넨 미스트 200ml",
                option: "시트러스 향",
                quantity: 2,
                unitPrice: 22000,
                thumbnail:
                    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
            },
        ],
        shipping: {
            receiver: "김도윤",
            phone: "010-1234-5678",
            zipCode: "06134",
            address1: "서울특별시 강남구 테헤란로 123",
            address2: "801호",
            message: "부재 시 경비실 맡겨주세요.",
            courier: "롯데택배",
            trackingNo: "5021-2209-7741",
        },
        timeline: [
            { label: "주문 완료", at: "2026-02-22 18:05", done: true },
            { label: "상품 준비중", at: "2026-02-22 21:10", done: true },
            { label: "배송 시작", at: "2026-02-23 08:11", done: true },
            { label: "배송 완료", at: "2026-02-24 15:04", done: true },
        ],
    },
    {
        id: "DM202602150009",
        orderedAt: "2026-02-15 09:31",
        status: "결제취소",
        paymentMethod: "토스페이먼츠 · 계좌이체",
        totalAmount: 59000,
        discountAmount: 0,
        shippingFee: 0,
        usedPoint: 0,
        items: [
            {
                id: "order-item-5",
                kind: "티켓형",
                storeId: "pet-ville-lab",
                storeName: "PET VILLE LAB",
                name: "반려견 기초 훈련 클래스",
                option: "기본반 · 1매",
                quantity: 1,
                unitPrice: 59000,
                thumbnail:
                    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
            },
        ],
        shipping: {
            receiver: "-",
            phone: "-",
            zipCode: "-",
            address1: "티켓형 상품",
            address2: "실물 배송 없음",
            message: "-",
            courier: "-",
            trackingNo: "-",
        },
        timeline: [
            { label: "주문 완료", at: "2026-02-15 09:31", done: true },
            { label: "결제 검증", at: "2026-02-15 09:33", done: true },
            { label: "취소 완료", at: "2026-02-15 09:39", done: true },
        ],
    },
];

export function findOrderById(orderId) {
    return orderHistory.find((order) => order.id === orderId);
}
