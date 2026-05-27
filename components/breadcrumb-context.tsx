"use client"

import { createContext, useCallback, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

type BreadcrumbContextType = {
  labels: Record<string, string>
  setLabel: (path: string, label: string) => void
  clearLabel: (path: string) => void
}

const BreadcrumbContext = createContext<BreadcrumbContextType>({
  labels: {},
  setLabel: () => {},
  clearLabel: () => {},
})

export function BreadcrumbProvider({ children }: { children: ReactNode }) {
  const [labels, setLabels] = useState<Record<string, string>>({})

  const setLabel = useCallback((path: string, label: string) => {
    setLabels((prev) => ({ ...prev, [path]: label }))
  }, [])

  const clearLabel = useCallback((path: string) => {
    setLabels((prev) => {
      const next = { ...prev }
      delete next[path]
      return next
    })
  }, [])

  return (
    <BreadcrumbContext.Provider value={{ labels, setLabel, clearLabel }}>
      {children}
    </BreadcrumbContext.Provider>
  )
}

export function useBreadcrumbLabels() {
  return useContext(BreadcrumbContext).labels
}

export function useDynamicBreadcrumb(path: string, label: string | null | undefined) {
  const { setLabel, clearLabel } = useContext(BreadcrumbContext)

  useEffect(() => {
    if (label) setLabel(path, label)
    return () => clearLabel(path)
  }, [path, label, setLabel, clearLabel])
}
