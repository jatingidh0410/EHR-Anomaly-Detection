import type { User } from '../types';

// ✅ Demo users with proper typing
const ADMIN_USER = {
  username: 'admin',
  password: 'admin123',
  role: 'admin' as const
} as const;

const ANALYST_USER = {
  username: 'analyst',
  password: 'analyst123',
  role: 'analyst' as const
} as const;

// ✅ Auth service - NO HOISTING ISSUES
export const authService = {
  login: (username: string, password: string): User => {
    if (username === ADMIN_USER.username && password === ADMIN_USER.password) {
      const user: User = {
        id: '1',
        username: ADMIN_USER.username,
        email: 'admin@ehr.local',
        role: 'admin'
      };
      localStorage.setItem('authUser', JSON.stringify(user));
      localStorage.setItem('authToken', 'admin_token_' + Date.now());
      return user;
    }

    if (username === ANALYST_USER.username && password === ANALYST_USER.password) {
      const user: User = {
        id: '2',
        username: ANALYST_USER.username,
        email: 'analyst@ehr.local',
        role: 'analyst'
      };
      localStorage.setItem('authUser', JSON.stringify(user));
      localStorage.setItem('authToken', 'analyst_token_' + Date.now());
      return user;
    }

    throw new Error('Invalid credentials');
  },

  logout: () => {
    localStorage.removeItem('authUser');
    localStorage.removeItem('authToken');
  },

  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('authUser');
    return userStr ? JSON.parse(userStr) as User : null;
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('authToken');
  }
};
