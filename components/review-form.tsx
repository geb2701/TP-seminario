"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useApiMutation, postData } from "@/lib/api"

type ReviewPayload = {
  rating: number
  content: string
  authorName?: string
}

type ReviewFormProps = {
  postUrl: string
  onSuccess: () => void
  placeholder?: string
}

export function ReviewForm({ postUrl, onSuccess, placeholder = "Contá tu experiencia cursando esta carrera..." }: ReviewFormProps) {
  const [authorName, setAuthorName] = useState("")
  const [rating, setRating] = useState(0)
  const [hovered, setHovered] = useState(0)
  const [content, setContent] = useState("")

  const { mutate, isPending } = useApiMutation<unknown, Error, ReviewPayload>({
    mutationFn: (data) => postData(postUrl, data),
    onSuccess: () => {
      setAuthorName("")
      setRating(0)
      setContent("")
      onSuccess()
    },
  })

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!rating || !content.trim()) return
    mutate({ rating, content, authorName: authorName || undefined })
  }

  const displayRating = hovered || rating

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Escribir una reseña</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Tu nombre (opcional)"
            value={authorName}
            onChange={(e) => setAuthorName(e.target.value)}
            disabled={isPending}
          />

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Puntaje</p>
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => {
                const value = i + 1
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={isPending}
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHovered(value)}
                    onMouseLeave={() => setHovered(0)}
                    className="focus:outline-none disabled:cursor-not-allowed"
                    aria-label={`${value} estrellas`}
                  >
                    <Star
                      className={`h-6 w-6 transition-colors ${
                        value <= displayRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          </div>

          <Textarea
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            disabled={isPending}
            rows={4}
            required
          />

          <Button
            type="submit"
            disabled={isPending || !rating || !content.trim()}
            className="w-full"
          >
            {isPending ? "Enviando..." : "Publicar reseña"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
