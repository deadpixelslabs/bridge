import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { LiFiWidget } from '@lifi/widget';
import { EthereumProvider } from '@lifi/widget-provider-ethereum';
import './style.css';

const INTEGRATOR = 'dead-pixels-bridge';
const OPENSEA = 'https://opensea.io/collection/friends-pixels/overview';
const ARC_MAINNET = 5042;
const ARC_RPC = 'https://rpc.arc-scan.org';

function App() {
  const [copied, setCopied] = useState(false);

  const config = useMemo(
    () => ({
      appearance: 'dark',
      variant: 'wide',
      buildUrl: true,
      providers: [EthereumProvider()],

      // GasZip was returning Arc routes that quoted successfully but failed
      // wallet simulation/execution. Keep it out until the provider is stable.
      bridges: { deny: ['gasZipBridge'] },

      sdkConfig: {
        apiUrl: `${window.location.origin}/api/lifi`,

        // Stable public Arc RPC for LI.FI balance reads.
        rpcUrls: {
          [ARC_MAINNET]: [ARC_RPC],
        },
      },

      theme: {
        palette: {
          mode: 'dark',
          primary: { main: '#8b5cf6' },
          secondary: { main: '#ef4444' },
          background: { default: '#09090b', paper: '#15111b' },
        },
        shape: { borderRadius: 16 },
        container: {
          border: '1px solid rgba(255,255,255,.10)',
          borderRadius: '24px',
          boxShadow: '0 28px 90px rgba(0,0,0,.55)',
        },
        routesContainer: {
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: '24px',
          boxShadow: '0 28px 90px rgba(0,0,0,.48)',
        },
        chainSidebarContainer: {
          border: '1px solid rgba(255,255,255,.08)',
          borderRadius: '24px',
        },
      },
    }),
    []
  );

  async function copyCollectionLink() {
    try {
      await navigator.clipboard.writeText(OPENSEA);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.open(OPENSEA, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <main>
      <header className="nav">
        <a className="brand" href="/" aria-label="Dead Pixels Bridge">
          <img
            className="brandLogo"
            src="/dead-pixels-logo.svg"
            alt="Dead Pixels Labs"
          />
          <span className="brandText">
            <span className="brandTop">DEAD PIXELS LABS</span>
            <span className="brandBottom">BRIDGE</span>
          </span>
        </a>

        <nav className="links">
          <a
            className="navLink"
            href={OPENSEA}
            target="_blank"
            rel="noreferrer"
          >
            OpenSea Collection ↗
          </a>

          <span className="status">
            <i />
            LIVE
          </span>
        </nav>
      </header>

      <section className="hero">
        <div className="eyebrow">DEAD PIXELS LABS</div>

        <h1>
          Bridge anywhere.
          <br />
          <span>One route.</span>
        </h1>

        <p>
          Cross-chain swaps and transfers in one interface. Compare available
          routes, choose your destination, and execute directly from your wallet.
        </p>
      </section>

      <section className="bridgeShell">
        <div className="arcGasNote">
          <strong>ARC GAS NOTE</strong>
          <span>
            Arc pays network gas in USDC. When sending from Arc, do not empty the
            wallet with MAX — leave a small USDC reserve for approval and bridge gas.
          </span>
        </div>

        <LiFiWidget integrator={INTEGRATOR} config={config} />
      </section>

      <section className="collection">
        <div className="collectionInfo">
          <small>FEATURED COLLECTION</small>
          <h2>FRIENDS PIXELS</h2>
          <p>Explore the official Dead Pixels Labs collection on OpenSea.</p>

          <div className="collectionMeta">
            <span className="metaBadge">Official</span>
            <span className="metaBadge">OpenSea</span>
          </div>
        </div>

        <div className="collectionActions">
          <a
            className="ctaPrimary"
            href={OPENSEA}
            target="_blank"
            rel="noreferrer"
          >
            View on OpenSea ↗
          </a>

          <button
            className="ctaSecondary"
            type="button"
            onClick={copyCollectionLink}
          >
            {copied ? 'Link Copied ✓' : 'Copy Collection Link'}
          </button>
        </div>
      </section>

      <footer>
        <span>DEAD PIXELS LABS</span>
        <span>Cross-chain interface · Non-custodial</span>
      </footer>
    </main>
  );
}

createRoot(document.getElementById('root')).render(<App />);
