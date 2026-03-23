import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";

function AddressDeleteConfirmModal({ open, onClose, onConfirm, isPending }) {
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="배송지 삭제"
            description="이 배송지를 삭제하시겠습니까? 삭제 후 복구할 수 없습니다."
            className="max-w-sm"
        >
            <div className="flex gap-3">
                <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11 rounded-full font-bold"
                    onClick={onClose}
                    disabled={isPending}
                >
                    취소
                </Button>
                <Button
                    type="button"
                    variant="destructive"
                    className="flex-1 h-11 rounded-full font-bold"
                    onClick={onConfirm}
                    disabled={isPending}
                >
                    {isPending ? "삭제 중..." : "삭제"}
                </Button>
            </div>
        </Modal>
    );
}

export default AddressDeleteConfirmModal;
