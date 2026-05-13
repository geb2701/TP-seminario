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
| `npx prisma db push` | Sincroniza el schema con la DB local |
| `npx prisma generate` | Regenera el cliente de Prisma |
| `npx prisma studio` | Abre el explorador visual de la DB |
