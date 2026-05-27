'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from 'next-themes';
import { ReactNode, createContext, useContext, useState } from 'react';
import { BreadcrumbProvider } from '@/components/breadcrumb-context';

// ============================================================
// DEBUG: Forced state context — for testing empty/error UI states.
// Remove before production launch.
// ============================================================
export type DebugForcedState = null | 'empty' | 'error'

const DebugContext = createContext<{
  forcedState: DebugForcedState
  setForcedState: (s: DebugForcedState) => void
}>({ forcedState: null, setForcedState: () => {} })

export function useDebugState() {
  return useContext(DebugContext)
}
// ============================================================

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
  // DEBUG: state lives here so all children can read it via useDebugState()
  const [forcedState, setForcedState] = useState<DebugForcedState>(null)

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <BreadcrumbProvider>
          <SidebarProvider>
            <DebugContext.Provider value={{ forcedState, setForcedState }}>
              {children}
            </DebugContext.Provider>
          </SidebarProvider>
        </BreadcrumbProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
