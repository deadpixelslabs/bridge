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

## V3 wallet balance behavior
The embedded LI.FI Widget is responsible for wallet connection and source-token balances.
After a wallet is connected, the selected source token balance is shown/refreshed by the
Widget automatically; there is no separate "Check Balance" button and this build does not
invent or cache a fake balance.

For custom/private RPCs, do not put secret RPC keys into frontend VITE_* variables.
