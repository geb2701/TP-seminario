"use client"

import { Heart, GitBranch, X } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="border-t bg-background py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-semibold mb-4">Sobre Nosotros</h3>
            <p className="text-sm text-muted-foreground">
              Tu plataforma de confianza para explorar y comparar carreras universitarias en Argentina.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Enlaces Rápidos</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/carreras" className="text-muted-foreground hover:text-foreground transition">Carreras</a></li>
              <li><a href="/universidades" className="text-muted-foreground hover:text-foreground transition">Universidades</a></li>
              <li><a href="/blog" className="text-muted-foreground hover:text-foreground transition">Blog</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacidad" className="text-muted-foreground hover:text-foreground transition">Privacidad</a></li>
              <li><a href="/terminos" className="text-muted-foreground hover:text-foreground transition">Términos</a></li>
              <li><a href="/contacto" className="text-muted-foreground hover:text-foreground transition">Contacto</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t pt-8 flex items-center justify-between text-sm text-muted-foreground">
          <p>&copy; 2026 Carreras Finder. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
