import { useEffect } from "react";

import { redirectToStoredPostLoginPath } from "@/common/api/authNavigation.js";
import { useAuthStore } from "@/common/store/useAuthStore.js";
import { fetchProfile } from "@/domains/client/profile/api/profileApi.js";
import { normalizeProfile } from "@/domains/client/profile/lib/profileMappers.js";

function hasAuthenticatedIdentity(profile) {
    return Boolean(profile?.userId || profile?.email);
}

export function useAuthBootstrap() {
    const isResolved = useAuthStore((state) => state.isResolved);
    const resolveAuth = useAuthStore((state) => state.resolveAuth);

    useEffect(() => {
        if (isResolved) {
            return;
        }

        let cancelled = false;

        fetchProfile({ skipAuthRedirect: true })
            .then((payload) => {
                if (cancelled) {
                    return;
                }

                const normalizedProfile = normalizeProfile(payload);

                if (!hasAuthenticatedIdentity(normalizedProfile)) {
                    resolveAuth(null);
                    return;
                }

                resolveAuth(normalizedProfile);
                redirectToStoredPostLoginPath();
            })
            .catch((error) => {
                if (cancelled) {
                    return;
                }

                if (error?.status === 401) {
                    resolveAuth(null);
                    return;
                }

                resolveAuth(null);
            });

        return () => {
            cancelled = true;
        };
    }, [isResolved, resolveAuth]);
}
