import React, { useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { LiFiWidget } from '@lifi/widget';
import './style.css';

const TREASURY = '0xc225b514223ad76d0792ececd836ad922b6d0673';
const ROBINHOOD_CHAIN_ID = 4663;
const ARC_CHAIN_ID = 5042;

function App() {
  const config = useMemo(() => ({
    appearance: 'dark',
    variant: 'compact',
    fromChain: ROBINHOOD_CHAIN_ID,
    toChain: ARC_CHAIN_ID,
    fee: 0.003,
    buildUrl: true,
    theme: {
      container: {
        borderRadius: '22px',
        boxShadow: '0 22px 70px rgba(0,0,0,.5)',
      },
      palette: {
        primary: { main: '#ff2b2b' },
        secondary: { main: '#ffffff' },
      },
      shape: {
        borderRadius: 14,
        borderRadiusSecondary: 10,
      },
      typography: {
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      },
    },
  }), []);

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="/" aria-label="DEAD PIXELS Bridge">
          <span className="mark"><i></i><i></i><i></i><i></i></span>
          <span>DEAD PIXELS <b>BRIDGE</b></span>
        </a>
        <div className="status"><span></span> NON-CUSTODIAL</div>
      </header>

      <section className="hero">
        <div className="eyebrow">CROSS-CHAIN ROUTER</div>
        <h1>MOVE ASSETS.<br/><em>BREAK BORDERS.</em></h1>
        <p>Route assets across supported networks with live liquidity and execution powered by LI.FI.</p>

        <div className="chips">
          <span>Robinhood Chain</span><b>↔</b><span>Arc</span>
          <small>+ all supported LI.FI networks</small>
        </div>
      </section>

      <section className="bridgeGrid">
        <aside className="infoCard">
          <div>
            <span className="num">01</span>
            <h3>Best available route</h3>
            <p>Routes are discovered in real time. If no executable route exists, no transaction is offered.</p>
          </div>
          <div>
            <span className="num">02</span>
            <h3>Your wallet stays yours</h3>
            <p>DEAD PIXELS does not custody user funds. Transactions execute through the route shown before confirmation.</p>
          </div>
          <div>
            <span className="num">03</span>
            <h3>Transparent fee</h3>
            <p>DEAD PIXELS integrator fee: <strong>0.30%</strong>. Provider, gas and route costs are shown by the routing interface.</p>
          </div>
        </aside>

        <div className="widgetWrap">
          <div className="widgetHead">
            <div>
              <small>BRIDGE / SWAP</small>
              <strong>Choose your route</strong>
            </div>
            <span>LIVE</span>
          </div>
          <LiFiWidget integrator="dead-pixels-bridge" config={config} />
          <div className="powered">DEAD PIXELS LABS <span>×</span> POWERED BY LI.FI</div>
        </div>
      </section>

      <footer>
        <div>DEAD PIXELS LABS</div>
        <p>Cross-chain transactions carry smart-contract, liquidity, slippage and third-party provider risk. Always verify the route and destination before signing.</p>
        <div className="treasury">TREASURY · {TREASURY.slice(0,8)}…{TREASURY.slice(-6)}</div>
      </footer>
    </main>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
