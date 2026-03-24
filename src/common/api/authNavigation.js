const POST_LOGIN_REDIRECT_STORAGE_KEY = "donmoa-post-login-redirect";

function getCurrentLocationPath() {
    if (typeof window === "undefined") {
        return "/";
    }

    return `${window.location.pathname}${window.location.search}${window.location.hash}` || "/";
}

function getSessionStorage() {
    if (typeof window === "undefined") {
        return null;
    }

    try {
        return window.sessionStorage;
    } catch {
        return null;
    }
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

    while (candidate.startsWith("/auth/")) {
        if (visited.has(candidate)) {
            return "/";
        }

        visited.add(candidate);

        if (!candidate.startsWith("/auth/login")) {
            return "/";
        }

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

export function rememberPostLoginRedirect(redirectPath = getCurrentLocationPath()) {
    const storage = getSessionStorage();

    if (!storage) {
        return;
    }

    storage.setItem(
        POST_LOGIN_REDIRECT_STORAGE_KEY,
        normalizeAuthRedirectPath(redirectPath)
    );
}

export function redirectToStoredPostLoginPath() {
    const storage = getSessionStorage();

    if (!storage) {
        return false;
    }

    const storedRedirectPath = storage.getItem(POST_LOGIN_REDIRECT_STORAGE_KEY);

    if (!storedRedirectPath) {
        return false;
    }

    storage.removeItem(POST_LOGIN_REDIRECT_STORAGE_KEY);

    const targetPath = normalizeAuthRedirectPath(storedRedirectPath);
    const currentPath = getCurrentLocationPath();

    if (!targetPath || targetPath === "/" || targetPath === currentPath) {
        return false;
    }

    window.location.replace(targetPath);
    return true;
}

export function redirectToAuthLogin(redirectPath) {
    if (typeof window === "undefined") {
        return;
    }

    if (window.location.pathname.startsWith("/auth/")) {
        return;
    }

    const nextPath = buildAuthLoginPath(redirectPath);

    if (nextPath === getCurrentLocationPath()) {
        return;
    }

    window.location.assign(nextPath);
}
