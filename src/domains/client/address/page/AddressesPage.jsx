import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import AddressDeleteConfirmModal from "@/domains/client/address/components/AddressDeleteConfirmModal";
import AddressFormModal from "@/domains/client/address/components/AddressFormModal";
import AddressList from "@/domains/client/address/components/AddressList";
import {
    useAddressListQuery,
    useDeleteAddress,
    useSetDefaultAddress,
} from "@/domains/client/address/hook/useAddressQuery";

function AddressesPage() {
    const { data: addresses = [], isLoading, isError } = useAddressListQuery();

    const deleteMutation = useDeleteAddress();
    const setDefaultMutation = useSetDefaultAddress();

    const [formModal, setFormModal] = useState({ open: false, address: null });
    const [deleteModal, setDeleteModal] = useState({ open: false, addressId: null });

    const handleOpenCreate = () => setFormModal({ open: true, address: null });
    const handleOpenEdit = (address) => setFormModal({ open: true, address });
    const handleCloseForm = () => setFormModal({ open: false, address: null });

    const handleOpenDelete = (addressId) => setDeleteModal({ open: true, addressId });
    const handleCloseDelete = () => setDeleteModal({ open: false, addressId: null });

    const handleConfirmDelete = async () => {
        await deleteMutation.mutateAsync(deleteModal.addressId);
        handleCloseDelete();
    };

    const handleSetDefault = (addressId) => {
        setDefaultMutation.mutate(addressId);
    };

    return (
        <div className="space-y-6 max-w-2xl mx-auto pb-10">
            <section className="rounded-3xl border border-border bg-card p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Shipping Addresses
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-foreground">배송지 관리</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                    자주 쓰는 배송지를 등록/수정해서 주문서 작성 시간을 줄일 수 있습니다.
                </p>
            </section>

            <div className="flex justify-end">
                <Button className="rounded-full px-5" onClick={handleOpenCreate}>
                    <Plus className="h-4 w-4" />
                    새 배송지 추가
                </Button>
            </div>

            <AddressList
                addresses={addresses}
                isLoading={isLoading}
                isError={isError}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onSetDefault={handleSetDefault}
                isSettingDefault={setDefaultMutation.isPending}
            />

            <AddressFormModal
                key={formModal.address?.id ?? "create"}
                open={formModal.open}
                onClose={handleCloseForm}
                address={formModal.address}
            />

            <AddressDeleteConfirmModal
                open={deleteModal.open}
                onClose={handleCloseDelete}
                onConfirm={handleConfirmDelete}
                isPending={deleteMutation.isPending}
            />
        </div>
    );
}

export default AddressesPage;
