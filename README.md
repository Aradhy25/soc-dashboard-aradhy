# SOC Dashboard (Deployment Ready)

Cyber-themed Security Operations Center dashboard built with React + TypeScript + Vite.

## Stack

- React 19
- TypeScript
- Vite 6
- React Router 7
- Recharts
- Tailwind CSS v4

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

4. Run locally

```bash
npm run dev
```

5. Open browser

- [http://localhost:5173](http://localhost:5173)

## Production Build

```bash
npm run build
npm run preview
```

Generated output is in `dist/`.

## Deploy (Vercel)

1. Push this folder to GitHub.
2. Import repo in Vercel.
3. Build command: `npm run build`
4. Output directory: `dist`
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
- `src/app/data/mock-data.ts` - Mock SOC data
- `src/styles` - Global + theme styling

## Notes

- This is currently a frontend-only SOC dashboard with mock data.
- Next production step is connecting live APIs/SIEM feeds and adding authentication/authorization.
