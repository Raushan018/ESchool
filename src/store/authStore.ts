import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

// ─── Registered user shape stored in localStorage ────────────────────────────
export interface RegisteredUser extends User {
  password: string;
  mobile: string;
}

const REGISTERED_USERS_KEY = 'eschool_registered_users';

export function getRegisteredUsers(): RegisteredUser[] {
  try {
    return JSON.parse(localStorage.getItem(REGISTERED_USERS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function saveRegisteredUser(u: RegisteredUser) {
  const users = getRegisteredUsers();
  users.push(u);
  localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(users));
}

// ─── Built-in demo accounts ───────────────────────────────────────────────────
const DEMO_USERS: RegisteredUser[] = [
  {
    id: 'admin1',
    name: 'Admin User',
    email: 'admin@institute.edu',
    mobile: '9000000001',
    role: 'admin',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
    password: 'admin123',
  },
  {
    id: 's1',
    name: 'Arjun Sharma',
    email: 'arjun.sharma@student.edu',
    mobile: '9876543210',
    role: 'student',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=arjun',
    password: 'student123',
  },
];

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (emailOrMobile: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (emailOrMobile, password) => {
        await new Promise((r) => setTimeout(r, 800));

        const allUsers = [...DEMO_USERS, ...getRegisteredUsers()];
        const found = allUsers.find(
          (u) =>
            (u.email === emailOrMobile || u.mobile === emailOrMobile) &&
            u.password === password
        );

        if (found) {
          const { password: _, ...user } = found;
          set({ user, isAuthenticated: true });
          return { success: true };
        }
        return { success: false, error: 'Invalid email / mobile or password.' };
      },

      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    { name: 'auth-storage' }
  )
);
