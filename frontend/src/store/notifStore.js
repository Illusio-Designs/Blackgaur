import { create } from 'zustand';
import { mockNotifications } from '@/lib/notifications';

// Shared notification state so the topbar bell and the notifications page
// stay in sync (unread count, read state). Seeded from the demo feed.
export const useNotifStore = create((set, get) => ({
  notifications: mockNotifications,
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
  markRead: (id) =>
    set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),
  markAllRead: () =>
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
}));
