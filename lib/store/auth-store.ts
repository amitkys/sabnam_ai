import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  isAuthenticated: boolean;
  redirectUrl: string | null;
  setRedirectUrl: (url: string | null) => void;
  setIsAuthenticated: (isAuthenticated: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      redirectUrl: null,
      setRedirectUrl: (url) => {
        console.log('Setting redirect URL:', url);
        set({ redirectUrl: url });
      },
      setIsAuthenticated: (isAuthenticated) => {
        console.log('Setting authentication state:', isAuthenticated);
        set({ isAuthenticated });
      },
      clearAuth: () => {
        console.log('Clearing auth state');
        set({ isAuthenticated: false, redirectUrl: null });
      },
    }),
    {
      name: 'auth-storage',
      // Only persist redirectUrl, not isAuthenticated (should be synced from session)
      partialize: (state) => ({ redirectUrl: state.redirectUrl }),
    }
  )
) 