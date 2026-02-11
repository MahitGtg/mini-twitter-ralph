# Mini Twitter (by Ralph loop)

A mini Twitter-style app built with a swarm of Ralph loops — [swarm-cli](https://github.com/mj1618/swarm-cli).

**Stack:** Next.js 16, Convex (backend + auth), Convex Auth (email/password).

---

## Project layout

- **`mini-twitter/`** — Next.js app and Convex backend (run and deploy from here).
- **`swarm/`** — Swarm/agent config and task outputs.
- **`AGENTS.md`** — Repo rules and workflows for humans and AI.

---

## Getting started

From the **mini-twitter** directory:

```bash
cd mini-twitter
npm install
npm run dev
```

This starts the Next.js app and Convex dev server. Open [http://localhost:3000](http://localhost:3000).

**First time:** Ensure `mini-twitter/.env.local` exists with Convex dev URLs (created when you run `npx convex dev` in `mini-twitter`).

---

## Deployment

Deploy **Convex** (backend) and **Next.js** (e.g. on Vercel). Full steps, including JWT/auth for production:

- **[mini-twitter/DEPLOY.md](mini-twitter/DEPLOY.md)** — production deploy guide (Convex, Vercel, env vars, auth).

Quick prod deploy of backend + build:

```bash
cd mini-twitter
npx convex deploy --cmd 'npm run build'
```

Then host the built app (e.g. Vercel with root directory `mini-twitter` and `CONVEX_DEPLOY_KEY` set).

---

## Scripts (from `mini-twitter/`)

| Command | Description |
|--------|-------------|
| `npm run dev` | Next.js + Convex dev (parallel) |
| `npm run dev:next` | Next.js only |
| `npm run dev:convex` | Convex dev only |
| `npm run build` | Next.js production build |
| `npm run start` | Run production Next.js server |
| `npm run test` | Run tests |
| `npx convex deploy` | Deploy Convex to production |

---

## Links

- [Convex](https://convex.dev) — backend and auth
- [Convex Auth](https://labs.convex.dev/auth) — auth production setup
- [Next.js deployment](https://nextjs.org/docs/app/building-your-application/deploying)
