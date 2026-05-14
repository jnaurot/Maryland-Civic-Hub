# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

This is a **Maryland civic information web app** built as a pnpm workspace monorepo. It displays federal and state representatives, bills, and campaign finance data by geocoding a user’s address and aggregating data from external civic APIs.

## Common commands

- `pnpm install` — Install dependencies. The root `preinstall` script enforces pnpm and blocks npm/yarn.
- `pnpm run typecheck` — Full typecheck across all packages (libs + artifacts + scripts).
- `pnpm run typecheck:libs` — Typecheck only the referenced libraries (`lib/db`, `lib/api-client-react`, `lib/api-zod`).
- `pnpm run test` — Run the Vitest test suite.
- `pnpm run build` — Typecheck everything, then build all packages recursively.
- `pnpm --filter @workspace/api-server run dev` — Build and start the API server in development mode.
- `pnpm --filter @workspace/md-reps run dev` — Start the Vite dev server for the frontend.
- `pnpm --filter @workspace/md-reps run build` — Build the frontend for production.
- `pnpm --filter @workspace/md-reps run serve` — Preview the production frontend build.
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate React Query hooks and Zod schemas from `openapi.yaml`.
- `pnpm --filter @workspace/db run push` — Push Drizzle schema changes to the database.

Vitest is configured at the workspace root for focused unit tests around shared utilities and backend helpers.

## Monorepo structure

The workspace is organized into two main directories:

- **`artifacts/`** — Deployable applications:
  - `api-server` — Express 5 API that proxies/aggregates external civic APIs.
  - `md-reps` — Main React 19 + Vite frontend.
  - `mockup-sandbox` — Secondary Vite + React playground (rarely used).
- **`lib/`** — Shared libraries:
  - `api-spec` — OpenAPI YAML spec (`openapi.yaml`) and Orval config (`orval.config.ts`).
  - `api-client-react` — **Generated** React Query hooks (do not edit by hand; run codegen instead).
  - `api-zod` — **Generated** Zod validation schemas (do not edit by hand; run codegen instead).
  - `db` — Drizzle ORM database connection and schema.

All packages use `type: "module"` and share a base TypeScript config (`tsconfig.base.json`) with `moduleResolution: "bundler"` and `customConditions: ["workspace"]`.

Dependency versions are managed via the **pnpm catalog** in `pnpm-workspace.yaml`. When adding shared dependencies, prefer catalog entries over explicit versions.

## High-level architecture

### API contract and code generation

The API contract is defined in `lib/api-spec/openapi.yaml`. From this spec, Orval generates:

1. **React Query hooks** into `lib/api-client-react/src/generated/`
2. **Zod schemas** into `lib/api-zod/src/generated/`

The generated client uses a **custom fetch** implementation (`lib/api-client-react/src/custom-fetch.ts`) that:
- Prepends a configurable base URL (for non-web clients)
- Supports an async auth token getter (for non-web clients)
- Throws `ApiError` on non-2xx responses
- The generated hooks use `baseUrl: "/api"`, so frontend calls hit `/api/*` relative to the current origin

**Important:** If you change the API contract, run `pnpm --filter @workspace/api-spec run codegen` and then `pnpm run typecheck:libs` to update generated code before consuming it.

### Frontend (`artifacts/md-reps`)

- **Build tool:** Vite 7 with `@tailwindcss/vite` and `@vitejs/plugin-react`.
- **Styling:** Tailwind CSS v4 with `class-variance-authority`, `tailwind-merge`, and `tw-animate-css`.
- **Routing:** `wouter` (not React Router). The router base is set from `import.meta.env.BASE_URL`.
- **State / data fetching:** TanStack React Query v5. Pages import hooks from `@workspace/api-client-react` (e.g., `useGetRepresentativesByAddress`).
- **UI primitives:** Radix UI components in `@/components/ui/` (standard shadcn-style pattern).
- **Path aliases:**
  - `@/` → `src/`
  - `@assets/` → `attached_assets/`

The Vite dev server proxies `/api` to `http://localhost:3001`. Both `PORT` and `BASE_PATH` environment variables are required at build time (Vite config validates them at startup).

### Backend (`artifacts/api-server`)

- **Framework:** Express 5.
- **Build:** Custom esbuild script (`build.mjs`) that bundles to ESM (`dist/index.mjs`). It uses `esbuild-plugin-pino` to handle pino worker transports and injects a `globalThis.require` banner for CJS compatibility.
- **Logging:** `pino` + `pino-http` with request/response serialization.
- **Routes:** Mounted under `/api` in `src/routes/index.ts`. Key routers:
  - `representatives` — Geocodes an address via the Census geocoder, then fetches federal reps from Congress.gov and state legislators from OpenStates.
  - `federal` — Congress.gov proxy endpoints (bills, members).
  - `state` — OpenStates proxy endpoints (bills, people).
  - `finance` — Campaign finance data proxy.
  - `health` — Health check.

The server requires `PORT` and external API keys (`CONGRESS_API_KEY`, `OPENSTATES_API_KEY`, `GOOGLE_CIVIC_API_KEY`). It also consumes `@workspace/db` and `@workspace/api-zod` for database access and request validation.

### Database (`lib/db`)

- **ORM:** Drizzle ORM with `drizzle-zod` for schema validation.
- **Driver:** `node-postgres` (`pg` Pool).
- **Connection:** `DATABASE_URL` is required.
- **Schema:** Currently mostly empty (`lib/db/src/schema/index.ts` exports nothing). The pattern for adding tables is documented in that file: define a Drizzle table, export an insert schema via `createInsertSchema`, and export inferred types.

## Environment variables

The following are required for development:

- `PORT` — Port for the API server (also used by Vite config for the frontend dev server).
- `BASE_PATH` — Base path for the frontend (e.g., `/`).
- `API_BASE_URL` — Full API base URL (e.g., `http://localhost:3001/api`).
- `VITE_API_BASE_URL` — Same as above, exposed to the Vite frontend build.
- `DATABASE_URL` — PostgreSQL connection string.
- `CONGRESS_API_KEY` — Congress.gov API key.
- `OPENSTATES_API_KEY` — OpenStates API key.
- `GOOGLE_CIVIC_API_KEY` — Google Civic Information API key.
- `CORS_ORIGIN` — Optional production CORS origin. If omitted in production, the API emits no cross-origin CORS allowance.

These are typically stored in an untracked `.env` file at the repo root.

## Important implementation notes

- **Testing:** Vitest tests live next to the code they cover. Prefer pure utility and API boundary tests with mocked upstream data before adding live-provider coverage.
- **No linting setup:** There is no ESLint or Biome configuration. Prettier is the only formatter.
- **Do not edit generated code:** Always modify `openapi.yaml` and rerun Orval codegen rather than editing `lib/api-client-react/src/generated/` or `lib/api-zod/src/generated/`.
- **External API error handling:** The backend routes generally catch external API failures and return empty arrays or 500 errors rather than propagating raw third-party responses.
- **Census geocoder normalization:** The representatives route uses the Census geocoder (`geocoding.geo.census.gov`) to derive congressional district and state legislative districts. State legislative district keys from Census are year-prefixed and may contain leading zeros; the code normalizes them to plain integer strings before passing to OpenStates.
