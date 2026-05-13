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
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link"

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

    </Sidebar>
  )
}
