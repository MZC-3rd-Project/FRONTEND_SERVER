import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'

export const useAuthStore = create(
    subscribeWithSelector((set) => ({
        isAuthenticated: false,
        isRefreshing: false,
        user: null,

        login: (user) => {
            set({ isAuthenticated: true, user: user ?? null })
        },
        logout: () => {
            set({ isAuthenticated: false, user: null })
        },
        setRefreshing: (bool) => set({ isRefreshing: bool }), // interceptor 전용
        setUser: (user) => set({ user }),
    }))
)
