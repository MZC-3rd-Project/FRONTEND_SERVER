import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { shouldRetryRequest } from "@/common/api/queryRetry";
import {
    addCartItem,
    changeCartSelection,
    fetchCart,
    removeCartItem,
    updateCartItemQuantity,
} from "@/domains/client/cart/api/cartApi";
import { mapCartPayload } from "@/domains/client/cart/lib/cartMappers";

export const cartKeys = {
    all: ["cart"],
    current: () => [...cartKeys.all, "current"],
};

export function useCartQuery(options = {}) {
    return useQuery({
        queryKey: cartKeys.current(),
        queryFn: async () => {
            const payload = await fetchCart();
            return mapCartPayload(payload);
        },
        retry: shouldRetryRequest,
        staleTime: 5_000,
        ...options,
    });
}

function useInvalidatingCartMutation(mutationFn) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: cartKeys.all });
        },
    });
}

export function useAddCartItemMutation() {
    return useInvalidatingCartMutation(addCartItem);
}

export function useUpdateCartItemQuantityMutation() {
    return useInvalidatingCartMutation(updateCartItemQuantity);
}

export function useChangeCartSelectionMutation() {
    return useInvalidatingCartMutation(changeCartSelection);
}

export function useRemoveCartItemMutation() {
    return useInvalidatingCartMutation(removeCartItem);
}
