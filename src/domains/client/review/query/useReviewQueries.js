import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { shouldRetryRequest } from "@/common/api/queryRetry";
import { createReview, fetchItemReviews } from "@/domains/client/review/api/reviewApi";
import { mapItemReviewsPayload } from "@/domains/client/review/lib/reviewMappers";

export const reviewKeys = {
    all: ["reviews"],
    itemLists: () => [...reviewKeys.all, "item"],
    itemList: (itemId, params) => [...reviewKeys.itemLists(), itemId, params],
};

export function useItemReviewsQuery(itemId, params = {}, options = {}) {
    return useQuery({
        queryKey: reviewKeys.itemList(itemId, params),
        queryFn: async () => {
            const payload = await fetchItemReviews(itemId, params);
            return mapItemReviewsPayload(payload);
        },
        enabled: Boolean(itemId) && (options.enabled ?? true),
        retry: shouldRetryRequest,
        staleTime: 30_000,
    });
}

export function useCreateReviewMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createReview,
        onSuccess: (review) => {
            const itemId = review?.itemId != null ? String(review.itemId) : null;
            if (itemId) {
                queryClient.invalidateQueries({ queryKey: reviewKeys.itemLists() });
            }
        },
    });
}
