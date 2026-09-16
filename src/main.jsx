import React,{useMemo} from 'react';
import{createRoot}from'react-dom/client';
import{LiFiWidget}from'@lifi/widget';
import{EthereumProvider}from'@lifi/widget-provider-ethereum';
import{SolanaProvider}from'@lifi/widget-provider-solana';
import'./style.css';

const INTEGRATOR='dead-pixels-bridge';

function App(){
 const config=useMemo(()=>({
   appearance:'dark',
   variant:'wide',
   buildUrl:true,
   providers:[EthereumProvider(),SolanaProvider()],
   feeConfig:{
     name:'DEAD PIXELS',
     fee:0.003,
     showFeePercentage:true,
     showFeeTooltip:true
   },
   walletConfig:{
     forceInternalWalletManagement:true
   },
   theme:{
     palette:{
       mode:'dark',
       primary:{main:'#8b5cf6'},
       secondary:{main:'#ef4444'},
       background:{default:'#09090b',paper:'#15111b'}
     },
     shape:{borderRadius:16},
     container:{
       border:'1px solid rgba(255,255,255,.10)',
       borderRadius:'24px',
       boxShadow:'0 28px 90px rgba(0,0,0,.55)'
     },
     routesContainer:{
       border:'1px solid rgba(255,255,255,.08)',
       borderRadius:'24px',
       boxShadow:'0 28px 90px rgba(0,0,0,.48)'
     },
     chainSidebarContainer:{
       border:'1px solid rgba(255,255,255,.08)',
       borderRadius:'24px'
     }
   }
 }),[]);
 return <main>
   <header className="nav">
     <a className="brand" href="/"><span className="mark">DP</span><span>DEAD PIXELS <b>BRIDGE</b></span></a>
     <div className="status"><i/> LIVE ROUTING</div>
   </header>

   <section className="hero">
     <div className="eyebrow">CROSS-CHAIN LIQUIDITY</div>
     <h1>Move assets.<br/><span>Without the mess.</span></h1>
     <p>One professional bridge interface. Routes, token logos, balances, approvals and transaction progress are handled by the official LI.FI Widget.</p>
     <div className="pills"><span>LI.FI</span><span>INTENTS</span><span>BRIDGES</span><span>EVM + SOLANA</span></div>
   </section>

   <section className="bridgeShell">
     <div className="bridgeHead">
       <div><small>DEAD PIXELS ROUTER</small><strong>Swap & Bridge</strong></div>
       <span className="official">OFFICIAL LI.FI UI</span>
     </div>
     <LiFiWidget integrator={INTEGRATOR} config={config}/>
   </section>

   <section className="proof">
     <div><b>01</b><strong>Official routing stack</strong><span>No custom quote proxy. The Widget talks through LI.FI's own routing stack.</span></div>
     <div><b>02</b><strong>Native asset UI</strong><span>Chain icons, token logos, balances, route cards and execution history stay native.</span></div>
     <div><b>03</b><strong>0.30% integrator fee</strong><span>Configured with LI.FI's documented Widget feeConfig.</span></div>
   </section>

   <footer><span>DEAD PIXELS LABS</span><span>Non-custodial cross-chain interface</span></footer>
 </main>
}
createRoot(document.getElementById('root')).render(<App/>);
