import { useInfiniteQuery, useMutation, useQuery } from "@tanstack/react-query";

import { shouldRetryRequest } from "@/common/api/queryRetry";
import {
    enterHotDealQueue,
    fetchHotDealDetail,
    fetchHotDealQueueStatus,
    fetchHotDeals,
    purchaseHotDeal,
} from "@/domains/client/deals/api/dealsApi";
import { mapHotDealDetailPayload, mapHotDealListPayload } from "@/domains/client/deals/lib/dealsMappers";

export const dealsKeys = {
    all: ["deals"],
    lists: () => [...dealsKeys.all, "list"],
    list: (params) => [...dealsKeys.lists(), params],
    details: () => [...dealsKeys.all, "detail"],
    detail: ({ hotDealId, itemId, itemType }) => [...dealsKeys.details(), hotDealId, itemId, itemType],
    queue: () => [...dealsKeys.all, "queue"],
    queueStatus: (hotDealId) => [...dealsKeys.queue(), hotDealId, "status"],
};

export function useHotDealsQuery(params = {}) {
    return useQuery({
        queryKey: dealsKeys.list(params),
        queryFn: async () => {
            const payload = await fetchHotDeals(params);
            return mapHotDealListPayload(payload);
        },
        retry: shouldRetryRequest,
        staleTime: 30_000,
    });
}

export function useInfiniteHotDealsQuery(params = {}) {
    const size = params?.size ?? 12;

    return useInfiniteQuery({
        queryKey: [...dealsKeys.list(params), "infinite"],
        queryFn: async ({ pageParam }) => {
            const payload = await fetchHotDeals({
                ...params,
                size,
                ...(pageParam ? { cursor: pageParam } : {}),
            });

            return mapHotDealListPayload(payload);
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
        retry: shouldRetryRequest,
        staleTime: 30_000,
    });
}

export function useHotDealDetailQuery({ hotDealId, itemId, itemType = "PRODUCT" }) {
    return useQuery({
        queryKey: dealsKeys.detail({ hotDealId, itemId, itemType }),
        queryFn: async () => {
            const payload = await fetchHotDealDetail({ hotDealId, itemId, itemType });
            return mapHotDealDetailPayload(payload);
        },
        enabled: Boolean(hotDealId),
        retry: shouldRetryRequest,
        staleTime: 30_000,
    });
}

export function useHotDealQueueStatusQuery(hotDealId, options = {}) {
    const {
        enabled = true,
        refetchInterval = false,
    } = options;

    return useQuery({
        queryKey: dealsKeys.queueStatus(hotDealId),
        queryFn: async () => {
            const payload = await fetchHotDealQueueStatus(hotDealId);

            return {
                position: typeof payload?.position === "number" ? payload.position : null,
                canPurchase: Boolean(payload?.canPurchase),
            };
        },
        enabled: enabled && Boolean(hotDealId),
        retry: shouldRetryRequest,
        staleTime: 0,
        refetchInterval,
    });
}

export function useEnterHotDealQueueMutation() {
    return useMutation({
        mutationFn: (hotDealId) => enterHotDealQueue(hotDealId),
    });
}

export function usePurchaseHotDealMutation() {
    return useMutation({
        mutationFn: ({ hotDealId, payload }) => purchaseHotDeal(hotDealId, payload),
    });
}
