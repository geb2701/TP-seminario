"use client"

import {
  BookOpen,
  Compass,
  GraduationCap,
  Home,
  BarChart3,
  Users,
} from "lucide-react"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { useDebugState } from "@/components/providers"
import { GlobalSearch } from "@/components/global-search"

const data = {
  navMain: [
    {
      title: "Inicio",
      url: "/",
      icon: Home,
    },
    {
      title: "Explorar carreras",
      url: "/carreras",
      icon: Compass,
    },
    {
      title: "Mis carreras",
      url: "/mis-carreras",
      icon: BookOpen,
    },
    {
      title: "Comparar carreras",
      url: "/comparar",
      icon: BarChart3,
    },
    {
      title: "Universidades",
      url: "/universidades",
      icon: GraduationCap,
    },
    // {
    //   title: "Comunidad",
    //   url: "/comunidad",
    //   icon: Users,
    // },
  ],
}

function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Cambiar tema</span>
    </Button>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  const { state } = useSidebar()
  // DEBUG: toggle forced state for testing empty/error UI components
  const { forcedState, setForcedState } = useDebugState()

  return (
    <Sidebar variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" className="flex items-center gap-2" />}>
              <div className="flex aspect-square size-12 items-center justify-center rounded-lg overflow-hidden bg-muted">
                <img
                  src="/uniflow-logo.png"
                  alt="Logo UniFlow"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-lg">UniFlow</span>
                <span className="text-xs text-muted-foreground">Plataforma académica</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {data.navMain.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                render={<Link href={item.url} className="flex items-center gap-2" />}
                isActive={pathname === item.url || (item.url !== "/" && pathname.startsWith(item.url))}
              >
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

      </SidebarContent>

      
      {/* =====================================================
          DEBUG PANEL — remove before production launch
          Simulates empty/error responses from useApiQuery
          ===================================================== */}
      <SidebarFooter className="border-t border-dashed border-yellow-400/50 p-3 space-y-2">
        {state !== "collapsed" && (
          <p className="text-[10px] font-mono font-bold text-yellow-500 uppercase tracking-widest">
            ⚠ Debug
          </p>
        )}
        <div className="flex flex-col gap-1.5">
          <button
            onClick={() => setForcedState(forcedState === 'empty' ? null : 'empty')}
            className={`w-full rounded px-2 py-1 text-xs font-mono font-semibold transition-colors ${
              forcedState === 'empty'
                ? 'bg-yellow-400 text-yellow-900'
                : 'bg-yellow-400/15 text-yellow-500 hover:bg-yellow-400/30'
            }`}
          >
            {state === "collapsed" ? "∅" : forcedState === 'empty' ? '✓ Empty ON' : 'Force Empty'}
          </button>
          <button
            onClick={() => setForcedState(forcedState === 'error' ? null : 'error')}
            className={`w-full rounded px-2 py-1 text-xs font-mono font-semibold transition-colors ${
              forcedState === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-red-500/15 text-red-400 hover:bg-red-500/30'
            }`}
          >
            {state === "collapsed" ? "✕" : forcedState === 'error' ? '✓ Error ON' : 'Force Error'}
          </button>
        </div>
      </SidebarFooter>
      {/* ===================================================== */}
      
      <SidebarFooter className="md:hidden">
        <SidebarSeparator />
        <GlobalSearch variant="inline" />
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>
      </SidebarFooter>

    </Sidebar>
  )
}
