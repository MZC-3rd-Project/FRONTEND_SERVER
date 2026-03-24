import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { shouldRetryRequest } from "@/common/api/queryRetry";
import { fetchOrders, fetchOrderDetail, cancelOrder, refundOrder } from "@/domains/client/order/api/orderApi";
import { mapOrderListPayload, mapOrderDetailPayload } from "@/domains/client/order/lib/orderMappers";

export const orderKeys = {
    all: ["orders"],
    lists: () => [...orderKeys.all, "list"],
    list: (params) => [...orderKeys.lists(), params],
    details: () => [...orderKeys.all, "detail"],
    detail: (orderId) => [...orderKeys.details(), orderId],
};

export function useOrdersQuery(params = {}) {
    return useQuery({
        queryKey: orderKeys.list(params),
        queryFn: async () => {
            const payload = await fetchOrders(params);
            return mapOrderListPayload(payload);
        },
        retry: shouldRetryRequest,
        staleTime: 30_000,
    });
}

export function useOrderDetailQuery(orderId) {
    return useQuery({
        queryKey: orderKeys.detail(orderId),
        queryFn: async () => {
            const payload = await fetchOrderDetail(orderId);
            return mapOrderDetailPayload(payload);
        },
        enabled: Boolean(orderId),
        retry: shouldRetryRequest,
        staleTime: 30_000,
    });
}

export function useCancelOrderMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: cancelOrder,
        onSuccess: (_data, orderId) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
        },
    });
}

export function useRefundOrderMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: refundOrder,
        onSuccess: (_data, orderId) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
            queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) });
        },
    });
}
