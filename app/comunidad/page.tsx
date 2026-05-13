"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@/lib/api"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Heart, MessageCircle, Send } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { ErrorState } from "@/components/error-state"

type Post = {
  id: string
  content: string
  authorName: string
  authorRole: string | null
  tags: string[]
  likes: number
  createdAt: string
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `Hace ${mins} min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `Hace ${hours} h`
  const days = Math.floor(hours / 24)
  return `Hace ${days} día${days > 1 ? "s" : ""}`
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
}

export default function ComunidadPage() {
  const queryClient = useQueryClient()

  const [content, setContent] = useState("")
  const [authorName, setAuthorName] = useState("")
  const [authorRole, setAuthorRole] = useState("")
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  const { data: posts, isLoading, isError, refetch } = useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: () => api.get("posts").json<Post[]>(),
  })

  const createPost = useMutation({
    mutationFn: (data: { content: string; authorName: string; authorRole: string }) =>
      api.post("posts", { json: data }).json<Post>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] })
      setContent("")
      setAuthorRole("")
    },
  })

  const likePost = useMutation({
    mutationFn: (id: string) =>
      api.post(`posts/${id}/like`).json<{ likes: number }>(),
    onSuccess: (data, id) => {
      setLikedIds((prev) => new Set([...prev, id]))
      queryClient.setQueryData<Post[]>(["posts"], (old) =>
        old?.map((p) => (p.id === id ? { ...p, likes: data.likes } : p))
      )
    },
  })

  function handleSubmit() {
    if (!content.trim() || !authorName.trim()) return
    createPost.mutate({ content, authorName, authorRole })
  }

  return (
    <div className="space-y-8 p-6 lg:p-8 max-w-2xl mx-auto">
      <section className="space-y-2">
        <h1 className="text-3xl font-bold">Comunidad</h1>
        <p className="text-muted-foreground">
          Conectá con otros estudiantes, compartí experiencias y resolvé dudas
        </p>
      </section>

      <Card className="border-2 border-dashed">
        <CardHeader className="pb-3">
          <div className="flex gap-3">
            <Input
              placeholder="Tu nombre"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-40 shrink-0"
            />
            <Input
              placeholder="Tu rol (ej: Estudiante de Medicina)"
              value={authorRole}
              onChange={(e) => setAuthorRole(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-3 pt-0">
          <Textarea
            placeholder="Compartí tu experiencia, hacé una pregunta o dá un consejo..."
            className="min-h-[100px] resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={!content.trim() || !authorName.trim() || createPost.isPending}
          >
            <Send className="h-4 w-4 mr-2" />
            {createPost.isPending ? "Publicando..." : "Publicar"}
          </Button>
        </CardContent>
      </Card>

      <section className="space-y-4">
        {isLoading && Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}

        {isError && (
          <ErrorState
            title="No pudimos cargar las publicaciones"
            description="Ocurrió un error al conectar con el servidor."
            onRetry={refetch}
          />
        )}

        {!isLoading && !isError && posts?.length === 0 && (
          <EmptyState
            icon={MessageCircle}
            title="Todavía no hay publicaciones"
            description="¡Sé el primero en publicar!"
          />
        )}

        {!isLoading && !isError && posts?.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>{initials(post.authorName)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm">{post.authorName}</p>
                        {post.authorRole && (
                          <p className="text-xs text-muted-foreground">{post.authorRole}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-0">
                  <p className="text-sm leading-relaxed">{post.content}</p>

                  {post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {post.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                    <button
                      onClick={() => !likedIds.has(post.id) && likePost.mutate(post.id)}
                      className={`flex items-center gap-1.5 transition-colors ${
                        likedIds.has(post.id)
                          ? "text-red-500"
                          : "hover:text-red-500"
                      }`}
                    >
                      <Heart className={`h-4 w-4 ${likedIds.has(post.id) ? "fill-current" : ""}`} />
                      {post.likes}
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
      </section>
    </div>
  )
}
