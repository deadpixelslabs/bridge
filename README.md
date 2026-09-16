# DEAD PIXELS Bridge V11 — Official LI.FI Widget

This rebuild intentionally removes the custom LI.FI quote proxy and the custom route UI.

Architecture:
- `@lifi/widget` v4 line
- `@lifi/widget-provider-ethereum`
- `@lifi/widget-provider-solana`
- LI.FI internal wallet management
- `buildUrl: true` so LI.FI's documented URL parameters can initialize the form
- no `fromChain`, `toChain`, `fromToken`, or `toToken` config values that would override URL params
- documented `feeConfig.fee = 0.003` (0.30%)
- official LI.FI token/chain logos, route UI, balance UI, transaction history and execution flow
- no DEAD PIXELS `/api/lifi` route discovery layer

Important:
The `dead-pixels-bridge` integrator must remain configured/verified in the LI.FI Partner Portal for monetized routes.
The old `LIFI_API_KEY` Vercel variable can remain, but this official-widget path does not expose it or depend on the old custom proxy.

Regression URLs:
- Robinhood USDG -> Base USDC: use the same query parameters that work on Jumper.
- Robinhood USDG -> Arc USDC: use the same query parameters that work on Jumper.

Why V11:
The official LI.FI docs now use provider-based Widget architecture. Earlier DEAD PIXELS versions used an older widget integration or a custom API proxy, which was not equivalent to Jumper's current stack.
