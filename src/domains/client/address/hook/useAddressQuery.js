import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { shouldRetryRequest } from "@/common/api/queryRetry";
import {
    createAddress,
    deleteAddress,
    fetchAddresses,
    setDefaultAddress,
    updateAddress,
} from "@/domains/client/address/api/addressApi";
import { profileKeys } from "@/domains/client/profile/query/useProfileQuery";

export const addressKeys = {
    all: ["addresses"],
    list: () => [...addressKeys.all, "list"],
};

export function useAddressListQuery() {
    return useQuery({
        queryKey: addressKeys.list(),
        queryFn: fetchAddresses,
        retry: shouldRetryRequest,
        staleTime: 60_000,
    });
}

export function useCreateAddress() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createAddress,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: addressKeys.list() });
            queryClient.invalidateQueries({ queryKey: profileKeys.me() });
        },
    });
}

export function useUpdateAddress() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ addressId, data }) => updateAddress(addressId, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: addressKeys.list() });
            queryClient.invalidateQueries({ queryKey: profileKeys.me() });
        },
    });
}

export function useDeleteAddress() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteAddress,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: addressKeys.list() });
            queryClient.invalidateQueries({ queryKey: profileKeys.me() });
        },
    });
}

export function useSetDefaultAddress() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: setDefaultAddress,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: addressKeys.list() });
            queryClient.invalidateQueries({ queryKey: profileKeys.me() });
        },
    });
}
