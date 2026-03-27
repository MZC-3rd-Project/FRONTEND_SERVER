import { useState } from "react";
import { CheckCircle2, Loader2, MessageSquarePlus } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert.tsx";
import { Button } from "@/components/ui/button";
import ReviewWriteModal from "@/domains/client/review/component/ReviewWriteModal.jsx";
import { useItemReviewsQuery } from "@/domains/client/review/query/useReviewQueries";

export default function OrderItemReviewAction({ orderId, item }) {
    const [open, setOpen] = useState(false);
    const [createdReview, setCreatedReview] = useState(null);

    const { data, isFetching } = useItemReviewsQuery(
        item?.itemId,
        { page: 0, size: 100 },
        { enabled: Boolean(item?.itemId) }
    );

    const existingReview = !orderId || !data?.items?.length
        ? null
        : (data.items.find((review) => String(review.orderId) === String(orderId)) ?? null);

    if (!item?.itemId) {
        return null;
    }

    if (createdReview || existingReview) {
        const rating = createdReview?.rating ?? existingReview?.rating ?? null;
        return (
            <div className="space-y-2">
                <Button
                    type="button"
                    size="sm"
                    disabled
                    className="rounded-full bg-emerald-600 px-4 text-white opacity-100 hover:bg-emerald-600 disabled:cursor-default disabled:opacity-100"
                >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    리뷰 작성 완료
                </Button>
                {rating ? (
                    <p className="text-xs text-zinc-500">등록 평점 {rating}점</p>
                ) : null}
            </div>
        );
    }

    return (
        <>
            <div className="space-y-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full border-cyan-300 bg-cyan-50 px-4 text-cyan-700 hover:bg-cyan-100"
                    onClick={() => setOpen(true)}
                >
                    {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <MessageSquarePlus className="h-3.5 w-3.5" />}
                    리뷰 쓰기
                </Button>
                <Alert className="border-zinc-200 bg-zinc-50/80 px-3 py-2 text-left">
                    <AlertTitle className="text-xs font-semibold text-zinc-700">상품별 리뷰</AlertTitle>
                    <AlertDescription className="text-xs text-zinc-500">
                        주문에 포함된 각 상품마다 한 번씩 리뷰를 남길 수 있습니다.
                    </AlertDescription>
                </Alert>
            </div>

            {open ? (
                <ReviewWriteModal
                    open={open}
                    onClose={() => setOpen(false)}
                    orderId={orderId}
                    item={item}
                    onCreated={(review) => setCreatedReview(review)}
                />
            ) : null}
        </>
    );
}
