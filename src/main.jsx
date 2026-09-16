import React,{useMemo} from 'react';
import{createRoot}from'react-dom/client';
import{LiFiWidget}from'@lifi/widget';
import{EthereumProvider}from'@lifi/widget-provider-ethereum';
import'./style.css';

const INTEGRATOR='dead-pixels-bridge';
const FRIENDS='https://opensea.io/collection/friends-pixels/overview';
const ARC_MAINNET=5042;
const ARC_RPC='https://rpc.arc-scan.org';

function App(){
 const config=useMemo(()=>({
   appearance:'dark',
   variant:'wide',
   buildUrl:true,
   providers:[EthereumProvider()],
   sdkConfig:{
     apiUrl:`${window.location.origin}/api/lifi`,
     // LI.FI reads displayed balances through its SDK public client, not
     // directly from the injected wallet. Put a browser-safe Arc RPC first
     // so ERC-20 USDC balanceOf() at 0x3600… works reliably on chain 5042.
     // LI.FI's own chain RPCs are appended as fallbacks by the SDK.
     rpcUrls:{
       [ARC_MAINNET]:[ARC_RPC]
     }
   },
   theme:{
     palette:{mode:'dark',primary:{main:'#8b5cf6'},secondary:{main:'#ef4444'},background:{default:'#09090b',paper:'#15111b'}},
     shape:{borderRadius:16},
     container:{border:'1px solid rgba(255,255,255,.10)',borderRadius:'24px',boxShadow:'0 28px 90px rgba(0,0,0,.55)'},
     routesContainer:{border:'1px solid rgba(255,255,255,.08)',borderRadius:'24px',boxShadow:'0 28px 90px rgba(0,0,0,.48)'},
     chainSidebarContainer:{border:'1px solid rgba(255,255,255,.08)',borderRadius:'24px'}
   }
 }),[]);
 return <main>
   <header className="nav">
     <a className="brand" href="/"><span className="mark">DP</span><span>DEAD PIXELS <b>BRIDGE</b></span></a>
     <nav className="links"><a href={FRIENDS} target="_blank" rel="noreferrer">FRIENDS PIXELS ↗</a><span className="status"><i/> LIVE</span></nav>
   </header>
   <section className="hero">
     <div className="eyebrow">DEAD PIXELS LABS</div>
     <h1>Bridge anywhere.<br/><span>One route.</span></h1>
     <p>Cross-chain swaps and transfers in one interface. Compare available routes, choose your destination, and execute directly from your wallet.</p>
   </section>
   <section className="bridgeShell">
     <div className="arcGasNote"><strong>ARC GAS NOTE</strong><span>Arc pays network gas in USDC. When sending from Arc, do not empty the wallet with MAX — leave a small USDC reserve for approval and bridge gas.</span></div>
     <LiFiWidget integrator={INTEGRATOR} config={config}/>
   </section>
   <section className="collection">
     <div><small>DEAD PIXELS LABS COLLECTION</small><h2>FRIENDS PIXELS</h2><p>Explore the collection on OpenSea.</p></div>
     <a href={FRIENDS} target="_blank" rel="noreferrer">VIEW COLLECTION ↗</a>
   </section>
   <footer><span>DEAD PIXELS LABS</span><span>Cross-chain interface · Non-custodial</span></footer>
 </main>
}
createRoot(document.getElementById('root')).render(<App/>);
