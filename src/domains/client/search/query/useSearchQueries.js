import { useInfiniteQuery } from "@tanstack/react-query";

import { shouldRetryRequest } from "@/common/api/queryRetry";
import { fetchCatalogItems } from "@/domains/client/search/api/searchApi";
import { mapCatalogSearchPayload } from "@/domains/client/search/lib/searchMappers";

export const searchKeys = {
    all: ["search"],
    catalog: (params) => [...searchKeys.all, "catalog", params],
};

function buildCatalogQueryParams(params = {}, cursor) {
    const nextParams = {
        ...params,
        size: params?.size ?? 12,
        ...(cursor ? { cursor } : {}),
    };

    Object.keys(nextParams).forEach((key) => {
        const value = nextParams[key];
        if (Array.isArray(value) && value.length > 0) {
            nextParams[key] = value.join(",");
            return;
        }
        const isEmptyArray = Array.isArray(value) && value.length === 0;
        if (value === null || value === undefined || value === "" || isEmptyArray) {
            delete nextParams[key];
        }
    });

    return nextParams;
}

export function useInfiniteCatalogItemsQuery(params = {}, options = {}) {
    const enabled = options?.enabled ?? true;

    return useInfiniteQuery({
        queryKey: searchKeys.catalog(params),
        queryFn: async ({ pageParam }) => {
            const payload = await fetchCatalogItems(buildCatalogQueryParams(params, pageParam));
            return mapCatalogSearchPayload(payload);
        },
        initialPageParam: null,
        getNextPageParam: (lastPage) => lastPage?.nextCursor || undefined,
        enabled,
        retry: shouldRetryRequest,
        staleTime: 15_000,
    });
}
