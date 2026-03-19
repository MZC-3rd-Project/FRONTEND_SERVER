import { useQuery } from "@tanstack/react-query";

import { shouldRetryRequest } from "@/common/api/queryRetry";
import { mapFundingCampaignListPayload } from "@/domains/client/funding/lib/fundingMappers";
import { fetchClosingSoonFundingCampaigns } from "@/domains/home/api/api";

export const homeKeys = {
    all: ["home"],
    closingSoonFunding: (params) => [...homeKeys.all, "closingSoonFunding", params],
};

export function useClosingSoonFundingCampaignsQuery(params = { size: 5 }) {
    return useQuery({
        queryKey: homeKeys.closingSoonFunding(params),
        queryFn: async () => {
            const payload = await fetchClosingSoonFundingCampaigns(params);
            return mapFundingCampaignListPayload(payload);
        },
        retry: shouldRetryRequest,
        staleTime: 30_000,
    });
}
