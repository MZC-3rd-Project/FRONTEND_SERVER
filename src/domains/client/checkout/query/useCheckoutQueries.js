import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
    reserveCheckout,
    fetchCheckoutQuote,
    submitCheckout,
    cancelCheckout,
} from "@/domains/client/checkout/api/checkoutApi";
import {
    mapReservationPayload,
    mapCheckoutQuotePayload,
    mapSubmitPayload,
} from "@/domains/client/checkout/lib/checkoutMappers";

export function useReserveCheckout() {
    return useMutation({
        mutationFn: async (params) => {
            const payload = await reserveCheckout(params);
            return mapReservationPayload(payload);
        },
    });
}

export function useFetchCheckoutQuote() {
    return useMutation({
        mutationFn: async (orderId) => {
            const payload = await fetchCheckoutQuote(orderId);
            return mapCheckoutQuotePayload(payload);
        },
    });
}

export function useSubmitCheckout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params) => {
            const payload = await submitCheckout(params);
            return mapSubmitPayload(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
    });
}

export function useCancelCheckout() {
    return useMutation({
        mutationFn: async (orderId) => {
            return cancelCheckout(orderId);
        },
    });
}
