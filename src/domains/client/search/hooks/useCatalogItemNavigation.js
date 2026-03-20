import { useState } from "react";
import { useNavigate } from "react-router";

import {
    buildDirectCatalogItemPath,
    buildFallbackCatalogPath,
    resolveCatalogItemPath,
} from "@/domains/client/search/lib/searchRouting";

export function useCatalogItemNavigation() {
    const navigate = useNavigate();
    const [pendingItemId, setPendingItemId] = useState(null);

    const openItem = async (item) => {
        if (!item?.itemId || pendingItemId === item.itemId) {
            return;
        }

        setPendingItemId(item.itemId);

        try {
            const path = await resolveCatalogItemPath(item);
            navigate(path);
        } catch {
            const fallbackPath = buildDirectCatalogItemPath(item) ?? buildFallbackCatalogPath(item);
            navigate(fallbackPath);
        } finally {
            setPendingItemId(null);
        }
    };

    return {
        pendingItemId,
        openItem,
    };
}
