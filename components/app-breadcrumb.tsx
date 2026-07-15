"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useBreadcrumbLabels } from "@/components/breadcrumb-context"

const routeLabels: Record<string, string> = {
  carreras: "Explorar Carreras",
  "mis-carreras": "Mis Carreras",
  comparar: "Comparar",
  universidades: "Universidades",
}

function isIdSegment(segment: string) {
  return (
    /^\d+$/.test(segment) ||
    /^[0-9a-f-]{36}$/i.test(segment) ||
    /^c[a-z0-9]{20,}$/.test(segment)
  )
}

function segmentLabel(segment: string): string {
  if (isIdSegment(segment)) return "Detalle"
  return routeLabels[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1)
}

export function AppBreadcrumb() {
  const pathname = usePathname()
  const dynamicLabels = useBreadcrumbLabels()
  const segments = pathname.split("/").filter(Boolean)

  const items = [
    { label: "Inicio", href: "/" },
    ...segments.map((segment, index) => {
      const href = "/" + segments.slice(0, index + 1).join("/")
      const label = dynamicLabels[href] ?? segmentLabel(segment)
      return { label, href }
    }),
  ]

  if (items.length === 1) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Inicio</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <React.Fragment key={item.href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage>{item.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink render={<Link href={item.href} />}>
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          )
        })}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
