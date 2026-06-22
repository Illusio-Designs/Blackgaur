'use client';

import { useAuth } from '@/hooks/useAuth';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import CommandPalette from '@/components/ui/CommandPalette';

export default function DashboardShell({ children }) {
  const { user, ready } = useAuth();
  const role = user?.role || 'admin';

  return (
    <div className="flex min-h-screen bg-brand-surface">
      <Sidebar role={role} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex-1 px-4 py-6 lg:px-8">
          <div className="mx-auto w-full max-w-[1400px]">
            {ready ? children : <div className="skeleton h-64 w-full rounded-2xl" />}
          </div>
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
