import axios from "axios";

const apiBaseURL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";
const isDev = import.meta.env.DEV;

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

function attachLoggingInterceptors(instance) {
    instance.interceptors.request.use(logApiRequest, (error) => Promise.reject(error));
    instance.interceptors.response.use(logApiResponse, logApiResponseError);
}

export const axiosInstance = axios.create({
    baseURL: apiBaseURL,
    timeout: 5000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

export const bffAxiosInstance = axios.create({
    baseURL: stripApiSuffix(apiBaseURL) || undefined,
    timeout: 5000,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

attachLoggingInterceptors(axiosInstance);
attachLoggingInterceptors(bffAxiosInstance);
