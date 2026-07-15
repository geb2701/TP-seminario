"use client"

import { useState, useEffect, useCallback } from "react"

const STORAGE_KEY = "uniflow_vocational_profile"

export interface VocationalProfile {
  scores: Record<string, number>
  topArea: string
  personName?: string
  phase2Answers?: Record<string, number>
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

    // Guarda el resultado también en la base para poder consultarlo después
    // (estadísticas, MCP). Si falla, no bloqueamos al usuario: el perfil ya
    // quedó en localStorage.
    fetch("/api/vocational-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        personName: data.personName,
        scores: data.scores,
        topArea: data.topArea,
      }),
    }).catch(() => {
      // sin conexión / error del servidor: se pierde el registro remoto, no la UX
    })
  }, [])

  const clearProfile = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setProfile(null)
  }, [])

  return { profile, hydrated, saveProfile, clearProfile }
}
