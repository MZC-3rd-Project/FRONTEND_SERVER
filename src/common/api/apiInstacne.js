import axios from "axios";
import keycloak from "@/common/auth/keycloak";

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:8080/api",
    timeout: 5000,
    headers: {
        "Content-Type": "application/json",
    },
});

// 요청 인터셉터: 모든 API 요청에 Bearer 토큰 자동 주입
axiosInstance.interceptors.request.use(
    async (config) => {
        if (keycloak.authenticated) {
            try {
                await keycloak.updateToken(70);
                config.headers.Authorization = `Bearer ${keycloak.token}`;
            } catch (error) {
                console.error("Failed to refresh token", error);
                keycloak.clearToken();
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 발생 시 로그인 페이지로 유도
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.warn("세션이 만료되었습니다. 다시 로그인해주세요.");
            keycloak.login();
        }
        return Promise.reject(error);
    }
);
