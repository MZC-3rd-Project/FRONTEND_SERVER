import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const useAuthStore = create(
    subscribeWithSelector((set) => ({
        isAuthenticated: false,
        isRefreshing: false,
        isResolved: false,
        user: null,

        login: (user) => {
            set({ isAuthenticated: true, isResolved: true, user: user ?? null })
        },
        logout: () => {
            set({ isAuthenticated: false, isResolved: true, user: null })
        },
        resolveAuth: (user) => set({
            isAuthenticated: Boolean(user),
            isResolved: true,
            user: user ?? null,
        }),
        setRefreshing: (bool) => set({ isRefreshing: bool }), // interceptor 전용
        setUser: (user) => set({ user }),
    }))
)
