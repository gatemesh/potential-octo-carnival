import { create } from 'zustand';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  timestamp: number;
}

interface ToastStore {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (toast) =>
    set((state) => {
      const newToast: Toast = {
        ...toast,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        duration: toast.duration ?? 5000,
      };

      // Auto-remove after duration
      if (newToast.duration && newToast.duration > 0) {
        setTimeout(() => {
          get().removeToast(newToast.id);
        }, newToast.duration);
      }

      return {
        toasts: [newToast, ...state.toasts].slice(0, 10), // Keep max 10 toasts
      };
    }),

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    })),

  clearToasts: () => set({ toasts: [] }),
}));