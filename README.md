# TP Seminario — Buscador de Carreras

Plataforma para buscar, comparar y reseñar carreras universitarias en Argentina.

**Stack:** Next.js 16 · TypeScript · Tailwind CSS · shadcn/ui · Prisma v7 · Turso (SQLite edge)

---

## Requisitos previos

- Node.js 18+
- Una base de datos en [Turso](https://turso.tech) con su URL y token de autenticación

---

## Instalación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/geb2701/TP-seminario.git
   cd TP-seminario
   ```

2. Instalar dependencias (genera el cliente de Prisma automáticamente):
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   ```bash
   cp .env.example .env
   ```
   Editar `.env` con los valores reales:
   ```env
   DATABASE_URL="file:./prisma/dev.db"
   TURSO_DATABASE_URL="libsql://your-db.turso.io"
   TURSO_AUTH_TOKEN="your-token"
   ```

4. Sincronizar el esquema con la base de datos local:
   ```bash
   npx prisma db push
   ```

5. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```
   La app estará disponible en [http://localhost:3000](http://localhost:3000).

---

## Comandos útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo |
| `npm run build` | Compila para producción |
| `npm run mcp` | Inicia el servidor MCP local (stdio) |
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
