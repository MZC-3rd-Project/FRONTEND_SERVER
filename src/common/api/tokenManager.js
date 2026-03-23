import { redirectToAuthLogin } from "./authNavigation.js";

function createTokenManager() {
    let refreshPromise = null
    let config = {}

    function init(cfg = {}) {
        config = {
            onRefreshFail: () => { redirectToAuthLogin() },
            ...cfg,
        }
        if (!config.refreshFn) throw new Error('[TokenManager] refreshFn은 필수입니다.')
    }

    async function refresh() {
        if (refreshPromise) return refreshPromise
        refreshPromise = config
            .refreshFn()
            .catch((error) => { config.onRefreshFail(error); throw error })
            .finally(() => { refreshPromise = null })
        return refreshPromise
    }

    return { init, refresh }
}

export const tokenManager = createTokenManager()
