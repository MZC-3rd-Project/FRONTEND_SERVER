import { useQuery } from "@tanstack/react-query";

import { shouldRetryRequest } from "@/common/api/queryRetry";
import { fetchSellerDashboardOverview } from "@/domains/client/seller/api/sellerDashboardApi";
import { mapSellerDashboardOverviewPayload } from "@/domains/client/seller/lib/sellerDashboardMappers";

export const sellerDashboardKeys = {
    all: ["seller-dashboard"],
    overview: (params) => [...sellerDashboardKeys.all, "overview", params],
};

export function useSellerDashboardOverviewQuery(params, options = {}) {
    return useQuery({
        queryKey: sellerDashboardKeys.overview(params),
        queryFn: async () => {
            const payload = await fetchSellerDashboardOverview(params);
            return mapSellerDashboardOverviewPayload(payload);
        },
        enabled: options.enabled ?? true,
        retry: shouldRetryRequest,
        staleTime: 30_000,
    });
}
