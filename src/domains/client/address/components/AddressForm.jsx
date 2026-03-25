import { Search } from "lucide-react";

import FormField from "@/components/profile/edit/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKakaoPostcode } from "@/domains/client/address/hook/useKakaoPostcode";

/**
 * AddressForm (Molecule)
 *
 * values: { recipientName, recipientPhone, zipcode, sido, sigungu, roadName, buildingNumber, buildingName, detailAddress }
 * errors: fieldErrors from Zod
 * onChange: (field, value) => void
 * onAddressSelect: (kakaoResult) => void  — 주소 검색 완료 시 여러 필드를 한번에 채움
 */
function AddressForm({ values, errors = {}, onChange, onAddressSelect }) {
    const { open: openPostcode } = useKakaoPostcode();

    const handleSearch = () => {
        openPostcode(onAddressSelect);
    };

    const hasAddress = Boolean(values.zipcode);

    return (
        <div className="space-y-4">
            <FormField
                id="recipientName"
                label="수령인"
                required
                hint={errors.recipientName?.[0]}
                hintError={Boolean(errors.recipientName)}
            >
                <Input
                    id="recipientName"
                    value={values.recipientName}
                    onChange={(e) => onChange("recipientName", e.target.value)}
                    placeholder="홍길동"
                    maxLength={20}
                    className="h-11 rounded-xl"
                />
            </FormField>

            <FormField
                id="recipientPhone"
                label="연락처"
                required
                hint={errors.recipientPhone?.[0]}
                hintError={Boolean(errors.recipientPhone)}
            >
                <Input
                    id="recipientPhone"
                    type="tel"
                    value={values.recipientPhone}
                    onChange={(e) => onChange("recipientPhone", e.target.value)}
                    placeholder="010-1234-5678"
                    maxLength={13}
                    className="h-11 rounded-xl"
                />
            </FormField>

            <FormField
                id="zipcode"
                label="주소"
                required
                hint={errors.zipcode?.[0] ?? errors.sido?.[0] ?? errors.roadName?.[0]}
                hintError={Boolean(errors.zipcode || errors.sido || errors.roadName)}
            >
                <div className="flex gap-2">
                    <Input
                        id="zipcode"
                        value={values.zipcode}
                        readOnly
                        placeholder="우편번호"
                        className="h-11 rounded-xl w-32 bg-muted cursor-default"
                    />
                    <Button
                        type="button"
                        variant="outline"
                        className="h-11 rounded-xl flex-1"
                        onClick={handleSearch}
                    >
                        <Search className="h-4 w-4" />
                        주소 검색
                    </Button>
                </div>

                {hasAddress && (
                    <Input
                        value={values.fullAddress ?? [values.sido, values.sigungu, values.roadName, values.buildingNumber, values.buildingName].filter(Boolean).join(" ")}
                        readOnly
                        className="h-11 rounded-xl mt-2 bg-muted cursor-default"
                    />
                )}
            </FormField>

            <FormField
                id="detailAddress"
                label="상세주소"
                hint={errors.detailAddress?.[0]}
                hintError={Boolean(errors.detailAddress)}
            >
                <Input
                    id="detailAddress"
                    value={values.detailAddress}
                    onChange={(e) => onChange("detailAddress", e.target.value)}
                    placeholder="동·호수, 층 등 (선택)"
                    className="h-11 rounded-xl"
                    disabled={!hasAddress}
                />
            </FormField>
        </div>
    );
}

export default AddressForm;
