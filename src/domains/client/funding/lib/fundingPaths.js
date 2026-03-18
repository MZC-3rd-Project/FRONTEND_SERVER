export function buildFundingCampaignPath(campaignId) {
    return /^\d+$/.test(String(campaignId)) ? `/funding/${campaignId}` : "/funding";
}
