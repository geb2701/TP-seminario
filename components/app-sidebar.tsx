"use client"

import * as React from "react"
import {
  BookOpen,
  Compass,
  GraduationCap,
  Home,
  BarChart3,
  Users,
} from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Sun, Moon } from "lucide-react"
import { useTheme } from "next-themes"

const data = {
  navMain: [
    {
      title: "Inicio",
      url: "/",
      icon: Home,
      isActive: true,
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
      title: "Comunidad",
      url: "/comunidad",
      icon: Users,
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
  const { state } = useSidebar()

  return (
    <Sidebar variant="sidebar">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link href="/" className="flex items-center gap-2" />}>
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <GraduationCap className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold">Carreras</span>
                <span className="text-xs text-muted-foreground">Finder</span>
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
                isActive={item.isActive}
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
        <div className="relative px-2 py-1">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar carreras, universidades..."
            className="w-full pl-8"
          />
        </div>
        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm text-muted-foreground">Tema</span>
          <ThemeToggle />
        </div>
      </SidebarFooter>

    </Sidebar>
  )
}
