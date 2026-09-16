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


## V5 — Circle CCTP / Arc mainnet
- Adds a Circle tab using official `@circle-fin/bridge-kit` + `@circle-fin/adapter-viem-v2`.
- Mainnet chains are discovered at runtime with `BridgeKit.getSupportedChains()`; Arc is enabled only if the SDK returns Arc mainnet / chain ID 5042.
- Uses the connected EIP-1193 browser wallet. No private key and no Circle API key are embedded.
- Circle flow is native USDC burn-and-mint via CCTP and shows explicit mainnet confirmation before execution.
- LI.FI and Across remain available.


## V7 — Native LI.FI SDK rebuild
The embedded LI.FI Widget has been removed from the LI.FI tab.
V7 uses:
- server-side LI.FI `/chains`, `/tokens`, and `/quote` proxy (`LIFI_API_KEY` never reaches the browser)
- `@lifi/sdk` 4.x + `@lifi/sdk-provider-ethereum`
- injected EVM wallet via Viem
- direct source-chain balance reads
- LI.FI SDK route execution/progress
- 0.30% integrator fee requested on live LI.FI quotes
- no hardcoded chain allowlist; EVM chains are discovered from LI.FI

Regression tests after deployment:
1. Robinhood (4663) USDG -> Base (8453) USDC, 100
2. Robinhood (4663) USDG -> Arc (5042) USDC, 100
3. Base USDC -> Arc USDC
4. Arc USDC -> Robinhood supported token
5. Wallet balance must populate after selecting source token

Do not announce a route as available unless the live LI.FI quote returns it.


## V8 critical quote fix
V7 sent `order=RECOMMENDED` to LI.FI `/v1/quote`. That value is not valid for
the quote endpoint. LI.FI currently documents only `FASTEST` and `CHEAPEST`.
V8 uses `order=CHEAPEST` and returns the original LI.FI API error details to
the UI/API response instead of masking them.

Note: a displayed zero source-token balance can be correct. Route discovery
does not require the wallet to hold the quoted amount; execution does.


## V9 — Jumper-parity route discovery fix
- Adds `skipSimulation=true` to LI.FI quote discovery. LI.FI documents that quote
  transaction responses are simulated by default; this can reject discovery for
  a connected wallet that does not currently have enough funds.
- If a monetized 0.30% quote is rejected, V9 retries the exact same transfer
  without the fee. If that succeeds, the UI explicitly says ROUTE FOUND but
  disables execution. This isolates LI.FI partner-fee configuration from routing.
- V9 never silently executes a fee-less fallback route.


## V10 — Advanced Routes + Jumper-style UX
This version stops using `/quote` for discovery. It uses LI.FI's official
`POST /v1/advanced/routes`, which is designed to return multiple route options.
It requests `executionType: all` so transaction and messaging/intent routes can
be considered, waits longer for multiple providers, and shows up to four routes.

The UI is rebuilt toward a compact swap/bridge experience: route cards,
best-return selection, alternatives, ETA/tool path, and a purple exchange panel.

Execution remains LI.FI SDK based. The 0.30% integrator fee is requested first.
A fee-less retry is discovery-only and cannot be executed.
