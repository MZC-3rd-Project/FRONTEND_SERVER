export const SEARCH_SCOPE_OPTIONS = [
    { value: "all", label: "전체" },
    { value: "funding", label: "펀딩" },
    { value: "sales", label: "판매" },
    { value: "deals", label: "핫딜" },
    { value: "store", label: "스토어" },
];

export const SEARCH_SCOPE_LABELS = Object.fromEntries(
    SEARCH_SCOPE_OPTIONS.map((option) => [option.value, option.label])
);

export function normalizeSearchScope(rawScope) {
    const normalized = String(rawScope || "").trim().toLowerCase();
    return SEARCH_SCOPE_LABELS[normalized] ? normalized : "all";
}

export function mapScopeToCatalogChannel(scope) {
    const normalizedScope = normalizeSearchScope(scope);

    switch (normalizedScope) {
        case "funding":
            return "FUNDING";
        case "sales":
            return "NORMAL";
        case "deals":
            return "HOT_DEAL";
        default:
            return null;
    }
}

export function buildSearchPageQuery({
    scope = "all",
    q = "",
    sort = "",
    categoryId = "",
    status = "",
}) {
    const params = new URLSearchParams();
    const normalizedScope = normalizeSearchScope(scope);
    const keyword = String(q || "").trim();
    const normalizedSort = String(sort || "").trim().toUpperCase();
    const normalizedCategoryId = String(categoryId || "").trim();
    const normalizedStatus = String(status || "").trim();

    if (normalizedScope !== "all") {
        params.set("scope", normalizedScope);
    }
    if (keyword) {
        params.set("q", keyword);
    }
    if (normalizedSort && normalizedSort !== "LATEST") {
        params.set("sort", normalizedSort);
    }
    if (normalizedCategoryId) {
        params.set("categoryId", normalizedCategoryId);
    }
    if (normalizedStatus && normalizedStatus !== "전체") {
        params.set("status", normalizedStatus);
    }

    return params;
}
