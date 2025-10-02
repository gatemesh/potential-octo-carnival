/**
 * Authentication and User Management Store
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, UserRole, Permission } from '@/types/agriculture';

interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;

  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User) => void;
  hasPermission: (resource: string, action: string) => boolean;
  isAdmin: () => boolean;
  isOwner: () => boolean;
}

// Default permissions by role
const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.OWNER]: [
    { resource: 'nodes', actions: ['read', 'write', 'delete'] },
    { resource: 'config', actions: ['read', 'write'] },
    { resource: 'alerts', actions: ['read', 'write'] },
    { resource: 'users', actions: ['read', 'write'] },
    { resource: 'farms', actions: ['read', 'write', 'delete'] },
  ],
  [UserRole.ADMIN]: [
    { resource: 'nodes', actions: ['read', 'write', 'delete', 'admin'] },
    { resource: 'config', actions: ['read', 'write', 'admin'] },
    { resource: 'alerts', actions: ['read', 'write', 'admin'] },
    { resource: 'users', actions: ['read', 'write', 'admin'] },
    { resource: 'farms', actions: ['read', 'write', 'admin'] },
    { resource: 'mqtt', actions: ['read', 'write', 'admin'] },
    { resource: 'firmware', actions: ['read', 'write', 'admin'] },
    { resource: 'diagnostics', actions: ['read', 'admin'] },
  ],
  [UserRole.VIEWER]: [
    { resource: 'nodes', actions: ['read'] },
    { resource: 'config', actions: ['read'] },
    { resource: 'alerts', actions: ['read'] },
  ],
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        // TODO: Implement actual authentication
        // For now, mock authentication

        // Demo users
        const demoUsers: Record<string, User> = {
          'demo@gatemesh.com': {
            id: 'user-demo',
            email: 'demo@gatemesh.com',
            name: 'Demo User',
            role: UserRole.ADMIN,
            farms: ['farm-1'],
            permissions: DEFAULT_PERMISSIONS[UserRole.ADMIN],
            mqttEnabled: true,
            createdAt: Date.now(),
          },
          'owner@farm.com': {
            id: 'user-owner',
            email: 'owner@farm.com',
            name: 'Farm Owner',
            role: UserRole.OWNER,
            farms: ['farm-1'],
            permissions: DEFAULT_PERMISSIONS[UserRole.OWNER],
            createdAt: Date.now(),
          },
          'admin@gatemesh.com': {
            id: 'user-admin',
            email: 'admin@gatemesh.com',
            name: 'GateMesh Admin',
            role: UserRole.ADMIN,
            farms: ['farm-1', 'farm-2', 'farm-3'], // Admin can see all
            permissions: DEFAULT_PERMISSIONS[UserRole.ADMIN],
            mqttEnabled: true,
            createdAt: Date.now(),
          },
          'viewer@farm.com': {
            id: 'user-viewer',
            email: 'viewer@farm.com',
            name: 'Farm Viewer',
            role: UserRole.VIEWER,
            farms: ['farm-1'],
            permissions: DEFAULT_PERMISSIONS[UserRole.VIEWER],
            createdAt: Date.now(),
          },
        };

        const user = demoUsers[email.toLowerCase()];

        if (user && password === 'demo') {
          set({
            currentUser: { ...user, lastLogin: Date.now() },
            isAuthenticated: true,
          });

          // Load demo nodes for demo user
          if (email.toLowerCase() === 'demo@gatemesh.com') {
            // Import and initialize demo nodes
            import('@/data/demoNodes').then(({ createDemoNodes }) => {
              const demoNodes = createDemoNodes();
              // Store nodes in nodeStore (will be imported in App.tsx)
              if (typeof window !== 'undefined') {
                (window as any).__loadDemoNodes = demoNodes;
              }
            });
          }

          return true;
        }

        return false;
      },

      logout: () => {
        set({
          currentUser: null,
          isAuthenticated: false,
        });
      },

      setUser: (user: User) => {
        set({
          currentUser: user,
          isAuthenticated: true,
        });
      },

      hasPermission: (resource: string, action: string): boolean => {
        const { currentUser } = get();
        if (!currentUser) return false;

        const permission = currentUser.permissions.find(p => p.resource === resource);
        if (!permission) return false;

        return permission.actions.includes(action as any);
      },

      isAdmin: (): boolean => {
        const { currentUser } = get();
        return currentUser?.role === UserRole.ADMIN;
      },

      isOwner: (): boolean => {
        const { currentUser } = get();
        return currentUser?.role === UserRole.OWNER;
      },
    }),
    {
      name: 'gatemesh-auth',
      partialize: (state) => ({
        currentUser: state.currentUser,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

/**
 * Hook to check if user has specific permission
 */
export function usePermission(resource: string, action: string): boolean {
  return useAuthStore((state) => state.hasPermission(resource, action));
}

/**
 * Hook to check if user is admin
 */
export function useIsAdmin(): boolean {
  return useAuthStore((state) => state.isAdmin());
}

/**
 * Hook to check if user is owner
 */
export function useIsOwner(): boolean {
  return useAuthStore((state) => state.isOwner());
}
