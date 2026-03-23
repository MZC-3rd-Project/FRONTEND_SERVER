function getCurrentLocationPath() {
    if (typeof window === "undefined") {
        return "/";
    }

    return `${window.location.pathname}${window.location.search}${window.location.hash}` || "/";
}

export function buildAuthLoginPath(redirectPath = getCurrentLocationPath()) {
    const normalizedRedirect =
        typeof redirectPath === "string" && redirectPath.startsWith("/")
            ? redirectPath
            : "/";

    return `/auth/login?redirect=${encodeURIComponent(normalizedRedirect)}`;
}

export function redirectToAuthLogin(redirectPath) {
    if (typeof window === "undefined") {
        return;
    }

    const nextPath = buildAuthLoginPath(redirectPath);
    window.location.assign(nextPath);
}
