import { useMutation, useQuery } from "@tanstack/react-query";
import { shouldRetryRequest } from "@/common/api/queryRetry";
import { confirmEmailVerify, fetchProfile, requestEmailVerify } from "@/domains/client/profile/api/profileApi.js";

export const profileKeys = {
    all: ["profile"],
    me: () => [...profileKeys.all, "me"],
};

export function useProfileQuery() {
    return useQuery({
        queryKey: profileKeys.me(),
        queryFn: async () => {
            const payload = await fetchProfile();
            return payload;
        },
        retry: shouldRetryRequest,
        staleTime: 60_000,
    });
}

export function useRequestEmailVerify() {
    return useMutation({
        mutationFn: (email) => requestEmailVerify(email),
    });
}

export function useConfirmEmailVerify() {
    return useMutation({
        mutationFn: ({ email, code }) => confirmEmailVerify({ email, code }),
    });
}
