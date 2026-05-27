"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "uniflow_vocational_profile"

export interface VocationalProfile {
  scores: Record<string, number>
  topArea: string
  personName?: string
  phase3Answers?: Record<string, string>
  savedAt: string
}

export function useVocationalProfile() {
  const [profile, setProfile] = useState<VocationalProfile | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setProfile(JSON.parse(raw) as VocationalProfile)
    } catch {
      // corrupt data
    }
    setHydrated(true)
  }, [])

  const saveProfile = useCallback((data: Omit<VocationalProfile, "savedAt">) => {
    const full: VocationalProfile = { ...data, savedAt: new Date().toISOString() }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(full))
    } catch {
      // storage full
    }
    setProfile(full)
  }, [])

  const clearProfile = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setProfile(null)
  }, [])

  return { profile, hydrated, saveProfile, clearProfile }
}
