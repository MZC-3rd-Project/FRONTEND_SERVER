function getCurrentLocationPath() {
    if (typeof window === "undefined") {
        return "/";
    }

    return `${window.location.pathname}${window.location.search}${window.location.hash}` || "/";
}

function extractNestedRedirect(path) {
    const queryIndex = path.indexOf("?");

    if (queryIndex < 0) {
        return null;
    }

    const params = new URLSearchParams(path.slice(queryIndex + 1));
    const nestedRedirect = params.get("redirect");

    return typeof nestedRedirect === "string" && nestedRedirect.startsWith("/")
        ? nestedRedirect
        : null;
}

export function normalizeAuthRedirectPath(redirectPath = getCurrentLocationPath()) {
    let candidate =
        typeof redirectPath === "string" && redirectPath.startsWith("/")
            ? redirectPath
            : "/";
    const visited = new Set();

    while (candidate.startsWith("/auth/login")) {
        if (visited.has(candidate)) {
            return "/";
        }

        visited.add(candidate);

        const nestedRedirect = extractNestedRedirect(candidate);
        if (!nestedRedirect || nestedRedirect === candidate) {
            return "/";
        }

        candidate = nestedRedirect;
    }

    return candidate;
}

export function buildAuthLoginPath(redirectPath = getCurrentLocationPath()) {
    const normalizedRedirect = normalizeAuthRedirectPath(redirectPath);
    return `/auth/login?redirect=${encodeURIComponent(normalizedRedirect)}`;
}

export function redirectToAuthLogin(redirectPath) {
    if (typeof window === "undefined") {
        return;
    }

    if (window.location.pathname.startsWith("/auth/login")) {
        return;
    }

    const nextPath = buildAuthLoginPath(redirectPath);

    if (nextPath === getCurrentLocationPath()) {
        return;
    }

    window.location.assign(nextPath);
}
