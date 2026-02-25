const rawFundingCampaigns = [
    {
        id: "wood-speaker",
        name: "노이즈 캔슬링 우드 스피커",
        category: "테크",
        status: "진행중",
        deadline: "2026-03-08 23:59",
        leftLabel: "11일 4시간 남음",
        thumbnail:
            "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80",
        supporters: 842,
        progress: 76,
        raised: "38,200,000원",
        goal: "50,000,000원",
        maker: "NOVA AUDIO LAB",
        summary: "친환경 우드 바디와 고해상도 사운드를 결합한 프리미엄 데스크 스피커",
        store: {
            id: "nova-live",
            name: "NOVA LIVE STAGE",
            tagline: "공연/테크 기반 굿즈와 디바이스를 함께 기획하는 라이브 스토어",
            rating: 4.9,
            reviewCount: 1284,
            soldSummary: ["누적 판매 29,600건", "재구매율 43%", "평균 배송 1.8일"],
        },
        detailSections: [
            {
                title: "우드 바디와 사운드 챔버 설계",
                description: "자연스러운 울림을 만들기 위해 밀도 높은 우드 하우징과 듀얼 챔버 구조를 적용했습니다.",
                image:
                    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80",
                highlights: ["듀얼 드라이버 탑재", "저왜곡 사운드 튜닝", "진동 억제 설계"],
            },
            {
                title: "데스크 환경 최적화 UX",
                description: "볼륨/모드 전환을 직관적으로 구성해 책상 위에서 빠르게 사용할 수 있도록 설계했습니다.",
                image:
                    "https://images.unsplash.com/photo-1518443895471-740fc7c4fefb?auto=format&fit=crop&w=1400&q=80",
                highlights: ["원터치 블루투스 연결", "저지연 모드 제공", "멀티 디바이스 전환"],
            },
            {
                title: "제작 공정과 품질 검수",
                description: "양산 전 단계별 음향 테스트를 거쳐 제품 편차를 최소화했습니다.",
                image:
                    "https://images.unsplash.com/photo-1581092921461-7d65ca45393a?auto=format&fit=crop&w=1400&q=80",
                highlights: ["출고 전 전수 점검", "포장 내 충격 완화", "A/S 대응 표준화"],
            },
        ],
        productReviews: [
            { user: "박가현", rating: 5, comment: "테스트 샘플 음질이 기대 이상이었습니다." },
            { user: "정우진", rating: 4, comment: "책상 환경에 잘 어울리는 디자인입니다." },
        ],
        rewardOptions: [
            { id: "r1", title: "얼리버드 1대", price: "179,000원", shipping: "2026년 4월 발송" },
            { id: "r2", title: "스탠다드 1대", price: "199,000원", shipping: "2026년 4월 발송" },
            { id: "r3", title: "듀오 세트", price: "369,000원", shipping: "2026년 4월 발송" },
        ],
    },
    {
        id: "fabric-backpack",
        name: "친환경 패브릭 백팩 2.0",
        category: "패션",
        status: "완료",
        deadline: "2026-02-18 23:59",
        leftLabel: "마감 완료",
        thumbnail:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
        supporters: 519,
        progress: 108,
        raised: "16,800,000원",
        goal: "15,500,000원",
        maker: "URBAN FABRIC STUDIO",
        summary: "리사이클 원단과 모듈형 수납 구조를 적용한 데일리 백팩",
        store: {
            id: "urban-fit",
            name: "URBAN FIT LAB",
            tagline: "도심 라이프스타일에 맞춘 기능성 패션/기어 셀렉트 스토어",
            rating: 4.7,
            reviewCount: 932,
            soldSummary: ["누적 판매 32,100건", "재구매율 41%", "평균 배송 1.6일"],
        },
        detailSections: [
            {
                title: "모듈형 수납으로 바뀐 사용 경험",
                description: "노트북/짐웨어/일상 소지품을 분리해 수납할 수 있도록 내부 구조를 개선했습니다.",
                image:
                    "https://images.unsplash.com/photo-1517940310602-26535839fe84?auto=format&fit=crop&w=1400&q=80",
                highlights: ["15인치 노트북 수납", "방수 지퍼 포켓", "분리형 파우치 포함"],
            },
            {
                title: "리사이클 원단 기반 내구성 강화",
                description: "생활 방수와 마찰 내구 테스트를 통과한 원단만 선별해 장기 사용에 대응합니다.",
                image:
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80",
                highlights: ["친환경 원단 사용", "하중 분산 스트랩", "오염 저감 코팅"],
            },
            {
                title: "출퇴근과 여행을 모두 커버",
                description: "데일리 사용성과 주말 이동 편의성을 동시에 고려한 하이브리드 설계입니다.",
                image:
                    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1400&q=80",
                highlights: ["캐리어 결합 밴드", "확장형 메인 수납", "무게 중심 최적화"],
            },
        ],
        productReviews: [
            { user: "김시온", rating: 5, comment: "수납 구성이 뛰어나 일상용으로 만족합니다." },
            { user: "조민재", rating: 4, comment: "원단 촉감이 좋고 내구성도 안정적입니다." },
        ],
        rewardOptions: [
            { id: "r1", title: "백팩 단품", price: "99,000원", shipping: "2026년 3월 발송" },
            { id: "r2", title: "백팩 + 파우치 세트", price: "119,000원", shipping: "2026년 3월 발송" },
        ],
    },
    {
        id: "kombucha-pack",
        name: "제로슈가 콤부차 스타터 팩",
        category: "푸드",
        status: "실패",
        deadline: "2026-02-10 23:59",
        leftLabel: "마감 실패",
        thumbnail:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
        supporters: 307,
        progress: 63,
        raised: "9,500,000원",
        goal: "15,000,000원",
        maker: "GREEN BREW LAB",
        summary: "당 함량을 줄이고 유산균 밸런스를 높인 저당 콤부차 키트",
        store: {
            id: "green-table-farm",
            name: "GREEN TABLE FARM",
            tagline: "건강한 푸드/웰니스 상품을 큐레이션하는 라이프스타일 스토어",
            rating: 4.6,
            reviewCount: 1250,
            soldSummary: ["밀키트 판매 41,200팩", "구독 고객 3,800명", "평균 평점 4.6"],
        },
        detailSections: [
            {
                title: "저당 포뮬러와 발효 밸런스",
                description: "일상 음용을 고려해 당 함량은 낮추고 발효 풍미는 유지한 레시피를 적용했습니다.",
                image:
                    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=80",
                highlights: ["저당 레시피 개발", "균주 안정성 테스트", "냉장 유통 기준 적용"],
            },
            {
                title: "초보자도 쉬운 스타터 구성",
                description: "첫 입문자를 위해 브루잉 가이드와 1주차 루틴을 패키지로 제공합니다.",
                image:
                    "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=1400&q=80",
                highlights: ["브루잉 가이드북 포함", "1회분 소포장", "맛별 샘플 제공"],
            },
            {
                title: "실패 데이터와 개선 포인트 공개",
                description: "목표 미달 캠페인의 원인을 공개하고, 리워드/물류 개선안을 다음 프로젝트에 반영합니다.",
                image:
                    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
                highlights: ["실패 리포트 공개", "서포터 피드백 반영", "리뉴얼 일정 공지"],
            },
        ],
        productReviews: [
            { user: "문지후", rating: 4, comment: "레시피 구성이 쉬워서 입문자에게 좋아요." },
            { user: "안유림", rating: 4, comment: "맛 밸런스가 좋아 재도전 의향 있습니다." },
        ],
        rewardOptions: [
            { id: "r1", title: "스타터팩 1세트", price: "29,000원", shipping: "2026년 3월 발송" },
            { id: "r2", title: "스타터팩 2세트", price: "54,000원", shipping: "2026년 3월 발송" },
        ],
    },
    {
        id: "travel-kit",
        name: "초경량 트래블 기어 키트",
        category: "리빙",
        status: "진행중",
        deadline: "2026-03-19 23:59",
        leftLabel: "23일 남음",
        thumbnail:
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
        supporters: 211,
        progress: 41,
        raised: "6,200,000원",
        goal: "15,000,000원",
        maker: "MOVE LITE",
        summary: "기내/출장에 최적화된 초경량 파우치 + 멀티 어댑터 키트",
        store: {
            id: "blue-cup-roastery",
            name: "MOVE LITE SELECT",
            tagline: "이동과 여행에 최적화된 경량 기어를 큐레이션하는 스토어",
            rating: 4.8,
            reviewCount: 740,
            soldSummary: ["누적 판매 12,900건", "교환/환불율 1.1%", "평균 출고 1.4일"],
        },
        detailSections: [
            {
                title: "출장/여행 동선 기반 설계",
                description: "공항, 기차, 호텔 등 이동 경로에서 자주 쓰는 구성품만 모아 부피를 줄였습니다.",
                image:
                    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1400&q=80",
                highlights: ["초경량 파우치", "멀티 어댑터 포함", "방수 수납 포켓"],
            },
            {
                title: "실사용 검증 중심 내구 테스트",
                description: "지퍼/밴드/케이블 수납부를 반복 내구 테스트해 잦은 이동에도 견디도록 보강했습니다.",
                image:
                    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80",
                highlights: ["하중/마찰 테스트", "내구성 보강 스티치", "부품 교체형 구조"],
            },
            {
                title: "서포터 피드백 기반 리워드 운영",
                description: "필요 구성에 맞춰 옵션별 리워드를 제공하고 추가 생산 여부를 투명하게 안내합니다.",
                image:
                    "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1400&q=80",
                highlights: ["옵션별 리워드 선택", "추가 생산 여부 공지", "재입고 알림 제공"],
            },
        ],
        productReviews: [
            { user: "이재온", rating: 5, comment: "구성품이 실용적이라 출장 때 유용합니다." },
            { user: "송하람", rating: 4, comment: "키트 정리 구조가 직관적입니다." },
        ],
        rewardOptions: [
            { id: "r1", title: "트래블 키트 기본", price: "72,000원", shipping: "2026년 4월 발송" },
            { id: "r2", title: "트래블 키트 프로", price: "92,000원", shipping: "2026년 4월 발송" },
        ],
    },
];

function toProductDto(campaign) {
    return {
        id: campaign.id,
        title: campaign.name,
        category: campaign.category,
        thumbnail: campaign.thumbnail,
        summary: campaign.summary,
        detailSections: campaign.detailSections ?? [],
        reviews: campaign.productReviews ?? [],
    };
}

export const fundingCampaigns = rawFundingCampaigns.map((campaign) => ({
    ...campaign,
    product: toProductDto(campaign),
}));

export function findFundingById(campaignId) {
    return fundingCampaigns.find((campaign) => campaign.id === campaignId);
}
