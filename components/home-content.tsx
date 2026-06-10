"use client"

import { useState } from "react"
import { VocationalTestHomeSection } from "@/components/vocational-test-home-section"

export function HomeContent({ secondarySections }: { secondarySections: React.ReactNode }) {
  const [isResultsView, setIsResultsView] = useState(false)

  return (
    <>
      <section className="space-y-6 pt-4">
        <h1 className="max-w-5xl mx-auto px-6 lg:px-10 text-4xl font-bold tracking-tight lg:text-5xl">
          Encontrá la carrera universitaria<br className="hidden md:block" /> para vos
        </h1>
        <VocationalTestHomeSection onResultsViewChange={setIsResultsView} />
      </section>

      {!isResultsView && secondarySections}
    </>
  )
}
