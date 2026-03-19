import axios from 'axios'
import { tokenManager } from './tokenManager.js'
import { useAuthStore } from '../store/useAuthStore.js'

export function createAuthClient({ baseURL, axiosConfig = {} } = {}) {
    const client = axios.create({ baseURL, ...axiosConfig });

    client.interceptors.response.use(
        (response) => response,
        async (error) => {
            const req = error.config
            if (error.response?.status !== 401 || req._retry) return Promise.reject(error)
            req._retry = true
            useAuthStore.getState().setRefreshing(true)
            try {
                await tokenManager.refresh()
                return client(req)
            } catch (err) {
                useAuthStore.getState().logout()
                return Promise.reject(err)
            } finally {
                useAuthStore.getState().setRefreshing(false)
            }
        }
    )

    return client
}
