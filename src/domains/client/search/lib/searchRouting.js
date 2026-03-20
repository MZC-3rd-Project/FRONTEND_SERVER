import { fetchCatalogItemDetail } from "@/domains/client/search/api/searchApi";
import { toId, toText } from "@/domains/client/commerce/lib/commerceViewUtils";

function buildHotDealPath({ hotDealId, itemId, itemType }) {
    const params = new URLSearchParams();
    if (itemId) {
        params.set("itemId", itemId);
    }
    if (itemType) {
        params.set("itemType", itemType);
    }

    const query = params.toString();
    return query ? `/deals/${hotDealId}?${query}` : `/deals/${hotDealId}`;
}

export function buildFallbackCatalogPath(item) {
    if (item.salesChannel === "FUNDING") {
        return "/funding";
    }
    if (item.salesChannel === "HOT_DEAL") {
        return "/deals";
    }
    return `/sales/${item.itemId}`;
}

export function buildDirectCatalogItemPath(item) {
    if (!item?.itemId) {
        return null;
    }

    switch (item.salesChannel) {
        case "HOT_DEAL":
            return item.activeHotDealId
                ? buildHotDealPath({
                    hotDealId: item.activeHotDealId,
                    itemId: item.itemId,
                    itemType: item.itemType,
                })
                : null;
        case "FUNDING":
            return item.activeCampaignId ? `/funding/${item.activeCampaignId}` : null;
        default:
            return `/sales/${item.itemId}`;
    }
}

function buildCatalogPathFromDetailPayload(payload, fallbackItem) {
    const salesChannel = toText(payload?.salesChannel, fallbackItem?.salesChannel).toUpperCase();
    const itemId = toId(payload?.itemId ?? payload?.saleId ?? fallbackItem?.itemId);
    const itemType = toText(payload?.itemType, fallbackItem?.itemType).toUpperCase();

    if (salesChannel === "HOT_DEAL") {
        const hotDealId = toId(payload?.hotDealId ?? payload?.id ?? fallbackItem?.activeHotDealId);
        if (hotDealId) {
            return buildHotDealPath({
                hotDealId,
                itemId,
                itemType,
            });
        }
    }

    if (salesChannel === "FUNDING") {
        const campaignId = toId(payload?.campaignId ?? payload?.id ?? fallbackItem?.activeCampaignId);
        if (campaignId) {
            return `/funding/${campaignId}`;
        }
        return "/funding";
    }

    return itemId ? `/sales/${itemId}` : buildFallbackCatalogPath(fallbackItem);
}

export async function resolveCatalogItemPath(item) {
    const directPath = buildDirectCatalogItemPath(item);
    if (directPath) {
        return directPath;
    }

    const detailPayload = await fetchCatalogItemDetail({
        itemId: item.itemId,
        itemType: item.itemType,
        salesChannel: item.salesChannel,
        hotDealId: item.activeHotDealId || undefined,
        campaignId: item.activeCampaignId || undefined,
    });

    return buildCatalogPathFromDetailPayload(detailPayload, item);
}

export function buildStorePath(storeId) {
    return `/store/${encodeURIComponent(String(storeId))}`;
}
