const baseStores = [
    {
        id: "nova-live",
        name: "NOVA LIVE STAGE",
        tagline: "공연 티켓과 굿즈를 함께 판매하는 라이브 브랜드",
        category: "공연/티켓",
        thumbnail:
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
        rating: 4.9,
        reviewCount: 1284,
        soldSummary: ["누적 티켓 판매 21,400석", "굿즈 판매 8,200개", "취소율 0.8%"],
        activities: ["월간 라이브 쇼케이스 운영", "팬 커뮤니티 이벤트 진행", "친환경 패키징 도입"],
        ticketProducts: [
            {
                id: "spring-concert-2026",
                name: "2026 SPRING LIVE CONCERT",
                category: "공연 티켓",
                thumbnail:
                    "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=900&q=80",
                eventDate: "2026-03-20 19:30",
                venue: "잠실 아레나",
                tiers: [
                    { grade: "VIP", price: "189,000원", remaining: 12, total: 120 },
                    { grade: "S석", price: "139,000원", remaining: 34, total: 240 },
                    { grade: "R석", price: "99,000원", remaining: 56, total: 280 },
                ],
                reviews: [
                    { user: "김서현", rating: 5, comment: "좌석 뷰 안내가 정확해서 예매가 편했어요." },
                    { user: "이도윤", rating: 4, comment: "결제 플로우가 빠르고 티켓 확인이 쉬웠습니다." },
                ],
            },
        ],
        stockProducts: [
            {
                id: "light-stick-v3",
                name: "NOVA OFFICIAL LIGHT STICK V3",
                category: "공연 굿즈",
                thumbnail:
                    "https://images.unsplash.com/photo-1515942400420-2b98fed1f515?auto=format&fit=crop&w=900&q=80",
                price: "49,000원",
                stock: 86,
                status: "판매중",
                reviews: [
                    { user: "박지안", rating: 5, comment: "밝기랑 배터리 지속시간이 만족스러워요." },
                    { user: "장현우", rating: 4, comment: "패키지가 깔끔하고 배송이 빨랐습니다." },
                ],
            },
            {
                id: "tour-hoodie",
                name: "2026 TOUR LIMITED HOODIE",
                category: "의류",
                thumbnail:
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
                price: "79,000원",
                stock: 14,
                status: "재고부족",
                reviews: [{ user: "정유나", rating: 5, comment: "원단이 부드럽고 핏이 예뻐요." }],
            },
        ],
        storeReviews: [
            { user: "한주원", rating: 5, comment: "티켓/굿즈를 한곳에서 사서 편했습니다." },
            { user: "오세린", rating: 5, comment: "CS 응답이 빠르고 환불 규정이 명확해요." },
            { user: "최민호", rating: 4, comment: "재입고 알림 기능이 유용했습니다." },
        ],
    },
    {
        id: "urban-fit",
        name: "URBAN FIT LAB",
        tagline: "운동/라이프스타일 용품을 큐레이션하는 셀렉트 스토어",
        category: "스포츠/라이프",
        thumbnail:
            "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80",
        rating: 4.7,
        reviewCount: 932,
        soldSummary: ["누적 판매 32,100건", "재구매율 41%", "평균 배송 1.6일"],
        activities: ["러닝 크루 연계 체험 이벤트", "사용자 운동 챌린지 운영", "친환경 소재 상품 확대"],
        ticketProducts: [
            {
                id: "running-clinic",
                name: "러닝 테크닉 클리닉 티켓",
                category: "클래스 티켓",
                thumbnail:
                    "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=900&q=80",
                eventDate: "2026-03-08 10:00",
                venue: "한강 러닝센터",
                tiers: [
                    { grade: "프리미엄", price: "89,000원", remaining: 8, total: 40 },
                    { grade: "일반", price: "49,000원", remaining: 21, total: 80 },
                ],
                reviews: [{ user: "유하린", rating: 5, comment: "클리닉 만족도가 높고 구성도 알찼어요." }],
            },
        ],
        stockProducts: [
            {
                id: "air-runner-pro",
                name: "AIR RUNNER PRO",
                category: "운동화",
                thumbnail:
                    "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=900&q=80",
                price: "129,000원",
                stock: 120,
                status: "판매중",
                reviews: [
                    { user: "문도연", rating: 5, comment: "쿠셔닝이 좋아 장거리 러닝에 좋아요." },
                    { user: "서민재", rating: 4, comment: "사이즈 가이드가 정확합니다." },
                ],
            },
            {
                id: "recovery-roller",
                name: "딥 리커버리 롤러",
                category: "운동 용품",
                thumbnail:
                    "https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=900&q=80",
                price: "35,000원",
                stock: 0,
                status: "품절",
                reviews: [{ user: "윤채린", rating: 5, comment: "운동 후 회복에 확실히 도움됩니다." }],
            },
        ],
        storeReviews: [
            { user: "임재현", rating: 5, comment: "제품 설명이 상세해서 구매 결정이 쉬웠어요." },
            { user: "정세아", rating: 4, comment: "배송이 빠르고 교환 절차도 간단했습니다." },
        ],
    },
];

