'use client';

import { useEffect } from 'react';
import { useRouter } from '@/i18n/routing';
import { useAuth } from '@/hooks/useAuth';
import { roleHome } from '@/lib/auth';

export default function DashboardIndex() {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (ready) router.replace(roleHome(user?.role || 'admin'));
  }, [ready, user, router]);

  return <div className="skeleton h-64 w-full rounded-2xl" />;
}
