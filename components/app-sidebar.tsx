"use client"

import {
  BookOpen,
  Compass,
  GraduationCap,
  Home,
  BarChart3,
  BrainCircuit,
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
} from "@/components/ui/sidebar"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"
import { GlobalSearch } from "@/components/global-search"
import { Poppins } from "next/font/google"

const brandFont = Poppins({
  subsets: ["latin"],
  weight: ["600", "700"],
})

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
    {
      title: "Orientación vocacional",
      url: "/orientacion",
      icon: BrainCircuit,
    },
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

  return (
    <Sidebar variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" className="flex items-center gap-2" />}>
              <div className="flex aspect-square size-12 items-center justify-center rounded-lg overflow-hidden bg-muted">
                <img
                  src="/logo_v3.png"
                  alt="Logo UniFlow"
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className={`${brandFont.className} font-semibold text-lg tracking-tight`}>
                  <span>Uni</span>
                  <span className="text-blue-600">Flow</span>
                </span>
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
                isActive={item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)}
              >
                <item.icon className="size-4" />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

      </SidebarContent>

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
