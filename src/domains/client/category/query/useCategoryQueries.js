import { useQuery } from "@tanstack/react-query";

import { shouldRetryRequest } from "@/common/api/queryRetry";
import { fetchCategoryTree } from "@/domains/client/category/api/categoryApi";

export const categoryKeys = {
    all: ["categories"],
    tree: () => [...categoryKeys.all, "tree"],
    topLevelNames: () => [...categoryKeys.all, "top-level-names"],
    topLevelOptions: () => [...categoryKeys.all, "top-level-options"],
};

function extractTopLevelCategoryNames(tree) {
    if (!Array.isArray(tree)) {
        return [];
    }

    return tree
        .map((category) => {
            if (typeof category?.name !== "string") {
                return null;
            }
            const normalized = category.name.trim();
            return normalized || null;
        })
        .filter(Boolean);
}

function extractTopLevelCategoryOptions(tree) {
    if (!Array.isArray(tree)) {
        return [];
    }

    return tree
        .map((category) => {
            const id = category?.id != null ? String(category.id).trim() : "";
            const label = typeof category?.name === "string" ? category.name.trim() : "";
            if (!id || !label) {
                return null;
            }

            return {
                value: id,
                label,
            };
        })
        .filter(Boolean);
}

export function useCategoryTreeQuery() {
    return useQuery({
        queryKey: categoryKeys.tree(),
        queryFn: fetchCategoryTree,
        retry: shouldRetryRequest,
        staleTime: 60_000,
    });
}

export function useTopLevelCategoryNamesQuery() {
    return useQuery({
        queryKey: categoryKeys.topLevelNames(),
        queryFn: async () => {
            const tree = await fetchCategoryTree();
            return extractTopLevelCategoryNames(tree);
        },
        retry: shouldRetryRequest,
        staleTime: 60_000,
    });
}

export function useTopLevelCategoryOptionsQuery() {
    return useQuery({
        queryKey: categoryKeys.topLevelOptions(),
        queryFn: async () => {
            const tree = await fetchCategoryTree();
            return extractTopLevelCategoryOptions(tree);
        },
        retry: shouldRetryRequest,
        staleTime: 60_000,
    });
}
