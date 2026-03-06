export const makeid= ()=> {
    return Math.random().toString(36).slice(2, 9);
};

export const ADDRESS_TYPES = [
    { value: "MAIN",      label: "본점 주소",   required: true  },
    { value: "PICKUP",    label: "픽업 주소",   required: false },
    { value: "RETURN",    label: "반품 주소",   required: false },
    { value: "WAREHOUSE", label: "창고 주소",   required: false },
];

export const IMAGE_TYPES = [
    { value: "THUMBNAIL", label: "썸네일",   desc: "가게 목록에 표시되는 대표 이미지",  maxCount: 1  },
    { value: "BANNER",    label: "배너",     desc: "가게 상단에 표시되는 와이드 이미지", maxCount: 3  },
    { value: "INTRODUCE", label: "소개 이미지", desc: "가게 소개 섹션 이미지",           maxCount: 5  },
];
