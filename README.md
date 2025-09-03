# Bun Monorepo — Elysia (TS) API + Vue 3 (JS) Web

This repository is a **conversion starter** for your Bun project from **Next.js (TS) backend + React (TS)** to:

- **Backend:** [Elysia](https://elysiajs.com/) with **TypeScript** (Bun runtime)
- **Frontend:** **Vue 3** with Composition API (JavaScript) + **Tailwind CSS v4** + **lucide-vue-next**
- **Integration:** `fetch` from the frontend to the backend
- **Tooling:** Vite for the web; Bun workspaces monorepo

## Quickstart

1. Install Bun if you haven't:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   # ensure ~/.bun/bin is on your PATH (restart shell if needed)
   ```

2. Install dependencies:
   ```bash
   cd {this_repo}
   bun install
   ```

3. Configure envs:
   - Copy `.env.example` in `apps/api` to `.env` and adjust ports/origins if needed.
   - Copy `.env.example` in `apps/web` to `.env` and set `VITE_API_URL` to your API URL.

4. Run the API:
   ```bash
   bun run dev:api
   ```
   Default: http://localhost:3000

5. Run the Web (in another terminal):
   ```bash
   bun run dev:web
   ```
   Default: http://localhost:5173

## Notes on Tailwind CSS v4
Tailwind v4 moved its PostCSS plugin into `@tailwindcss/postcss`. This repo is already configured via `postcss.config.js` in `apps/web`:
```js
export default {
  plugins: {
    '@tailwindcss/postcss': {}
  }
}
```
In your CSS entry, we just `@import "tailwindcss";`—no separate config required unless you need customizations.

## Where to put your converted code
- **API:** Replace or extend routes in `apps/api/src/index.ts`.
- **Web:** Replace the example UI in `apps/web/src/App.vue` and components; add pages as needed.

## CORS
We enable CORS in the API for the frontend dev server origin. Set `FRONTEND_ORIGIN` in `apps/api/.env` (defaults to `*`).

## Scripts
- `bun run dev:api` / `bun run dev:web` — dev servers
- `bun run build:api` / `bun run build:web` — builds
- `bun run start:api` / `bun run start:web` — production-ish start