const rawHotDeals = [
    {
        id: "deal-handy-vacuum",
        title: "무선 핸디 청소기",
        category: "생활가전",
        storeName: "URBAN FIT LAB",
        thumbnail:
            "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=900&q=80",
        originalPrice: "131,000원",
        price: "89,000원",
        discount: "-32%",
        left: "02:14:08",
        description: "실내/차량에서 빠르게 사용할 수 있는 경량 무선 청소기 핫딜 상품입니다.",
        features: ["초경량 680g", "HEPA 필터", "최대 22분 사용"],
        detailSections: [
            {
                title: "컴팩트한 흡입 설계",
                description: "좁은 틈새와 차량 내부 청소에 맞춘 노즐 구조로 실사용 편의성을 높였습니다.",
                image:
                    "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=1400&q=80",
                highlights: ["틈새 노즐 포함", "브러시 헤드 교체형", "원버튼 작동"],
            },
            {
                title: "가벼운 무게와 안정적인 배터리",
                description: "손목 부담을 줄인 무게 중심과 일상 청소에 충분한 사용 시간을 제공합니다.",
                image:
                    "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1400&q=80",
                highlights: ["680g 경량 바디", "최대 22분 연속 사용", "USB-C 충전"],
            },
            {
                title: "핫딜 한정 가격 운영",
                description: "핫딜 기간에만 적용되는 특별가로 제공되며, 종료 후 정가로 복귀합니다.",
                image:
                    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1400&q=80",
                highlights: ["기간 한정 할인", "수량 소진 시 종료", "정가 자동 복귀"],
            },
        ],
        reviews: [
            { user: "신지훈", rating: 5, comment: "차량 청소에 너무 편하고 흡입력도 좋아요." },
            { user: "윤가은", rating: 4, comment: "가벼워서 자주 꺼내 쓰게 됩니다." },
        ],
    },
    {
        id: "deal-granola-pack",
        title: "프로틴 그래놀라 12팩",
        category: "푸드",
        storeName: "GREEN TABLE FARM",
        thumbnail:
            "https://images.unsplash.com/photo-1579722821273-0f6c3bbcd7cb?auto=format&fit=crop&w=900&q=80",
        originalPrice: "33,600원",
        price: "19,800원",
        discount: "-41%",
        left: "01:03:22",
        description: "아침 대용/간식으로 활용하기 좋은 고단백 그래놀라 세트 핫딜입니다.",
        features: ["고단백 14g", "저당 배합", "12팩 구성"],
        detailSections: [
            {
                title: "고단백 균형 레시피",
                description: "귀리와 단백질 베이스를 조합해 포만감을 높인 레시피입니다.",
                image:
                    "https://images.unsplash.com/photo-1579722821273-0f6c3bbcd7cb?auto=format&fit=crop&w=1400&q=80",
                highlights: ["1팩 단백질 14g", "저당 설계", "식이섬유 함유"],
            },
            {
                title: "간편한 소포장 구성",
                description: "출근 전이나 운동 후에도 쉽게 먹을 수 있는 소포장 형태입니다.",
                image:
                    "https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=1400&q=80",
                highlights: ["1회분 소포장", "휴대성 강화", "보관 편의"],
            },
            {
                title: "핫딜 특가/정가 구분 운영",
                description: "핫딜은 기간 내 한정가, 일반 판매 전환 시 정가 정책이 적용됩니다.",
                image:
                    "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1400&q=80",
                highlights: ["핫딜 한정가", "정가 전환 예정", "알림 수신 가능"],
            },
        ],
        reviews: [
            { user: "김나율", rating: 5, comment: "우유랑 먹기 좋아 아침으로 딱이에요." },
            { user: "박준하", rating: 4, comment: "단맛이 과하지 않아 매일 먹기 좋습니다." },
        ],
    },
    {
        id: "deal-aroma-diffuser",
        title: "미니 아로마 디퓨저",
        category: "리빙",
        storeName: "ATELIER LUMIERE",
        thumbnail:
            "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=900&q=80",
        originalPrice: "32,700원",
        price: "24,500원",
        discount: "-25%",
        left: "03:42:11",
        description: "작은 공간에서 은은하게 사용하기 좋은 미니 사이즈 디퓨저 핫딜 상품입니다.",
        features: ["저소음 확산", "3단계 분사", "무드 라이트"],
        detailSections: [
            {
                title: "콤팩트 사이즈 공간 활용",
                description: "책상, 침실, 욕실 등 좁은 공간에도 부담 없이 배치할 수 있습니다.",
                image:
                    "https://images.unsplash.com/photo-1616046229478-9901c5536a45?auto=format&fit=crop&w=1400&q=80",
                highlights: ["소형 사이즈", "미니멀 디자인", "다양한 공간 대응"],
            },
            {
                title: "저소음 확산 모드",
                description: "수면이나 집중 시간에도 방해를 줄이는 저소음 작동을 지원합니다.",
                image:
                    "https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=1400&q=80",
                highlights: ["저소음 동작", "3단계 분사", "자동 종료 타이머"],
            },
            {
                title: "핫딜 전용 패키지",
                description: "핫딜 기간 한정 구성으로 리필 오일 샘플이 포함됩니다.",
                image:
                    "https://images.unsplash.com/photo-1603006905393-cf4f0f42d119?auto=format&fit=crop&w=1400&q=80",
                highlights: ["리필 샘플 포함", "한정 패키지", "기간 종료 시 구성 변경"],
            },
        ],
        reviews: [
            { user: "최은비", rating: 5, comment: "소음이 거의 없어서 침실에서 쓰기 좋아요." },
            { user: "안도현", rating: 4, comment: "향 퍼짐이 안정적이고 디자인도 예쁩니다." },
        ],
    },
    {
        id: "deal-suncare-set",
        title: "데일리 선케어 세트",
        category: "뷰티",
        storeName: "ATELIER LUMIERE",
        thumbnail:
            "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=900&q=80",
        originalPrice: "28,900원",
        price: "17,900원",
        discount: "-38%",
        left: "00:54:36",
        description: "외출 전 빠르게 사용할 수 있는 선크림/선스틱 구성의 데일리 세트입니다.",
        features: ["SPF50+", "무기자차+유기자차 밸런스", "백탁 최소화"],
        detailSections: [
            {
                title: "데일리 UV 차단 구성",
                description: "실사용 빈도가 높은 선크림/선스틱 조합으로 외출 동선을 단순화했습니다.",
                image:
                    "https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=1400&q=80",
                highlights: ["SPF50+", "PA++++", "외출 전 간편 사용"],
            },
            {
                title: "피부 표현을 고려한 텍스처",
                description: "가벼운 발림성과 백탁 최소화 포뮬러로 일상 메이크업과 조합이 쉽습니다.",
                image:
                    "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=1400&q=80",
                highlights: ["백탁 최소화", "가벼운 사용감", "메이크업 궁합"],
            },
            {
                title: "핫딜 한정 세트 가격",
                description: "세트 구매 시 정가 대비 높은 할인율을 적용한 한정 프로모션입니다.",
                image:
                    "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=1400&q=80",
                highlights: ["기간 한정 할인", "세트 구성 특가", "종료 후 정가 복귀"],
            },
        ],
        reviews: [
            { user: "유소민", rating: 5, comment: "번들거림이 적어서 여름에 잘 쓰고 있어요." },
            { user: "강도현", rating: 4, comment: "세트 구성이라 가성비가 좋습니다." },
        ],
    },
];

function toProductDto(deal) {
    return {
        id: deal.id,
        title: deal.title,
        category: deal.category,
        thumbnail: deal.thumbnail,
        summary: deal.description,
        features: deal.features ?? [],
        detailSections: deal.detailSections ?? [],
        reviews: deal.reviews ?? [],
    };
}

export const hotDeals = rawHotDeals.map((deal) => ({
    ...deal,
    product: toProductDto(deal),
}));

export function findDealById(dealId) {
    return hotDeals.find((deal) => deal.id === dealId);
}
