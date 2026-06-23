'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastViewport } from '@/components/ui/Toast';
import ThemeProvider from '@/components/ThemeProvider';
import RouteProgress from '@/components/RouteProgress';

export default function Providers({ children }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            refetchOnWindowFocus: false,
            staleTime: 30_000,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <RouteProgress />
      <ThemeProvider>{children}</ThemeProvider>
      <ToastViewport />
    </QueryClientProvider>
  );
}
