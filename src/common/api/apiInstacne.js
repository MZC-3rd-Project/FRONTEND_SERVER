import axios from "axios";

const apiBaseURL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const isDev = import.meta.env.DEV;
let authRedirectInProgress = false;

function quoteLargeIntegerLiterals(raw) {
    return raw
        .replace(/(:\s*)(-?\d{16,})(?=\s*[,}\]])/g, '$1"$2"')
        .replace(/((?:\[|,)\s*)(-?\d{16,})(?=\s*[,}\]])/g, '$1"$2"');
}

function parseResponseData(raw) {
    if (typeof raw !== "string") {
        return raw;
    }

    const trimmed = raw.trim();

    if (!trimmed) {
        return raw;
    }

    if (!(trimmed.startsWith("{") || trimmed.startsWith("["))) {
        return raw;
    }

    try {
        return JSON.parse(quoteLargeIntegerLiterals(trimmed));
    } catch {
        return raw;
    }
}

function stripApiSuffix(url) {
    if (!url) {
        return "";
    }

    return url.replace(/\/api\/?$/, "");
}

function buildRequestUrl(config) {
    const baseURL = config?.baseURL || "";
    const url = config?.url || "";

    if (/^https?:\/\//.test(url)) {
        return url;
    }

    return `${baseURL}${url}`;
}

function logApiRequest(config) {
    if (!isDev) {
        return config;
    }

    console.groupCollapsed(`[API REQUEST] ${(config?.method || "GET").toUpperCase()} ${buildRequestUrl(config)}`);
    console.log("params:", config?.params ?? null);
    console.log("data:", config?.data ?? null);
    console.log("headers:", config?.headers ?? null);
    console.groupEnd();

    return config;
}

function logApiResponse(response) {
    if (!isDev) {
        return response;
    }

    console.groupCollapsed(
        `[API RESPONSE] ${(response?.config?.method || "GET").toUpperCase()} ${buildRequestUrl(response?.config)} ${response?.status}`
    );
    console.log("data:", response?.data ?? null);
    console.log("headers:", response?.headers ?? null);
    console.groupEnd();

    return response;
}

function logApiResponseError(error) {
    if (!isDev) {
        return Promise.reject(error);
    }

    console.groupCollapsed(
        `[API RESPONSE ERROR] ${(error?.config?.method || "GET").toUpperCase()} ${buildRequestUrl(error?.config)} ${error?.response?.status ?? "NO_RESPONSE"}`
    );
    console.log("data:", error?.response?.data ?? null);
    console.log("headers:", error?.response?.headers ?? null);
    console.log("message:", error?.message ?? null);
    console.groupEnd();

    return Promise.reject(error);
}

function redirectToLoginOnUnauthorized(error) {
    const status = error?.response?.status;
    const requestUrl = error?.config?.url || "";

    if (status !== 401 || error?.config?.skipAuthRedirect === true) {
        return Promise.reject(error);
    }

    if (typeof window === "undefined") {
        return Promise.reject(error);
    }

    if (authRedirectInProgress) {
        return Promise.reject(error);
    }

    const currentPath = `${window.location.pathname}${window.location.search}${window.location.hash}`;
    const isLoginPage = currentPath.startsWith("/auth/login");
    const isGatewayLoginRequest = requestUrl.startsWith("/login");

    if (isLoginPage || isGatewayLoginRequest) {
        return Promise.reject(error);
    }

    authRedirectInProgress = true;
    const redirect = encodeURIComponent(currentPath);
    window.location.assign(`/auth/login?redirect=${redirect}`);

    return Promise.reject(error);
}

function attachLoggingInterceptors(instance) {
    instance.interceptors.request.use(logApiRequest, (error) => Promise.reject(error));
    instance.interceptors.response.use(logApiResponse, logApiResponseError);
    instance.interceptors.response.use((response) => response, redirectToLoginOnUnauthorized);
}

export const axiosInstance = axios.create({
    baseURL: apiBaseURL,
    timeout: 5000,
    withCredentials: true,
    transformResponse: [parseResponseData],
    headers: {
        'Content-Type': 'application/json'
    }
});

export const bffAxiosInstance = axios.create({
    baseURL: stripApiSuffix(apiBaseURL) || undefined,
    timeout: 5000,
    withCredentials: true,
    transformResponse: [parseResponseData],
    headers: {
        'Content-Type': 'application/json'
    }
});

attachLoggingInterceptors(axiosInstance);
attachLoggingInterceptors(bffAxiosInstance);
