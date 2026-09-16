import React,{useMemo}from'react';
import ReactDOM from'react-dom/client';
import{LiFiWidget}from'@lifi/widget';
import'./style.css';

const INTEGRATOR='dead-pixels-bridge';
const TREASURY='0xc225b514223ad76d0792ececd836ad922b6d0673';
const RH=4663, ARC=5042;

function App(){
 const config=useMemo(()=>({
  appearance:'dark',
  variant:'compact',
  fromChain:RH,
  toChain:ARC,
  buildUrl:true,
  routePriority:'RECOMMENDED',
  feeConfig:{
   fee:0.003,
   name:'DEAD PIXELS fee',
   showFeePercentage:true,
   showFeeTooltip:true
  },
  theme:{
   container:{borderRadius:'22px',boxShadow:'0 24px 80px rgba(0,0,0,.55)'},
   palette:{primary:{main:'#ff2b2b'},secondary:{main:'#fff'}},
   shape:{borderRadius:14,borderRadiusSecondary:10},
   typography:{fontFamily:'Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}
  }
 }),[]);
 return <main className="shell">
  <header className="top"><a className="brand" href="/"><img src="/favicon.svg"/> <span>DEAD PIXELS <b>BRIDGE</b></span></a>
   <div className="secure"><i/> NON-CUSTODIAL</div></header>
  <section className="hero"><div className="eyebrow">DEAD PIXELS LABS / CROSS-CHAIN</div>
   <h1>BRIDGE THE<br/><em>GLITCH.</em></h1>
   <p>Move assets across supported networks through live LI.FI routing. Your wallet stays in control.</p>
   <div className="route"><span>Robinhood Chain</span><b>↔</b><span>Arc</span><small>default route</small></div>
  </section>
  <section className="layout">
   <aside>
    <div><label>01</label><h3>Live routing</h3><p>Routes are fetched at transaction time. No executable route means no transaction is offered.</p></div>
    <div><label>02</label><h3>0.30% platform fee</h3><p>DEAD PIXELS fee is disclosed in the LI.FI route details. Network and provider costs remain separate.</p></div>
    <div><label>03</label><h3>Non-custodial</h3><p>We do not hold bridge deposits. Review the destination, token, route and received amount before signing.</p></div>
   </aside>
   <div className="card"><div className="cardHead"><div><small>BRIDGE / SWAP</small><strong>Cross-chain execution</strong></div><span>LIVE</span></div>
    <LiFiWidget integrator={INTEGRATOR} config={config}/>
    <div className="balanceNote">Connect wallet → token balance is detected automatically</div>
    <div className="powered">POWERED BY <b>LI.FI</b> · INTEGRATOR <b>{INTEGRATOR}</b></div>
   </div>
  </section>
  <footer><strong>DEAD PIXELS LABS</strong><p>Cross-chain transactions involve smart-contract, liquidity, slippage and third-party provider risk. Verify every transaction before signing.</p><code>{TREASURY.slice(0,8)}…{TREASURY.slice(-6)}</code></footer>
 </main>
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);