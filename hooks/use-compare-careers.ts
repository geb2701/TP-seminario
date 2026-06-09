"use client"

import { useEffect, useState } from "react"

const STORAGE_KEY = "compare-careers"
export const MAX_COMPARE = 4

export function useCompareCareers() {
  const [ids, setIds] = useState<string[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) setIds(JSON.parse(stored))
    } catch {}
  }, [])

  function sync(next: string[]) {
    setIds(next)
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {}
  }

  return {
    compareIds: ids,
    isComparing: (id: string) => ids.includes(id),
    canAdd: ids.length < MAX_COMPARE,
    add: (id: string) => {
      if (!ids.includes(id) && ids.length < MAX_COMPARE) sync([...ids, id])
    },
    remove: (id: string) => sync(ids.filter((i) => i !== id)),
    clear: () => sync([]),
    set: (newIds: string[]) => sync(newIds.slice(0, MAX_COMPARE)),
  }
}
