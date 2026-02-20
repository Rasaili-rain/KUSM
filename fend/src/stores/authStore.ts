import { api } from '@/lib/api';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const UserRole = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

export interface User {
  id: number;
  email: string;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  created_by: number | null;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  checkAuth: () => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  updateProfile: (fullName: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  updateUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { access_token, user } = await api.auth.login(email, password);
          set({
            user,
            token: access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Login failed. Please try again.';
          set({
            error: errorMessage,
            isLoading: false,
            isAuthenticated: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
      },

      clearError: () => set({ error: null }),

      checkAuth: () => {
        const state = get();
        return state.isAuthenticated && state.token !== null;
      },

      isAdmin: () => {
        const state = get();
        return state.user?.role === UserRole.ADMIN || state.user?.role === UserRole.SUPER_ADMIN;
      },

      isSuperAdmin: () => {
        const state = get();
        return state.user?.role === UserRole.SUPER_ADMIN;
      },

      updateProfile: async (fullName: string) => {
        set({ isLoading: true, error: null });
        try {
          const updatedUser = await api.auth.updateProfile({ full_name: fullName });
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to update profile';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      changePassword: async (oldPassword: string, newPassword: string) => {
        set({ isLoading: true, error: null });
        try {
          await api.auth.changePassword({
            old_password: oldPassword,
            new_password: newPassword,
          });
          set({
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage =
            error.response?.data?.detail || 'Failed to change password';
          set({
            error: errorMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      updateUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

// Listen for unauthorized events from axios interceptor
if (typeof window !== 'undefined') {
  window.addEventListener('auth:unauthorized', () => {
    useAuthStore.getState().logout();
  });
}