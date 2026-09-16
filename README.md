# DEAD PIXELS Bridge — Production

## Locked configuration
- Integrator: `dead-pixels-bridge`
- Integrator fee: `0.003` = 0.30%
- EVM treasury configured in LI.FI Partner Portal:
  `0xc225b514223ad76d0792ececd836ad922b6d0673`
- Default: Robinhood Chain `4663` → Arc `5042`
- Execution UI: official LI.FI Widget
- Favicon included: `/public/favicon.svg`

## Vercel
Environment variable:
`LIFI_API_KEY=<your LI.FI key>` (Production; never prefix it with VITE_)

Then deploy/redeploy:
- Framework: Vite
- Build: `npm run build`
- Output: `dist`

The server-side `/api/quote` proxy uses `process.env.LIFI_API_KEY`, forces
`integrator=dead-pixels-bridge` and `fee=0.003`, and never returns the API key.

The embedded official LI.FI Widget handles its own route fetching/execution and uses
the registered integrator + feeConfig. The proxy is available for custom quote UI/API
work without exposing the private key.

## Local
`npm install`
`npm run dev`

Do not put the LI.FI API key in any `VITE_*` variable or frontend source file.


## V4 — LI.FI + Across
Required Vercel Production env vars:
- LIFI_API_KEY
- ACROSS_API_KEY
- ACROSS_INTEGRATOR_ID

Across credentials are used only in `/api/across.js`. The browser never receives the API key.
Across quotes force `integratorId` server-side and a 0.30% `appFee` to the DEAD PIXELS treasury.
The UI discovers Across-supported chains/tokens dynamically; unsupported routes do not produce transactions.
