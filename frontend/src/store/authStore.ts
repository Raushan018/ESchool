import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';
import api from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  updateUser: (data: { name?: string; email?: string }) => Promise<{ success: boolean; error?: string }>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        try {
          const { data } = await api.post('/auth/login', { email, password });

          const user: User = {
            id: data.data._id,
            name: data.data.name,
            email: data.data.email,
            role: data.data.role,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.data.name)}`,
          };

          set({ user, token: data.token, isAuthenticated: true });
          return { success: true };
        } catch (err: unknown) {
          const msg =
            (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
            'Network error. Is the server running?';
          return { success: false, error: msg };
        }
      },

      updateUser: async (data) => {
        try {
          const { data: res } = await api.put('/user/profile', data);
          const updated: User = {
            id: res.data._id,
            name: res.data.name,
            email: res.data.email,
            role: res.data.role,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(res.data.name)}`,
          };
          set({ user: updated });
          return { success: true };
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Update failed.';
          return { success: false, error: msg };
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        try {
          await api.put('/user/password', { currentPassword, newPassword });
          return { success: true };
        } catch (err: unknown) {
          const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Password change failed.';
          return { success: false, error: msg };
        }
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
