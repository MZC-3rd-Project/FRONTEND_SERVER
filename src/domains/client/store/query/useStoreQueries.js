import { useQuery } from "@tanstack/react-query";

import { shouldRetryRequest } from "@/common/api/queryRetry";
import { fetchStoreDetail, fetchStores } from "@/domains/client/store/api/storeApi";
import { mapStoreDetailPayload, mapStoreListPayload } from "@/domains/client/store/lib/storeMappers";

export const storeKeys = {
    all: ["store"],
    lists: () => [...storeKeys.all, "list"],
    list: (params) => [...storeKeys.lists(), params],
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
