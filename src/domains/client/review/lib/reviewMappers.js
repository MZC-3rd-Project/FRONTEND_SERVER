import { mapReviews } from "@/domains/client/commerce/lib/commerceViewUtils";

export function mapItemReviewsPayload(raw) {
    const content = Array.isArray(raw?.content)
        ? raw.content
        : Array.isArray(raw?.items)
            ? raw.items
            : Array.isArray(raw)
                ? raw
                : [];

    return {
        items: mapReviews(content),
        totalCount: Number(raw?.totalElements ?? raw?.totalCount ?? content.length) || 0,
        page: Number(raw?.number ?? raw?.page ?? 0) || 0,
        size: Number(raw?.size ?? content.length) || content.length,
        totalPages: Number(raw?.totalPages ?? 1) || 1,
    };
}
