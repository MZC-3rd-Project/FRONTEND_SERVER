import { useQuery } from "@tanstack/react-query";

import { shouldRetryRequest } from "@/common/api/queryRetry";
import { fetchHotDealDetail, fetchHotDeals } from "@/domains/client/deals/api/dealsApi";
import { mapHotDealDetailPayload, mapHotDealListPayload } from "@/domains/client/deals/lib/dealsMappers";

export const dealsKeys = {
    all: ["deals"],
    lists: () => [...dealsKeys.all, "list"],
    list: (params) => [...dealsKeys.lists(), params],
    details: () => [...dealsKeys.all, "detail"],
    detail: ({ hotDealId, itemId, itemType }) => [...dealsKeys.details(), hotDealId, itemId, itemType],
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
