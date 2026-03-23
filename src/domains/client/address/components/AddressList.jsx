import { MapPin } from "lucide-react";

import AddressCard from "@/domains/client/address/components/AddressCard";

function AddressListSkeleton() {
    return (
        <div className="space-y-3">
            {[1, 2].map((i) => (
                <div key={i} className="animate-pulse bg-muted rounded-xl h-32" />
            ))}
        </div>
    );
}

function AddressEmpty() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <MapPin className="h-10 w-10 mb-3 opacity-30" />
            <p className="text-sm font-medium">등록된 배송지가 없습니다.</p>
            <p className="text-xs mt-1">위 버튼을 눌러 배송지를 추가해보세요.</p>
        </div>
    );
}

function AddressList({ addresses = [], isLoading, isError, onEdit, onDelete, onSetDefault, isSettingDefault }) {
    if (isLoading) return <AddressListSkeleton />;

    if (isError) {
        return (
            <p className="py-10 text-center text-sm text-muted-foreground">
                배송지 목록을 불러오지 못했습니다.
            </p>
        );
    }

    if (addresses.length === 0) return <AddressEmpty />;

    return (
        <div className="space-y-3">
            {addresses.map((address) => (
                <AddressCard
                    key={address.id}
                    address={address}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onSetDefault={onSetDefault}
                    isSettingDefault={isSettingDefault}
                />
            ))}
        </div>
    );
}

export default AddressList;
