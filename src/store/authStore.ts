import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

// Demo credentials
const DEMO_USERS: (User & { password: string })[] = [
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@institute.edu',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    password: 'admin123',
  },
  {
    id: 's1',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@student.edu',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun',
    password: 'student123',
  },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        await new Promise((r) => setTimeout(r, 800)); // simulate API
        const found = DEMO_USERS.find(
          (u) => u.email === email && u.password === password
        );
        if (found) {
          const { password: _, ...user } = found;
          set({ user, isAuthenticated: true });
          return { success: true };
        }
        return { success: false, error: 'Invalid email or password.' };
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    { name: 'auth-storage' }
  )
);
