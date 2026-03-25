import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { addressSchema, EMPTY_ADDRESS_FORM } from "@/domains/client/address/actions/addressSchema";
import AddressForm from "@/domains/client/address/components/AddressForm";
import { useCreateAddress, useUpdateAddress } from "@/domains/client/address/hook/useAddressQuery";

function getInitialValues(address) {
    if (!address) return { ...EMPTY_ADDRESS_FORM, fullAddress: "" };
    // GET /api/profile/addresses 응답(AddressResponse)은 granular 필드를 포함하지 않으므로
    // 주소는 카카오 재검색으로 채우고, 수령인 정보만 유지합니다.
    return {
        ...EMPTY_ADDRESS_FORM,
        recipientName: address.recipientName ?? "",
        recipientPhone: address.recipientPhone ?? "",
        fullAddress: address.fullAddress ?? "",
    };
}

function AddressFormModal({ open, onClose, address }) {
    const isEditMode = Boolean(address);
    const [values, setValues] = useState(() => getInitialValues(address));
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState(null);

    const createMutation = useCreateAddress();
    const updateMutation = useUpdateAddress();
    const isPending = createMutation.isPending || updateMutation.isPending;

    const handleChange = (field, value) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        setErrors((prev) => ({ ...prev, [field]: undefined }));
        setServerError(null);
    };

    const handleAddressSelect = (kakaoResult) => {
        setValues((prev) => ({
            ...prev,
            zipcode: kakaoResult.zipcode,
            sido: kakaoResult.sido,
            sigungu: kakaoResult.sigungu,
            roadName: kakaoResult.roadName,
            buildingNumber: kakaoResult.buildingNumber,
            buildingName: kakaoResult.buildingName,
            fullAddress: kakaoResult.fullAddress,
        }));
        setErrors((prev) => ({
            ...prev,
            zipcode: undefined,
            sido: undefined,
            sigungu: undefined,
            roadName: undefined,
            buildingNumber: undefined,
        }));
        setServerError(null);
    };

    const handleClose = () => {
        setValues(getInitialValues(address));
        setErrors({});
        setServerError(null);
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerError(null);

        const result = addressSchema.safeParse(values);
        if (!result.success) {
            setErrors(result.error.flatten().fieldErrors);
            return;
        }

        const payload = { ...result.data, sortOrder: address?.sortOrder ?? 0 };

        try {
            if (isEditMode) {
                await updateMutation.mutateAsync({ addressId: address.id, data: payload });
            } else {
                await createMutation.mutateAsync(payload);
            }
            handleClose();
        } catch (error) {
            setServerError(error.message ?? "요청에 실패했습니다.");
        }
    };

    return (
        <Modal
            open={open}
            onClose={handleClose}
            title={isEditMode ? "배송지 수정" : "새 배송지 추가"}
            description="카카오 주소 검색으로 주소를 입력해주세요."
            className="max-w-lg"
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                <AddressForm
                    values={values}
                    errors={errors}
                    onChange={handleChange}
                    onAddressSelect={handleAddressSelect}
                />

                {serverError && (
                    <p className="text-xs font-medium text-destructive">{serverError}</p>
                )}

                <div className="flex gap-3 pt-1">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1 h-11 rounded-full font-bold"
                        onClick={handleClose}
                        disabled={isPending}
                    >
                        취소
                    </Button>
                    <Button
                        type="submit"
                        className="flex-[2] h-11 rounded-full font-bold"
                        disabled={isPending}
                    >
                        {isPending ? "저장 중..." : isEditMode ? "수정하기" : "추가하기"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default AddressFormModal;
