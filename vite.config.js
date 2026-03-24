import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve(), "");
  const proxyTarget = env.VITE_API_PROXY_TARGET;
  const proxyOptions = {
    target: proxyTarget,
    changeOrigin: true,
    autoRewrite: true,
    protocolRewrite: "http",
    cookieDomainRewrite: "",
  };

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: 3000,
      proxy: proxyTarget
        ? {
            "/api": proxyOptions,
            "/bff": proxyOptions,
            "/ws": {
              ...proxyOptions,
              ws: true,
            },
            "/login": proxyOptions,
            "/logout": proxyOptions,
            "/oauth2": proxyOptions,
          }
        : undefined,
    },
    resolve: {
      alias: {
        // eslint-disable-next-line no-undef
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
})
