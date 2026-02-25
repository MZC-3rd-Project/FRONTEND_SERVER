const rawSalesItems = [
    {
        id: "sale-wood-speaker-limited",
        title: "우드 스피커 정가 판매",
        fundingTitle: "노이즈 캔슬링 우드 스피커",
        storeName: "NOVA AUDIO LAB",
        category: "테크",
        thumbnail:
            "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=900&q=80",
        price: "219,000원",
        stockLeft: 31,
        soldCount: 89,
        status: "판매중",
        description: "펀딩 완료 후 잔여 수량을 정가로 전환한 리테일 판매 상품입니다.",
        features: ["하이레졸루션 오디오", "저진동 우드 바디", "블루투스 5.3 지원"],
        detailSections: [
            {
                title: "프리미엄 우드 하우징",
                description: "스피커 공진을 억제하는 우드 하우징으로 선명한 사운드를 구현합니다.",
                image:
                    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=1400&q=80",
                highlights: ["진동 억제 설계", "공간감 강화 튜닝", "데스크 친화 디자인"],
            },
            {
                title: "간편한 연결/제어 UX",
                description: "블루투스 페어링과 볼륨 제어를 직관적으로 구성해 사용 진입장벽을 낮췄습니다.",
                image:
                    "https://images.unsplash.com/photo-1518443895471-740fc7c4fefb?auto=format&fit=crop&w=1400&q=80",
                highlights: ["원터치 연결", "저지연 모드", "멀티 디바이스 대응"],
            },
            {
                title: "출고 품질 검수 프로세스",
                description: "출고 전 음향/외관 체크를 통해 품질 편차를 최소화합니다.",
                image:
                    "https://images.unsplash.com/photo-1581092921461-7d65ca45393a?auto=format&fit=crop&w=1400&q=80",
                highlights: ["전수 점검", "충격 완화 패키징", "사후지원 표준화"],
            },
        ],
        reviews: [
            { user: "강민서", rating: 5, comment: "사운드 밸런스가 좋고 공간감이 뛰어납니다." },
            { user: "박주호", rating: 4, comment: "디자인이 깔끔해서 인테리어와 잘 어울려요." },
        ],
    },
    {
        id: "sale-fabric-backpack",
        title: "친환경 패브릭 백팩 2.0 리테일 판매",
        fundingTitle: "친환경 패브릭 백팩 2.0",
        storeName: "URBAN FABRIC STUDIO",
        category: "패션",
        thumbnail:
            "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80",
        price: "129,000원",
        stockLeft: 76,
        soldCount: 214,
        status: "판매중",
        description: "모듈형 수납 구조를 갖춘 데일리 백팩으로 일반 판매 전환 상품입니다.",
        features: ["노트북 16인치 수납", "생활방수 원단", "모듈 파우치 결합형"],
        detailSections: [
            {
                title: "도심형 수납 구조",
                description: "출퇴근 필수품을 빠르게 꺼낼 수 있도록 포켓 동선을 최적화했습니다.",
                image:
                    "https://images.unsplash.com/photo-1517940310602-26535839fe84?auto=format&fit=crop&w=1400&q=80",
                highlights: ["노트북/태블릿 분리", "외부 퀵포켓", "파우치 모듈 결합"],
            },
            {
                title: "생활방수/내구 원단",
                description: "일상 오염과 가벼운 우천 환경에서도 안정적으로 사용할 수 있습니다.",
                image:
                    "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1400&q=80",
                highlights: ["생활방수 코팅", "마찰 내구 강화", "가벼운 무게 밸런스"],
            },
            {
                title: "데일리부터 단기 여행까지",
                description: "사용 목적에 따라 용량을 유연하게 활용할 수 있는 구조입니다.",
                image:
                    "https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1400&q=80",
                highlights: ["확장형 메인 공간", "캐리어 밴드", "하중 분산 스트랩"],
            },
        ],
        reviews: [
            { user: "오세린", rating: 5, comment: "수납 구성이 좋아 출퇴근용으로 최고예요." },
            { user: "이준혁", rating: 4, comment: "어깨끈 쿠션이 좋아 장시간 착용해도 편합니다." },
        ],
    },
    {
        id: "sale-travel-kit",
        title: "초경량 트래블 기어 키트 정가 판매",
        fundingTitle: "초경량 트래블 기어 키트",
        storeName: "MOVE LITE",
        category: "리빙",
        thumbnail:
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=900&q=80",
        price: "89,000원",
        stockLeft: 12,
        soldCount: 63,
        status: "재고부족",
        description: "여행/출장용 필수 키트를 정가로 판매 중이며 재고가 많지 않습니다.",
        features: ["초경량 파우치", "멀티 어댑터 포함", "방수 코팅 소재"],
        detailSections: [
            {
                title: "초경량 올인원 구성",
                description: "이동 시 자주 쓰는 장비만 골라 키트 하나로 정리할 수 있게 설계했습니다.",
                image:
                    "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1400&q=80",
                highlights: ["초경량 소재", "필수 구성 집중", "이동성 최적화"],
            },
            {
                title: "출장 환경 대응성",
                description: "기내, 기차, 호텔 등 여러 환경에서 안정적으로 사용할 수 있도록 구성했습니다.",
                image:
                    "https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=1400&q=80",
                highlights: ["멀티 규격 어댑터", "케이블 정리 슬롯", "방수 포켓"],
            },
            {
                title: "사용 피드백 반영 업데이트",
                description: "실사용 피드백을 반영해 수납/내구 요소를 지속 개선합니다.",
                image:
                    "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1400&q=80",
                highlights: ["피드백 기반 개선", "교체형 구성품", "재입고 알림 지원"],
            },
        ],
        reviews: [
            { user: "윤하린", rating: 5, comment: "해외 출장 갈 때 구성품이 정말 유용했어요." },
            { user: "최정우", rating: 4, comment: "파우치 정리성이 좋아 만족합니다." },
        ],
    },
    {
        id: "sale-kombucha-special",
        title: "제로슈가 콤부차 스타터 스페셜팩",
        fundingTitle: "제로슈가 콤부차 스타터 팩",
        storeName: "GREEN BREW LAB",
        category: "푸드",
        thumbnail:
            "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=80",
        price: "42,000원",
        stockLeft: 0,
        soldCount: 148,
        status: "품절",
        description: "펀딩 리워드 종료 후 남은 수량을 정가로 전환한 마지막 판매 배치입니다.",
        features: ["제로슈가 배합", "프로바이오틱스 함유", "콜드브루 베이스"],
        detailSections: [
            {
                title: "저당 레시피 기반 배합",
                description: "당 함량 부담을 줄이면서도 발효 풍미를 유지한 배합을 적용했습니다.",
                image:
                    "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1400&q=80",
                highlights: ["저당 포뮬러", "발효 풍미 유지", "데일리 음용 대응"],
            },
            {
                title: "간편 음용 패키지",
                description: "출근/운동 전후에도 쉽게 마실 수 있는 병입/패키지 구성을 제공합니다.",
                image:
                    "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=1400&q=80",
                highlights: ["간편 보관", "휴대성 강화", "맛별 구성 제공"],
            },
            {
                title: "한정 배치 운영",
                description: "재고 소진 시점이 명확한 마지막 배치로 운영되는 상품입니다.",
                image:
                    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
                highlights: ["한정 수량", "정가 판매 정책", "품절 안내 즉시 반영"],
            },
        ],
        reviews: [
            { user: "임지안", rating: 4, comment: "상큼하고 부담 없이 마실 수 있어서 좋아요." },
            { user: "김태민", rating: 5, comment: "아침 대용으로 꾸준히 마시기 좋습니다." },
        ],
    },
];

function toProductDto(item) {
    return {
        id: item.id,
        title: item.title,
        category: item.category,
        thumbnail: item.thumbnail,
        summary: item.description,
        features: item.features ?? [],
        detailSections: item.detailSections ?? [],
        reviews: item.reviews ?? [],
    };
}

export const salesItems = rawSalesItems.map((item) => ({
    ...item,
    product: toProductDto(item),
}));

export function findSaleById(saleId) {
    return salesItems.find((item) => item.id === saleId);
}
