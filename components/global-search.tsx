"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Search, GraduationCap, Building2 } from "lucide-react"
import { useApiQuery } from "@/lib/api"

type SearchResult = {
  careers: { id: string; name: string; universityName: string }[]
  universities: { id: string; name: string; city: string; province: string }[]
}

interface GlobalSearchProps {
  variant?: "dropdown" | "inline"
}

export function GlobalSearch({ variant = "dropdown" }: GlobalSearchProps) {
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300)
    return () => clearTimeout(t)
  }, [query])

  useEffect(() => {
    if (variant !== "dropdown") return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [variant])

  const { data } = useApiQuery<SearchResult>(
    ["search", debouncedQuery],
    `search?q=${encodeURIComponent(debouncedQuery)}`,
    { enabled: debouncedQuery.length >= 2 }
  )

  const hasResults = (data?.careers.length ?? 0) + (data?.universities.length ?? 0) > 0
  const showResults = debouncedQuery.length >= 2 && (variant === "inline" || open)

  function handleSelect() {
    setOpen(false)
    setQuery("")
  }

  const results = (
    <>
      {!hasResults ? (
        <p className="p-3 text-sm text-muted-foreground text-center">
          Sin resultados para &ldquo;{debouncedQuery}&rdquo;
        </p>
      ) : (
        <>
          {data!.careers.length > 0 && (
            <div>
              <p className="px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Carreras
              </p>
              {data!.careers.map((c) => (
                <Link
                  key={c.id}
                  href={`/carreras/${c.id}`}
                  onClick={handleSelect}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded text-sm"
                >
                  <GraduationCap className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.universityName}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {data!.universities.length > 0 && (
            <div>
              <p className="px-3 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Universidades
              </p>
              {data!.universities.map((u) => (
                <Link
                  key={u.id}
                  href={`/universidades/${u.id}`}
                  onClick={handleSelect}
                  className="flex items-center gap-3 px-3 py-2 hover:bg-muted rounded text-sm"
                >
                  <Building2 className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.city}, {u.province}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </>
  )

  return (
    <div className="relative" ref={containerRef}>
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Buscar carreras, universidades..."
        className="w-full pl-8"
        value={query}
        onChange={(e) => { setQuery(e.target.value); setOpen(true) }}
        onFocus={() => setOpen(true)}
      />

      {showResults && variant === "dropdown" && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {results}
        </div>
      )}

      {showResults && variant === "inline" && (
        <div className="mt-1 border rounded-lg bg-background max-h-64 overflow-y-auto">
          {results}
        </div>
      )}
    </div>
  )
}
