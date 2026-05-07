'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from 'next-themes';
import { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 10,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <SidebarProvider>
          {children}
        </SidebarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
