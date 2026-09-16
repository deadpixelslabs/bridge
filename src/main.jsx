import React,{useMemo} from 'react';
import{createRoot}from'react-dom/client';
import{LiFiWidget}from'@lifi/widget';
import{EthereumProvider}from'@lifi/widget-provider-ethereum';
import'./style.css';

const INTEGRATOR='dead-pixels-bridge';
const FRIENDS='https://opensea.io/collection/friends-pixels/overview';

function App(){
 const config=useMemo(()=>({
   appearance:'dark',
   variant:'wide',
   buildUrl:true,
   providers:[EthereumProvider()],
   feeConfig:{name:'DEAD PIXELS',fee:0.003,showFeePercentage:true,showFeeTooltip:true},
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
