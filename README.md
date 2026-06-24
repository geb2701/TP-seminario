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
| `npx prisma studio` | Abre el explorador visual de la DB |
| `npm run scrape:siu` / `:transform` | Re-genera `data/siu-careers.json` desde el SIU (no necesario: ya está commiteado) |
