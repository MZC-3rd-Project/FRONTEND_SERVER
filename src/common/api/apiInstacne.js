import axios from "axios";
import { tokenManager } from "./tokenManager.js";
import { createAuthClient } from "./createAuthClient.js";
import { redirectToAuthLogin } from "./authNavigation.js";

const isDev = import.meta.env.DEV;
const proxyTarget = import.meta.env.VITE_API_PROXY_TARGET;
const useDevProxy = isDev && Boolean(proxyTarget);
const defaultApiBaseURL = isDev ? "http://localhost:8071/api" : "/api";
const apiBaseURL = useDevProxy
    ? "/api"
    : (import.meta.env.VITE_API_URL || defaultApiBaseURL);
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
    console.log("isDev", isDev);
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
    console.log("isDev", isDev);
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
    console.log("isDev : ", isDev)
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
    const isAuthPage = currentPath.startsWith("/auth/");
    const isGatewayLoginRequest = requestUrl.startsWith("/login");

    if (isAuthPage || isGatewayLoginRequest) {
        return Promise.reject(error);
    }

    authRedirectInProgress = true;
    redirectToAuthLogin(currentPath);

    return Promise.reject(error);
}

function attachLoggingInterceptors(instance) {
    instance.interceptors.request.use(logApiRequest, (error) => Promise.reject(error));
    instance.interceptors.response.use(logApiResponse, logApiResponseError);
    instance.interceptors.response.use((response) => response, redirectToLoginOnUnauthorized);
}

const sharedConfig = {
    timeout: 5000,
    withCredentials: true,
    headers: { 'Content-Type': 'application/json' },
    transformResponse: [
        (raw) => parseResponseData(raw),
    ],
};

tokenManager.init({
    refreshFn: async () => {
        await axios.post(`${apiBaseURL}/v1/auth/refresh`, {}, { withCredentials: true });
    },
    onRefreshFail: () => { redirectToAuthLogin(); },
});

export const axiosInstance = createAuthClient({
    baseURL: apiBaseURL,
    axiosConfig: sharedConfig,
});

export const bffAxiosInstance = createAuthClient({
    baseURL: stripApiSuffix(apiBaseURL) || undefined,
    axiosConfig: sharedConfig,
});

attachLoggingInterceptors(axiosInstance);
attachLoggingInterceptors(bffAxiosInstance);
