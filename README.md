# TP Seminario — Buscador de Carreras

Plataforma para buscar, comparar y reseñar carreras universitarias en Argentina.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS · shadcn/ui · Prisma v7 · Turso (SQLite edge)

---

## Requisitos previos

- Node.js 18+

> Para correr **localmente** no hace falta cuenta de Turso ni `.env`: la base es un
> SQLite local (`prisma/dev.db`) y el dataset ya viene incluido en el repo
> (`data/siu-careers.json`). Turso solo se necesita para desplegar contra la DB compartida.

---

## Inicio rápido (modo local)

```bash
# 1. Clonar
git clone https://github.com/geb2701/TP-seminario.git
cd TP-seminario

# 2. Instalar dependencias (genera el cliente de Prisma automáticamente)
npm install

# 3. Crear el SQLite local + cargar TODOS los datos (universidades, carreras,
#    ubicaciones, áreas y reseñas curadas) en un solo comando
npm run db:bootstrap

# 4. Levantar la app en modo local
npm run dev:local
```

La app queda en [http://localhost:3000](http://localhost:3000) con el dataset completo.

`npm run db:bootstrap` corre, en orden: `prisma db push` (crea el esquema en
`prisma/dev.db`) → `db:seed` (importa `data/siu-careers.json`) → `db:seed-reviews`
(carga las reseñas/calificaciones curadas). Es idempotente: se puede re-correr.

---

## Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev:local` | Servidor de desarrollo contra el SQLite local |
| `npm run db:bootstrap` | Crea el esquema y carga todo el dataset + reseñas (setup local de un comando) |
| `npm run db:seed` | (Re)importa solo el dataset de carreras/universidades |
| `npm run db:seed-reviews` | (Re)carga solo las reseñas curadas |
| `npm run build` | Compila para producción |
| `npm run mcp` | Inicia el servidor MCP local (stdio) |
| `npm run scrape:siu` / `:transform` | Re-genera `data/siu-careers.json` desde el SIU (no necesario: ya está commiteado) |
| `npx prisma db push` | Sincroniza el schema con la DB local |
| `npx prisma generate` | Regenera el cliente de Prisma |
| `npx prisma studio` | Abre el explorador visual de la DB |

---

## Servidor MCP

El proyecto incluye un servidor [MCP (Model Context Protocol)](https://modelcontextprotocol.io) que permite a asistentes de IA (Claude, Cursor, etc.) consultar la base de datos directamente.

### Tools disponibles

| Tool | Descripción |
|------|-------------|
| `listar_universidades` | Lista universidades, filtrable por tipo o provincia |
| `detalle_universidad` | Detalle completo de una universidad + carreras + reseñas |
| `listar_carreras` | Lista carreras, filtrable por área, modalidad o universidad |
| `detalle_carrera` | Detalle completo de una carrera + plan de estudios + reseñas |
| `buscar` | Búsqueda libre sobre universidades y carreras |
| `listar_areas` | Lista las áreas de conocimiento disponibles |

### Opción 1 — Local (stdio)

Usá este modo si querés conectar Claude Code o Claude Desktop a tu instancia local.

**Claude Code** — agregar en `.claude/settings.json` del proyecto:

```json
{
  "mcpServers": {
    "uniflow": {
      "command": "npx",
      "args": ["tsx", "mcp/server.ts"],
      "cwd": "/ruta/al/proyecto"
    }
  }
}
```

**Claude Desktop** — agregar en `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "uniflow": {
      "command": "npx",
      "args": ["tsx", "/ruta/al/proyecto/mcp/server.ts"]
    }
  }
}
```

> `claude_desktop_config.json` se encuentra en:
> - macOS: `~/Library/Application Support/Claude/`
> - Windows: `%APPDATA%\Claude\`

### Opción 2 — Online (HTTP)

Si la app está deployada (ej. Vercel), el MCP queda disponible automáticamente en:

```
https://tu-app.vercel.app/api/mcp
```

Configurarlo en Claude Code (`.claude/settings.json`):

```json
{
  "mcpServers": {
    "uniflow": {
      "type": "http",
      "url": "https://tu-app.vercel.app/api/mcp"
    }
  }
}
```

Configurarlo en Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "uniflow": {
      "type": "http",
      "url": "https://tu-app.vercel.app/api/mcp"
    }
  }
}
```

> No requiere variables de entorno adicionales: usa las mismas `TURSO_DATABASE_URL` y `TURSO_AUTH_TOKEN` que el resto de la app.
