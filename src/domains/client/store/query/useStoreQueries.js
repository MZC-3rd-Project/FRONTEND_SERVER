import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { shouldRetryRequest } from "@/common/api/queryRetry";
import { fetchMyStores, fetchStoreDetail, fetchStores } from "@/domains/client/store/api/storeApi";
import { mapStoreDetailPayload, mapStoreListPayload } from "@/domains/client/store/lib/storeMappers";

export const storeKeys = {
    all: ["store"],
    lists: () => [...storeKeys.all, "list"],
    list: (params) => [...storeKeys.lists(), params],
    mine: () => [...storeKeys.all, "mine"],
    details: () => [...storeKeys.all, "detail"],
    detail: (storeId) => [...storeKeys.details(), storeId],
};

export function useStoresQuery(params = {}) {
    return useQuery({
        queryKey: storeKeys.list(params),
        queryFn: async () => {
            const payload = await fetchStores(params);
            return mapStoreListPayload(payload);
        },
        retry: shouldRetryRequest,
        staleTime: 30_000,
    });
}

export function useInfiniteStoresQuery(params = {}, options = {}) {
    const size = params?.size ?? 12;
    const enabled = options?.enabled ?? true;

    return useInfiniteQuery({
        queryKey: [...storeKeys.list(params), "infinite"],
        queryFn: async ({ pageParam }) => {
            const payload = await fetchStores({
                ...params,
                size,
                ...(pageParam ? { cursor: pageParam } : {}),
            });

            return mapStoreListPayload(payload);
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
        enabled,
        retry: shouldRetryRequest,
        staleTime: 30_000,
    });
}

export function useStoreDetailQuery(storeId) {
    return useQuery({
        queryKey: storeKeys.detail(storeId),
        queryFn: async () => {
            const payload = await fetchStoreDetail(storeId);
            return mapStoreDetailPayload(payload);
        },
        enabled: Boolean(storeId),
        retry: shouldRetryRequest,
        staleTime: 30_000,
    });
}

export function useMyStoresQuery(options = {}) {
    return useQuery({
        queryKey: storeKeys.mine(),
        queryFn: async () => {
            const payload = await fetchMyStores();
            return mapStoreListPayload(payload);
        },
        retry: shouldRetryRequest,
        staleTime: 30_000,
        ...options,
    });
}
