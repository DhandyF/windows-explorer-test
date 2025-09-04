# Windows Explorer–Style File Manager (Vue 3 + Elysia + Prisma + MySQL)

A full‑stack monorepo featuring:

- **Frontend:** Vue 3 (Composition API, JavaScript), Tailwind CSS v4, `lucide-vue-next`
- **Backend:** Bun + **Elysia** (TypeScript)
- **Database:** **MySQL** with **Prisma ORM**
- **DX:** Docker Compose for local MySQL, hot reload API, seed scripts
- **Features:**
  - Windows Explorer–like UI: folder tree (left) + content panel (right)
  - Per‑folder search
  - Create **folders** and **files** in the **currently opened** folder
  - Single‑click to open folders (configurable), multi‑select
  - Frontend ↔ Backend via `fetch`

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [1) Start MySQL in Docker](#1-start-mysql-in-docker)
  - [2) Environment Variables](#2-environment-variables)
  - [3) Install Dependencies](#3-install-dependencies)
  - [4) Prisma Generate, Migrate & Seed](#4-prisma-generate-migrate--seed)
  - [5) Run the Apps](#5-run-the-apps)
- [API](#api)
  - [DTOs](#dtos)
  - [Endpoints](#endpoints)
  - [cURL Quick Tests](#curl-quick-tests)
- [Scripts Reference](#scripts-reference)
- [Troubleshooting](#troubleshooting)
- [Production Notes](#production-notes)
- [License](#license)

---

## Tech Stack

- **Runtime:** [Bun](https://bun.sh)  
- **API:** [Elysia](https://elysiajs.com) (TypeScript)  
- **ORM:** [Prisma](https://www.prisma.io/) with **MySQL**  
- **UI:** [Vue 3](https://vuejs.org/) (Composition API, JS), [Tailwind CSS v4](https://tailwindcss.com/), [`lucide-vue-next`](https://www.npmjs.com/package/lucide-vue-next)

---

## Project Structure

```
apps/
  api/
    src/
      index.ts
      lib/
        prisma.ts                # Prisma client singleton
      routes/
        explorer.ts              # REST: folders/files
      services/
        database.service.ts      # Prisma-backed data access
      types.ts                   # API DTO types (snake_case)
    prisma/
      schema.prisma              # Prisma schema (Folder, FileItem)
      seed.ts                    # Dev seed (Documents/Invoices/Transport etc.)
    .env
    package.json
    tsconfig.json
  web/
    src/
      assets/
        tailwind.css
      composables/
        api.js             # fetch wrapper for API
      components/
        ContentPanel.vue       # uses ContentHeader/Items/Breadcrumb
        ContentHeader.vue      # has New Folder / New File buttons
        ContentItems.vue
        ContentBreadcrumb.vue
        FolderTree.vue
        FolderNode.vue
        HeaderBar.vue
        HighlightedText.vue
      views/
        WindowExplorer.vue
    index.html
    App.vue
    .env                         # VITE_API_URL
    package.json
    postcss.config.js
    vite.config.js
bun.lock
docker-compose.yml               # MySQL 8 container
package.json
README.md
```

---

## Getting Started

### 1) Start MySQL in Docker

Create `docker-compose.yml` in the repo root (adjust as needed):

```yaml
version: "3.9"
services:
  mysql:
    image: mysql:8.0
    container_name: explorer-mysql
    command: ["--default-authentication-plugin=mysql_native_password"]
    environment:
      MYSQL_ROOT_PASSWORD: rootpass
      MYSQL_DATABASE: explorer
      MYSQL_USER: appuser
      MYSQL_PASSWORD: apppass
    ports:
      - "3308:3306"
    volumes:
      - dbdata:/var/lib/mysql
volumes:
  dbdata:
```

Bring it up:

```bash
docker compose up -d
docker ps --format 'table {{.Names}}\t{{.Ports}}'
```

Create the **shadow** DB for Prisma Migrate (inside the container or via CLI):

```bash
docker exec -it explorer-mysql mysql -uroot -prootpass -e "
CREATE DATABASE IF NOT EXISTS explorer_shadow;
GRANT ALL PRIVILEGES ON explorer.* TO 'appuser'@'%';
GRANT ALL PRIVILEGES ON explorer_shadow.* TO 'appuser'@'%';
FLUSH PRIVILEGES;"
```

---

### 2) Environment Variables

**`apps/api/.env`**

```env
DATABASE_URL="mysql://appuser:apppass@127.0.0.1:3308/explorer"
SHADOW_DATABASE_URL="mysql://appuser:apppass@127.0.0.1:3308/explorer_shadow"
API_PORT=3000
FRONTEND_ORIGIN=http://localhost:5173
```

**`apps/web/.env`**

```env
VITE_API_URL="http://localhost:3000"
```

> Prefer `127.0.0.1` to avoid socket/TCP quirks with MySQL.

---

### 3) Install Dependencies

```bash
# API
cd apps/api
bun install

# Web
cd ../web
bun install
```

---

### 4) Prisma Generate, Migrate & Seed

```bash
# API
cd apps/api

bun run prisma:generate
bun run prisma:migrate     # creates tables (uses shadow DB)
bun run db:seed            # seeds folders/files
```

> Ensure `schema.prisma` includes:
> ```prisma
> datasource db {
>   provider          = "mysql"
>   url               = env("DATABASE_URL")
>   shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
> }
> ```

---

### 5) Run the Apps

**API** (Elysia):
```bash
cd apps/api
bun run dev
# http://localhost:3000
```

**Web** (Vite):
```bash
cd apps/web
bun run dev
# http://localhost:5173
```

---

## API

### DTOs (snake_case)

**Folder**
```json
{
  "id": 1,
  "name": "Invoices",
  "path": "/Documents/Invoices",
  "parent_id": 12,
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-01-01T00:00:00.000Z",
  "children": []   // only present on /api/folders tree endpoint
}
```

**FileItem**
```json
{
  "id": 10,
  "name": "Report.txt",
  "folder_id": 1,
  "file_type": "txt",
  "file_size": 8192,
  "path": "/Documents/Invoices/Report.txt",
  "created_at": "2025-01-01T00:00:00.000Z",
  "updated_at": "2025-01-01T00:00:00.000Z"
}
```

### Endpoints

- `GET /api/folders` → **tree** of folders (roots with nested `children`)
- `GET /api/folders/:id` → single folder (no children)
- `GET /api/folders/:id/subfolders` → flat list of subfolders
- `GET /api/folders/:id/files` → files in folder
- `POST /api/folders` → create folder in current folder
  - **body:** `{ "parentId": number|null, "name": string }`
  - **201 →** `Folder`
- `POST /api/files` → create file **record** (metadata) in folder
  - **body:** `{ "folderId": number, "name": string, "fileType"?: string|null, "fileSize"?: number }`
  - **201 →** `FileItem`

**Errors** return `{ "error": string }` with a meaningful status (400/404/409…)

### cURL Quick Tests

```bash
# Tree
curl http://localhost:3000/api/folders

# Subfolders of folderId=1
curl http://localhost:3000/api/folders/1/subfolders

# Files in folderId=1
curl http://localhost:3000/api/folders/1/files

# Create a folder under Documents (id=1)
curl -X POST http://localhost:3000/api/folders \
  -H 'Content-Type: application/json' \
  -d '{"parentId":1,"name":"Transport"}'

# Create a file in Documents (id=1)
curl -X POST http://localhost:3000/api/files \
  -H 'Content-Type: application/json' \
  -d '{"folderId":1,"name":"Report.txt"}'
```

---

## Scripts Reference

### `apps/api/package.json`

- `dev` – start Elysia in watch mode  
- `start` – start Elysia once  
- `postinstall` – `prisma generate` (optional, recommended)  
- `prisma:generate` – generate Prisma client  
- `prisma:migrate` – apply dev migration (`--name init`)  
- `prisma:deploy` – apply migrations in prod  
- `prisma:push` – push schema w/o history (non‑prod)  
- `prisma:studio` – DB UI  
- `db:seed` – run seed script

### `apps/web/package.json` (typical)
- `dev` – Vite dev  
- `build` – Vite build  
- `preview` – preview build

---

## Troubleshooting

**P3014 (shadow DB creation failed)**  
- Ensure:
  - `schema.prisma` has `shadowDatabaseUrl = env("SHADOW_DATABASE_URL")`
  - DB `explorer_shadow` exists
  - `appuser` has privileges on `explorer` & `explorer_shadow`

**Unknown auth plugin `sha256_password`**  
- Start container with `--default-authentication-plugin=mysql_native_password` or alter the user:  
  `ALTER USER 'appuser'@'%' IDENTIFIED WITH mysql_native_password BY 'apppass';`

**Access denied for root** after changing envs  
- The data volume preserved the original password. For dev, reset:  
  `docker compose down -v && docker compose up -d`

**Port in use**  
- Change `ports: "3309:3306"` and update `.env`.

**`localhost` vs `127.0.0.1`**  
- Prefer `127.0.0.1` for MySQL in `.env`.

---

## Production Notes

- Use `bun run prisma:deploy` during deploys.  
- Tighten CORS `FRONTEND_ORIGIN`.  
- Add logging, metrics, input validation.  
- For **file uploads**, add a `POST /api/files/upload` that accepts `FormData` and stores to disk/S3, then creates the DB record.

---

## License

MIT © DhandyF