const extraStores = [
    {
        id: "blue-cup-roastery",
        name: "BLUE CUP ROASTERY",
        tagline: "스페셜티 원두와 브루잉 클래스를 운영하는 카페 스토어",
        category: "푸드/카페",
        thumbnail:
            "https://images.unsplash.com/photo-1442512595331-e89e73853f31?auto=format&fit=crop&w=1200&q=80",
        rating: 4.8,
        reviewCount: 745,
        soldSummary: ["원두 누적 판매 12,400백", "드립백 판매 48,000개", "정기구독 1,920명"],
        activities: ["월간 브루잉 클래스 운영", "원두 로스팅 라이브 진행", "카페 레시피 뉴스레터 발행"],
        ticketProducts: [
            {
                id: "latte-art-class",
                name: "라떼아트 원데이 클래스",
                category: "클래스 티켓",
                thumbnail:
                    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=80",
                eventDate: "2026-04-05 14:00",
                venue: "성수 블루컵 스튜디오",
                tiers: [
                    { grade: "마스터", price: "79,000원", remaining: 5, total: 24 },
                    { grade: "기본", price: "49,000원", remaining: 13, total: 36 },
                ],
                reviews: [
                    { user: "최지후", rating: 5, comment: "초보도 쉽게 따라할 수 있었어요." },
                    { user: "고수빈", rating: 4, comment: "핸즈온 시간이 충분해서 좋았습니다." },
                ],
            },
        ],
        stockProducts: [
            {
                id: "ethiopia-beans-1kg",
                name: "에티오피아 싱글오리진 1kg",
                category: "원두/커피",
                thumbnail:
                    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
                price: "38,000원",
                stock: 92,
                status: "판매중",
                reviews: [
                    { user: "홍가온", rating: 5, comment: "향미가 깔끔하고 산미 밸런스가 좋아요." },
                    { user: "이우진", rating: 4, comment: "집에서 브루잉하기 좋은 로스팅 정도입니다." },
                ],
            },
            {
                id: "drip-bag-30",
                name: "블루컵 드립백 30입",
                category: "원두/커피",
                thumbnail:
                    "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=900&q=80",
                price: "27,000원",
                stock: 24,
                status: "재고부족",
                reviews: [{ user: "박예원", rating: 5, comment: "회사에서 마시기 편하고 맛도 안정적이에요." }],
            },
        ],
        storeReviews: [
            { user: "전도경", rating: 5, comment: "배송 포장이 꼼꼼하고 원두 상태가 좋아요." },
            { user: "신라희", rating: 4, comment: "클래스 안내 메시지가 친절했습니다." },
        ],
    },
    {
        id: "atelier-lumiere",
        name: "ATELIER LUMIERE",
        tagline: "향수와 캔들, 리빙 향 제품을 제작하는 아틀리에",
        category: "뷰티/라이프",
        thumbnail:
            "https://images.unsplash.com/photo-1455656678494-4d1b5f3e7ad4?auto=format&fit=crop&w=1200&q=80",
        rating: 4.8,
        reviewCount: 681,
        soldSummary: ["핸드메이드 캔들 14,200개", "향수 라인 9,700병", "선물세트 재구매율 46%"],
        activities: ["시즌 향 큐레이션 공개", "조향 워크숍 월 2회 운영", "친환경 소이왁스 캠페인"],
        ticketProducts: [
            {
                id: "perfume-workshop",
                name: "퍼스널 향수 제작 워크숍",
                category: "클래스 티켓",
                thumbnail:
                    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=900&q=80",
                eventDate: "2026-03-30 16:00",
                venue: "한남 루미에르 스튜디오",
                tiers: [
                    { grade: "프라이빗", price: "119,000원", remaining: 4, total: 16 },
                    { grade: "그룹", price: "69,000원", remaining: 11, total: 30 },
                ],
                reviews: [{ user: "서가람", rating: 5, comment: "원하는 향으로 직접 조합해서 특별했어요." }],
            },
        ],
        stockProducts: [
            {
                id: "signature-candle",
                name: "시그니처 소이 캔들 300g",
                category: "홈 프래그런스",
                thumbnail:
                    "https://images.unsplash.com/photo-1603006905393-cf4f0f42d119?auto=format&fit=crop&w=900&q=80",
                price: "34,000원",
                stock: 110,
                status: "판매중",
                reviews: [{ user: "김은설", rating: 5, comment: "향이 과하지 않고 공간에 오래 남아요." }],
            },
            {
                id: "linen-mist",
                name: "린넨 미스트 200ml",
                category: "홈 프래그런스",
                thumbnail:
                    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=900&q=80",
                price: "22,000원",
                stock: 58,
                status: "판매중",
                reviews: [{ user: "임소윤", rating: 4, comment: "침구에 뿌리면 은은하게 향이 남아요." }],
            },
        ],
        storeReviews: [
            { user: "유민혁", rating: 5, comment: "패키징이 고급스러워 선물용으로 만족했습니다." },
            { user: "배지민", rating: 4, comment: "상담 후 추천 받은 향이 취향에 잘 맞았어요." },
        ],
    },
    {
        id: "green-table-farm",
        name: "GREEN TABLE FARM",
        tagline: "친환경 식재료와 밀키트를 판매하는 푸드 셀렉션",
        category: "푸드/건강",
        thumbnail:
            "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80",
        rating: 4.6,
        reviewCount: 1250,
        soldSummary: ["유기농 채소 박스 18,900건", "밀키트 판매 41,200팩", "평균 재주문 주기 19일"],
        activities: ["주간 레시피 라이브 방송", "생산지 직거래 리포트 공개", "제로웨이스트 포장 전환"],
        ticketProducts: [
            {
                id: "healthy-meal-class",
                name: "저당 식단 밀프렙 클래스",
                category: "클래스 티켓",
                thumbnail:
                    "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=900&q=80",
                eventDate: "2026-04-12 11:00",
                venue: "양재 푸드랩",
                tiers: [
                    { grade: "실습형", price: "59,000원", remaining: 9, total: 30 },
                    { grade: "참관형", price: "29,000원", remaining: 18, total: 40 },
                ],
                reviews: [{ user: "이규리", rating: 5, comment: "실제로 먹을 수 있는 식단으로 배워서 좋아요." }],
            },
        ],
        stockProducts: [
            {
                id: "organic-veggie-box",
                name: "유기농 채소 박스 (주간)",
                category: "식재료",
                thumbnail:
                    "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80",
                price: "29,000원",
                stock: 210,
                status: "판매중",
                reviews: [{ user: "전하늘", rating: 5, comment: "신선도가 좋아 매주 구매 중입니다." }],
            },
            {
                id: "protein-mealkit",
                name: "고단백 밀키트 4종",
                category: "밀키트",
                thumbnail:
                    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
                price: "36,000원",
                stock: 48,
                status: "판매중",
                reviews: [{ user: "강태훈", rating: 4, comment: "조리 시간 짧고 맛이 안정적입니다." }],
            },
        ],
        storeReviews: [
            { user: "장효린", rating: 5, comment: "정기배송 일정 관리가 쉬워서 좋았어요." },
            { user: "최유담", rating: 4, comment: "식재료 상태와 포장 만족합니다." },
        ],
    },
    {
        id: "nextgear-hub",
        name: "NEXTGEAR HUB",
        tagline: "신상 디지털 기기와 주변기기를 큐레이션하는 테크 스토어",
        category: "테크/디지털",
        thumbnail:
            "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1200&q=80",
        rating: 4.7,
        reviewCount: 1508,
        soldSummary: ["누적 디바이스 판매 27,600대", "액세서리 62,400개", "당일 출고율 94%"],
        activities: ["신제품 체험 세션 운영", "출시 알림 라이브 진행", "리퍼브 케어 프로그램 확대"],
        ticketProducts: [
            {
                id: "creator-gear-session",
                name: "크리에이터 장비 체험 세션",
                category: "체험 티켓",
                thumbnail:
                    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=900&q=80",
                eventDate: "2026-03-22 13:00",
                venue: "강남 넥스트기어 쇼룸",
                tiers: [
                    { grade: "프리패스", price: "39,000원", remaining: 26, total: 80 },
                    { grade: "VIP", price: "79,000원", remaining: 7, total: 30 },
                ],
                reviews: [{ user: "오민찬", rating: 5, comment: "직접 비교 체험할 수 있어서 구매에 도움됐어요." }],
            },
        ],
        stockProducts: [
            {
                id: "wireless-headset-x",
                name: "WIRELESS HEADSET X",
                category: "오디오",
                thumbnail:
                    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80",
                price: "159,000원",
                stock: 77,
                status: "판매중",
                reviews: [{ user: "남재윤", rating: 5, comment: "노이즈 캔슬링 성능이 우수해요." }],
            },
            {
                id: "mechanical-keyboard-rgb",
                name: "MECHANICAL KEYBOARD RGB",
                category: "PC 주변기기",
                thumbnail:
                    "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=900&q=80",
                price: "109,000원",
                stock: 19,
                status: "재고부족",
                reviews: [{ user: "정해솔", rating: 4, comment: "타건감과 키배열 모두 만족스러워요." }],
            },
        ],
        storeReviews: [
            { user: "임다온", rating: 5, comment: "출시 정보가 빨라서 원하는 제품을 놓치지 않았어요." },
            { user: "양준호", rating: 4, comment: "AS 가이드가 명확해서 신뢰가 갑니다." },
        ],
    },
    {
        id: "mellow-home-studio",
        name: "MELLOW HOME STUDIO",
        tagline: "감성 리빙 소품과 가구를 제안하는 홈스타일 스토어",
        category: "리빙/홈",
        thumbnail:
            "https://images.unsplash.com/photo-1493666438817-866a91353ca9?auto=format&fit=crop&w=1200&q=80",
        rating: 4.7,
        reviewCount: 832,
        soldSummary: ["리빙 소품 21,300개", "가구 주문 6,900건", "커스텀 제작 비율 27%"],
        activities: ["계절별 홈스타일 큐레이션", "공간 스타일링 상담 운영", "가구 리페어 서비스 제공"],
        ticketProducts: [
            {
                id: "home-styling-class",
                name: "홈스타일링 코칭 클래스",
                category: "클래스 티켓",
                thumbnail:
                    "https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=900&q=80",
                eventDate: "2026-04-14 15:00",
                venue: "합정 멜로우 스튜디오",
                tiers: [
                    { grade: "1:1 코칭", price: "129,000원", remaining: 3, total: 12 },
                    { grade: "그룹 세션", price: "59,000원", remaining: 10, total: 28 },
                ],
                reviews: [{ user: "조예진", rating: 5, comment: "작은 공간도 분위기 있게 연출하는 팁이 많아요." }],
            },
        ],
        stockProducts: [
            {
                id: "linen-bedding-set",
                name: "워시드 린넨 침구 세트",
                category: "침구",
                thumbnail:
                    "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
                price: "149,000원",
                stock: 34,
                status: "판매중",
                reviews: [{ user: "문채아", rating: 5, comment: "촉감이 좋고 컬러가 사진 그대로예요." }],
            },
            {
                id: "ceramic-vase-kit",
                name: "세라믹 화병 3종 세트",
                category: "리빙 소품",
                thumbnail:
                    "https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=900&q=80",
                price: "39,000원",
                stock: 0,
                status: "품절",
                reviews: [{ user: "신윤서", rating: 4, comment: "디자인이 심플해서 어떤 인테리어에도 잘 어울려요." }],
            },
        ],
        storeReviews: [
            { user: "한민결", rating: 5, comment: "상담 후 추천 받은 제품 조합이 정말 마음에 들었어요." },
            { user: "윤서진", rating: 4, comment: "배송 일정 안내가 정확했습니다." },
        ],
    },
    {
        id: "peak-climb-center",
        name: "PEAK CLIMB CENTER",
        tagline: "클라이밍 장비와 실내 체험권을 함께 제공하는 액티브 스토어",
        category: "스포츠/액티비티",
        thumbnail:
            "https://images.unsplash.com/photo-1522163182402-834f871fd851?auto=format&fit=crop&w=1200&q=80",
        rating: 4.8,
        reviewCount: 514,
        soldSummary: ["체험권 판매 7,200건", "장비 세트 판매 3,600건", "재방문율 53%"],
        activities: ["초보자 체험 프로그램 운영", "난이도별 루트 챌린지 개최", "장비 피팅 상담 상시 제공"],
        ticketProducts: [
            {
                id: "climb-day-pass",
                name: "클라이밍 데이 패스",
                category: "체험 티켓",
                thumbnail:
                    "https://images.unsplash.com/photo-1523419409543-a5e549c1d94e?auto=format&fit=crop&w=900&q=80",
                eventDate: "2026-03-15 09:00",
                venue: "문래 피크클라임 센터",
                tiers: [
                    { grade: "장비 포함", price: "35,000원", remaining: 41, total: 120 },
                    { grade: "입장권", price: "22,000원", remaining: 58, total: 150 },
                ],
                reviews: [{ user: "곽재희", rating: 5, comment: "초보도 안전하게 체험할 수 있었습니다." }],
            },
        ],
        stockProducts: [
            {
                id: "climb-shoes-lite",
                name: "CLIMB SHOES LITE",
                category: "운동화",
                thumbnail:
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
                price: "89,000원",
                stock: 67,
                status: "판매중",
                reviews: [{ user: "이도한", rating: 4, comment: "입문자용으로 밸런스가 좋습니다." }],
            },
            {
                id: "chalk-bag-pro",
                name: "CHALK BAG PRO",
                category: "운동 용품",
                thumbnail:
                    "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?auto=format&fit=crop&w=900&q=80",
                price: "29,000원",
                stock: 121,
                status: "판매중",
                reviews: [{ user: "배시온", rating: 5, comment: "수납이 넉넉하고 허리벨트 고정감이 좋아요." }],
            },
        ],
        storeReviews: [
            { user: "백도윤", rating: 5, comment: "체험권 예약과 장비 구매를 같이 할 수 있어 편했어요." },
            { user: "문해리", rating: 4, comment: "시설 정보가 상세하게 제공되어 좋았습니다." },
        ],
    },
    {
        id: "cine-ticket-market",
        name: "CINE TICKET MARKET",
        tagline: "영화/공연 관람권과 팝콘 세트를 판매하는 엔터 스토어",
        category: "엔터/티켓",
        thumbnail:
            "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=80",
        rating: 4.6,
        reviewCount: 2114,
        soldSummary: ["관람권 누적 98,400매", "콤보 세트 54,700개", "주말 피크 예매율 88%"],
        activities: ["신작 시사회 이벤트 운영", "관람권 선물하기 캠페인", "팬 굿즈 공동구매 진행"],
        ticketProducts: [
            {
                id: "premium-cinema-pass",
                name: "프리미엄 시네마 패스",
                category: "영화 티켓",
                thumbnail:
                    "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=900&q=80",
                eventDate: "2026-03-28 20:00",
                venue: "강남 시네마관",
                tiers: [
                    { grade: "프라임", price: "42,000원", remaining: 16, total: 70 },
                    { grade: "스탠다드", price: "28,000원", remaining: 39, total: 120 },
                ],
                reviews: [{ user: "송하율", rating: 5, comment: "좌석 선택 폭이 넓고 혜택 구성이 좋아요." }],
            },
        ],
        stockProducts: [
            {
                id: "movie-combo-set",
                name: "무비 콤보 기프트 세트",
                category: "기프트/굿즈",
                thumbnail:
                    "https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&w=900&q=80",
                price: "18,000원",
                stock: 260,
                status: "판매중",
                reviews: [{ user: "조현빈", rating: 4, comment: "선물하기 기능이 편하고 전달도 빨라요." }],
            },
            {
                id: "collect-poster-pack",
                name: "컬렉터 포스터 팩",
                category: "기프트/굿즈",
                thumbnail:
                    "https://images.unsplash.com/photo-1542204165-65bf26472b9b?auto=format&fit=crop&w=900&q=80",
                price: "24,000원",
                stock: 13,
                status: "재고부족",
                reviews: [{ user: "나지안", rating: 5, comment: "인쇄 품질이 좋아 소장가치가 높아요." }],
            },
        ],
        storeReviews: [
            { user: "한도겸", rating: 5, comment: "티켓 발급이 빨라 입장할 때 편했습니다." },
            { user: "유아린", rating: 4, comment: "프로모션 알림이 적절한 타이밍에 와요." },
        ],
    },
    {
        id: "pet-ville-lab",
        name: "PET VILLE LAB",
        tagline: "반려동물 용품과 클래스 상품을 함께 운영하는 펫 스토어",
        category: "펫/라이프",
        thumbnail:
            "https://images.unsplash.com/photo-1450778869180-41d0601e046e?auto=format&fit=crop&w=1200&q=80",
        rating: 4.9,
        reviewCount: 966,
        soldSummary: ["사료/간식 판매 35,500개", "훈련 클래스 2,140건", "구독 서비스 3,300명"],
        activities: ["반려견 산책 모임 운영", "수의사 Q&A 라이브 진행", "유기동물 후원 캠페인"],
        ticketProducts: [
            {
                id: "pet-training-class",
                name: "반려견 기초 훈련 클래스",
                category: "클래스 티켓",
                thumbnail:
                    "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
                eventDate: "2026-04-20 10:30",
                venue: "잠원 펫빌 트레이닝존",
                tiers: [
                    { grade: "소수정예", price: "98,000원", remaining: 6, total: 20 },
                    { grade: "기본반", price: "59,000원", remaining: 14, total: 36 },
                ],
                reviews: [{ user: "백하진", rating: 5, comment: "훈련법 설명이 구체적이라 도움이 컸어요." }],
            },
        ],
        stockProducts: [
            {
                id: "premium-pet-feed",
                name: "프리미엄 펫 사료 5kg",
                category: "펫푸드",
                thumbnail:
                    "https://images.unsplash.com/photo-1583512603806-077998240c7a?auto=format&fit=crop&w=900&q=80",
                price: "54,000원",
                stock: 83,
                status: "판매중",
                reviews: [{ user: "서태오", rating: 5, comment: "기호성이 높고 소화가 잘 되는 편입니다." }],
            },
            {
                id: "pet-play-kit",
                name: "인터랙티브 장난감 키트",
                category: "펫용품",
                thumbnail:
                    "https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?auto=format&fit=crop&w=900&q=80",
                price: "29,000원",
                stock: 37,
                status: "판매중",
                reviews: [{ user: "윤다율", rating: 4, comment: "반려견 반응이 좋아 재구매 예정입니다." }],
            },
        ],
        storeReviews: [
            { user: "정나엘", rating: 5, comment: "상품/클래스 품질이 모두 좋아서 자주 이용해요." },
            { user: "안리온", rating: 4, comment: "상담 대응이 빠르고 친절했습니다." },
        ],
    },
    {
        id: "pixel-creator-house",
        name: "PIXEL CREATOR HOUSE",
        tagline: "디자인 굿즈와 제작 워크숍을 운영하는 크리에이터 편집샵",
        category: "아트/굿즈",
        thumbnail:
            "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=1200&q=80",
        rating: 4.8,
        reviewCount: 593,
        soldSummary: ["디자인 굿즈 26,700개", "워크숍 티켓 3,440건", "재구매율 44%"],
        activities: ["월간 아티스트 콜라보", "굿즈 제작 라이브", "신진 작가 펀딩 연계"],
        ticketProducts: [
            {
                id: "sticker-design-workshop",
                name: "스티커 디자인 워크숍",
                category: "클래스 티켓",
                thumbnail:
                    "https://images.unsplash.com/photo-1452457807411-4979b707c5be?auto=format&fit=crop&w=900&q=80",
                eventDate: "2026-03-26 18:30",
                venue: "연남 픽셀 스튜디오",
                tiers: [
                    { grade: "제작 포함", price: "72,000원", remaining: 9, total: 26 },
                    { grade: "참가권", price: "42,000원", remaining: 17, total: 40 },
                ],
                reviews: [{ user: "한시우", rating: 5, comment: "완성 결과물을 바로 받아볼 수 있어 만족합니다." }],
            },
        ],
        stockProducts: [
            {
                id: "graphic-tote-bag",
                name: "그래픽 토트백 컬렉션",
                category: "패션/굿즈",
                thumbnail:
                    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
                price: "31,000원",
                stock: 74,
                status: "판매중",
                reviews: [{ user: "이담아", rating: 4, comment: "프린팅 컬러가 선명하고 내구성도 괜찮아요." }],
            },
            {
                id: "acrylic-keyring-set",
                name: "아크릴 키링 4종 세트",
                category: "패션/굿즈",
                thumbnail:
                    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=900&q=80",
                price: "19,000원",
                stock: 0,
                status: "품절",
                reviews: [{ user: "오가인", rating: 5, comment: "퀄리티가 좋아 소장용으로 추천합니다." }],
            },
        ],
        storeReviews: [
            { user: "최아빈", rating: 5, comment: "작가 콜라보 제품 라인업이 신선해요." },
            { user: "문지후", rating: 4, comment: "배송과 CS 모두 안정적이었습니다." },
        ],
    },
];

export const stores = [...baseStores, ...extraStores];

export function findStoreById(storeId) {
    return stores.find((store) => store.id === storeId);
}
