import { useMutation, useQueryClient } from "@tanstack/react-query";

import { confirmPayment } from "@/domains/client/payment/api/paymentApi";
import { orderKeys } from "@/domains/client/order/query/useOrderQueries";

export function useConfirmPayment() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: confirmPayment,
        onSuccess: (_data, variables) => {
            queryClient.invalidateQueries({ queryKey: orderKeys.all });
            queryClient.invalidateQueries({
                queryKey: orderKeys.detail(variables.orderId),
            });
        },
    });
}
