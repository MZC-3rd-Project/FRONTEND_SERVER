import { useQuery } from "@tanstack/react-query";

import { shouldRetryRequest } from "@/common/api/queryRetry";
import { fetchFundingCampaignDetail, fetchFundingCampaigns } from "@/domains/client/funding/api/fundingApi";
import {
    mapFundingCampaignDetailPayload,
    mapFundingCampaignListPayload,
} from "@/domains/client/funding/lib/fundingMappers";

export const fundingKeys = {
    all: ["funding"],
    lists: () => [...fundingKeys.all, "list"],
    list: (params) => [...fundingKeys.lists(), params],
    details: () => [...fundingKeys.all, "detail"],
    detail: (campaignId) => [...fundingKeys.details(), campaignId],
};

export function useFundingCampaignsQuery(params = {}) {
    return useQuery({
        queryKey: fundingKeys.list(params),
        queryFn: async () => {
            const payload = await fetchFundingCampaigns(params);
            return mapFundingCampaignListPayload(payload);
        },
        retry: shouldRetryRequest,
        staleTime: 30_000,
    });
}

export function useFundingCampaignDetailQuery(campaignId) {
    return useQuery({
        queryKey: fundingKeys.detail(campaignId),
        queryFn: async () => {
            const payload = await fetchFundingCampaignDetail(campaignId);
            return mapFundingCampaignDetailPayload(payload);
        },
        enabled: Boolean(campaignId),
        retry: shouldRetryRequest,
        staleTime: 30_000,
    });
}
