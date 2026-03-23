import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { shouldRetryRequest } from "@/common/api/queryRetry";
import { fetchNormalSaleDetail, fetchNormalSales } from "@/domains/client/sales/api/salesApi";
import {
    mapNormalSaleDetailPayload,
    mapNormalSaleListPayload,
} from "@/domains/client/sales/lib/salesMappers";

export const salesKeys = {
    all: ["sales"],
    lists: () => [...salesKeys.all, "list"],
    list: (params) => [...salesKeys.lists(), params],
    details: () => [...salesKeys.all, "detail"],
    detail: (itemId) => [...salesKeys.details(), itemId],
};

export function useNormalSalesQuery(params = {}) {
    return useQuery({
        queryKey: salesKeys.list(params),
        queryFn: async () => {
            const payload = await fetchNormalSales(params);
            return mapNormalSaleListPayload(payload);
        },
        retry: shouldRetryRequest,
        staleTime: 30_000,
    });
}

export function useInfiniteNormalSalesQuery(params = {}) {
    const size = params?.size ?? 12;

    return useInfiniteQuery({
        queryKey: [...salesKeys.list(params), "infinite"],
        queryFn: async ({ pageParam }) => {
            const payload = await fetchNormalSales({
                ...params,
                size,
                ...(pageParam ? { cursor: pageParam } : {}),
            });

            return mapNormalSaleListPayload(payload);
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
        retry: shouldRetryRequest,
        staleTime: 30_000,
    });
}

export function useNormalSaleDetailQuery({ itemId, itemType = "PRODUCT", salesChannel = "NORMAL" }) {
    return useQuery({
        queryKey: [...salesKeys.detail(itemId), itemType, salesChannel],
        queryFn: async () => {
            const payload = await fetchNormalSaleDetail({ itemId, itemType, salesChannel });
            return mapNormalSaleDetailPayload(payload);
        },
        enabled: Boolean(itemId),
        retry: shouldRetryRequest,
        staleTime: 30_000,
    });
}
