# DEAD PIXELS Bridge

Production-ready Vite + React frontend using the official LI.FI Widget.

## Locked settings
- Default route: Robinhood Chain (4663) → Arc (5042)
- DEAD PIXELS integrator fee: 0.30%
- Treasury: 0xc225b514223ad76d0792ececd836ad922b6d0673
- Integrator slug in code: `dead-pixels-bridge`

## Important: activate fee collection
The treasury address shown in the site does NOT by itself redirect fees. Register/verify the integrator in the LI.FI Partner Portal and configure the fee wallet there for the integrator used by this app. Keep the `fee: 0.003` setting.

## Run locally (Windows PowerShell)
npm install
npm run dev

## Deploy to Vercel
1. Extract this ZIP.
2. Import the folder/repository into Vercel.
3. Framework preset: Vite.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add `bridge.deadpixelslabs.com` in Vercel Domains and point the DNS record as instructed by Vercel.

## Route behavior
The app defaults to Robinhood → Arc but leaves all LI.FI-supported networks available. If LI.FI cannot produce an executable route, the widget will not fabricate one.
