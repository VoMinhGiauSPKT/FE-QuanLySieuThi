import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { STORAGE_KEYS } from '../constants/storageKeys'

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null, // { employeeId, username, fullName, position }
      accessToken: null,
      isAuthenticated: false,

      login: ({ accessToken, employee }) => {
        set({
          user: employee,
          accessToken,
          isAuthenticated: true,
        })
      },

      setAccessToken: (accessToken) => {
        set({ accessToken })
      },

      logout: () => {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        })
      },
    }),
    {
      name: STORAGE_KEYS.AUTH_STORAGE,
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
