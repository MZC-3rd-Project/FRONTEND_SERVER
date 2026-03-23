import { z } from "zod";

export const addressSchema = z.object({
    deliveryName: z.string().min(1, "수령인 이름을 입력해주세요.").max(20, "최대 20자까지 입력 가능합니다."),
    zipcode: z.string().min(1, "우편번호를 입력해주세요.").max(10, "올바른 우편번호를 입력해주세요."),
    sido: z.string().min(1, "시/도를 입력해주세요."),
    sigungu: z.string().min(1, "시/군/구를 입력해주세요."),
    roadName: z.string().min(1, "도로명을 입력해주세요."),
    buildingNumber: z.string().min(1, "건물번호를 입력해주세요."),
    buildingName: z.string().optional().default(""),
    detailAddress: z.string().optional().default(""),
});

export const EMPTY_ADDRESS_FORM = {
    deliveryName: "",
    zipcode: "",
    sido: "",
    sigungu: "",
    roadName: "",
    buildingNumber: "",
    buildingName: "",
    detailAddress: "",
};
