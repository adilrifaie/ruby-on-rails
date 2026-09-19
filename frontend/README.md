# Healthcare Scale Platform: frontend

React client for the Rails API in the repository root. Setup for the whole project, and the API reference, are in the [root README](../README.md). Design notes are in [`ARCHITECTURE.md`](../ARCHITECTURE.md#frontend).

## Stack

- React 19, Vite, React Router
- Tailwind CSS v4 and [shadcn/ui](https://ui.shadcn.com) components (Radix primitives), JavaScript (no TypeScript)
- Recharts (through shadcn's `chart` component) for the factor summary chart
- Figtree variable font, `next-themes` for light and dark mode, `sonner` for toasts
- oxlint for linting

## Run it

The Rails API must be running on port 3000.

```bash
cp .env.example .env        # VITE_API_BASE_URL=http://localhost:3000/api/v1
npm install
npm run dev                 # http://localhost:5173
```

Use `npm run dev -- --host` when running the Cypress suite (it connects to `127.0.0.1`, and Vite listens only on `localhost` by default).

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build |
| `npm run lint` | oxlint |

## Layout

```
src/
├── main.jsx              # providers: theme, router, auth
├── App.jsx               # header, routes (each page lazy-loaded), toasts
├── index.css             # Tailwind, theme tokens (light/dark), severity colors
├── api/client.js         # fetch wrapper: bearer token, readable errors (err.status, err.fields)
├── auth/                 # AuthContext (token + user in localStorage), RequireAuth
├── hooks/                # usePageTitle
├── lib/                  # format (Intl dates/numbers), severity (band colors), analysis (types, costs, helpers)
├── pages/                # one component per route
└── components/
    ├── ui/               # shadcn/ui primitives (customized: pill buttons, h-10 inputs)
    ├── scale-builder/    # details, questions, scoring bands, publish
    ├── survey/           # share link, responses table, analysis runner, analyses list
    ├── participant/      # answer choices for the public survey
    └── analysis/         # descriptive, correlation and factor reports
```

## Routes

| Path | Who | Page |
|---|---|---|
| `/` | everyone | Landing page |
| `/login`, `/register` | everyone | Auth |
| `/take/:id` | participants (no account) | One question per screen, review, submit |
| `/responses/:id/thanks` | participants | Score and screening disclaimer |
| `/dashboard` | owner | Credits, scales, surveys, recent analyses |
| `/scales/new`, `/scales/:id` | owner | Scale builder |
| `/surveys/:id` | owner | Share link, responses, analyses (`?tab=analyses`) |
| `/responses/:id` | owner | Score, band and answers |
| `/analyses/:id` | owner | Analysis report |

## Adding shadcn components

```bash
yes n | npx shadcn@latest add <component> -y
```

The `yes n` stops the CLI from overwriting components that were customized (for example `button.jsx`). After adding one, replace any `transition-all` with specific properties and raise inputs and selects to `h-10`.
