# SOC Dashboard (Deployment Ready)

Cyber-themed Security Operations Center dashboard built with React + TypeScript + Vite.

## Stack

- React 19
- TypeScript
- Vite 6
- React Router 7
- Recharts
- Tailwind CSS v4
- Fastify (API)
- Socket.IO (realtime updates)
- Prisma + PostgreSQL (data)

## Mac M1 Setup (Do This Exactly)

1. Install Node.js LTS (recommended via [nvm](https://github.com/nvm-sh/nvm))
2. Use Node 20+

```bash
nvm install 20
nvm use 20
node -v
npm -v
```

3. Install dependencies

```bash
npm install
```

4. Install backend dependencies

```bash
cd server
npm install
```

5. Run locally (2 terminals)

Backend (API + WebSockets):

```bash
cd server
npm run db:deploy
npm run seed
npm run dev
```

Frontend (Vite):

```bash
npm run dev
```

6. Open browser

- [http://localhost:5173](http://localhost:5173)

## Production Build

```bash
npm run build
npm run preview
```

Generated output is in `dist/`.

## Deploy (Recommended Demo Setup: Vercel + Railway)

Why:

- Vercel/Netlify are great for the frontend.
- The backend needs a long-running server for Socket.IO (WebSockets), so deploy it to Railway/Render/Fly (not serverless functions).

### Backend (Railway)

1. Create a Railway project.
2. Add PostgreSQL to the project (Railway provides `DATABASE_URL`).
3. Create a new Web Service from your GitHub repo (Root Directory: `server`).
4. Set a Pre-deploy command:

```bash
npm run db:deploy && npm run seed
```

5. Set service variables:

- `DATABASE_URL` = from the Railway Postgres service
- `CORS_ORIGIN` = `https://<your-vercel-domain>`
- `WS_ORIGIN` = `https://<your-vercel-domain>`

### Frontend (Vercel)

1. Import the repo in Vercel.
2. Build command: `npm run build`
3. Output directory: `dist`
4. Add Vercel env vars:

- `VITE_API_BASE` = `https://<your-railway-backend-domain>/api/v1`
- `VITE_WS_URL` = `https://<your-railway-backend-domain>`

5. Deploy.

`vercel.json` already includes SPA rewrite rules for React Router routes.

## Deploy (Netlify)

1. Push repo to GitHub.
2. Import in Netlify.
3. Build command: `npm run build`
4. Publish directory: `dist`

`netlify.toml` already includes SPA redirect rules.

## Project Structure

- `src/app/layout` - Main app shell/navigation
- `src/app/pages` - Dashboard sections (overview, alerts, logs, network, users, endpoints, threat intel, incidents, reports, settings)
- `src/app/components` - Shared UI components and detail modals
- `src/styles` - Global + theme styling
- `server/` - Fastify API + Prisma + Socket.IO realtime server

## Notes

- `server/.env` is for local dev only. Do not commit secrets.
- Operator response actions (block IP, isolate host, kill process, escalate) are available from alert details.
- Endpoint actions (isolate / restore / scan / shutdown) and device registration are available on Endpoints.
- Reports and logs support CSV/JSON export; settings preferences persist in the browser.
