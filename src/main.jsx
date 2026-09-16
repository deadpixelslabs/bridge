import React,{useEffect,useMemo,useState}from'react';
import ReactDOM from'react-dom/client';
import{LiFiWidget}from'@lifi/widget';
import{BridgeKit}from'@circle-fin/bridge-kit';
import{createViemAdapterFromProvider}from'@circle-fin/adapter-viem-v2';
import'./style.css';

const INTEGRATOR='dead-pixels-bridge';
const TREASURY='0xc225b514223ad76d0792ececd836ad922b6d0673';
const RH=4663, ARC=5042;
const ZERO='0x0000000000000000000000000000000000000000';

const hex=n=>'0x'+BigInt(n).toString(16);
const short=a=>a?`${a.slice(0,6)}…${a.slice(-4)}`:'';
const fmt=(raw,d=18)=>{try{let s=BigInt(raw||0).toString().padStart(d+1,'0');let a=s.slice(0,-d),b=s.slice(-d).replace(/0+$/,'').slice(0,6);return b?`${a}.${b}`:a}catch{return'0'}};
const units=(v,d)=>{let[a,b='']=String(v||'0').trim().split('.');b=(b+'0'.repeat(d)).slice(0,d);return(BigInt(a||0)*10n**BigInt(d)+BigInt(b||0)).toString()};
const pretty=(raw,d=18,max=6)=>{try{const neg=String(raw).startsWith('-');let x=String(raw??'0').replace('-','').padStart(d+1,'0');let a=x.slice(0,-d),b=x.slice(-d).replace(/0+$/,'').slice(0,max);return(neg?'-':'')+a+(b?'.'+b:'')}catch{return String(raw??'—')}};
const money=x=>{const n=Number(x);return Number.isFinite(n)?'$'+n.toLocaleString(undefined,{maximumFractionDigits:2}):null};
function normalizeList(x){if(Array.isArray(x))return x;if(Array.isArray(x?.chains))return x.chains;if(Array.isArray(x?.tokens))return x.tokens;if(Array.isArray(x?.data))return x.data;return[]}

function AcrossPanel(){
 const[account,setAccount]=useState('');
 const[chains,setChains]=useState([]);
 const[fromChain,setFromChain]=useState(RH);
 const[toChain,setToChain]=useState(8453);
 const[tokens,setTokens]=useState([]);
 const[outTokens,setOutTokens]=useState([]);
 const[fromToken,setFromToken]=useState('');
 const[toToken,setToToken]=useState('');
 const[amount,setAmount]=useState('');
 const[balance,setBalance]=useState('—');
 const[wrongChain,setWrongChain]=useState(false);
 const[quote,setQuote]=useState(null);
 const[busy,setBusy]=useState(false);
 const[msg,setMsg]=useState('');

 async function api(q){const r=await fetch('/api/across?'+new URLSearchParams(q));const j=await r.json();if(!r.ok)throw Error(j.message||j.error||'Across request failed');return j}
 async function connect(){if(!window.ethereum)return setMsg('Install an EVM wallet first.');const a=await window.ethereum.request({method:'eth_requestAccounts'});setAccount(a[0]||'')}
 async function switchSource(){if(!window.ethereum)return setMsg('Install an EVM wallet first.');try{await window.ethereum.request({method:'wallet_switchEthereumChain',params:[{chainId:hex(fromChain)}]});setMsg('');setTimeout(refreshBalance,250)}catch(e){setMsg(e.message||'Could not switch chain')}}
 useEffect(()=>{api({action:'chains'}).then(x=>setChains(normalizeList(x))).catch(e=>setMsg(e.message))},[]);
 useEffect(()=>{setFromToken('');setQuote(null);api({action:'tokens',chainId:String(fromChain)}).then(x=>setTokens(normalizeList(x))).catch(()=>setTokens([]))},[fromChain]);
 useEffect(()=>{setToToken('');setQuote(null);api({action:'tokens',chainId:String(toChain)}).then(x=>setOutTokens(normalizeList(x))).catch(()=>setOutTokens([]))},[toChain]);
 const tokenAddr=t=>t?.address||t?.tokenAddress||t?.contractAddress||'';
 const tokenSym=t=>t?.symbol||t?.name||short(tokenAddr(t));
 const tokenDec=t=>Number(t?.decimals??18);
 const selected=tokens.find(t=>tokenAddr(t).toLowerCase()===fromToken.toLowerCase());
 const selectedOut=outTokens.find(t=>tokenAddr(t).toLowerCase()===toToken.toLowerCase());
 async function refreshBalance(){
  if(!account||!selected)return setBalance('—');
  try{
   const cid=await window.ethereum.request({method:'eth_chainId'});
   if(BigInt(cid)!==BigInt(fromChain)){setWrongChain(true);setBalance('—');return} setWrongChain(false)
   let raw;
   if(tokenAddr(selected)===ZERO||selected.isNative) raw=await window.ethereum.request({method:'eth_getBalance',params:[account,'latest']});
   else{
    const data='0x70a08231'+account.slice(2).padStart(64,'0');
    raw=await window.ethereum.request({method:'eth_call',params:[{to:tokenAddr(selected),data},'latest']});
   }
   setBalance(fmt(raw,tokenDec(selected)));
  }catch{setWrongChain(false);setBalance('unavailable')}
 }
 useEffect(()=>{refreshBalance()},[account,fromToken,fromChain,tokens]);
 async function getQuote(){
  if(!account||!selected||!fromToken||!toToken||!amount)return setMsg('Connect wallet and complete all fields.');
  setBusy(true);setMsg('');setQuote(null);
  try{
   const q=await api({action:'approval',originChainId:String(fromChain),destinationChainId:String(toChain),inputToken:fromToken,outputToken:toToken,amount:units(amount,tokenDec(selected)),depositor:account,recipient:account});
   setQuote(q);
  }catch(e){setMsg(e.message)}finally{setBusy(false)}
 }
 async function sendTx(tx){
  const wanted=tx.chainId?Number(tx.chainId):fromChain;
  const cid=await window.ethereum.request({method:'eth_chainId'});
  if(BigInt(cid)!==BigInt(wanted))await window.ethereum.request({method:'wallet_switchEthereumChain',params:[{chainId:hex(wanted)}]});
  return window.ethereum.request({method:'eth_sendTransaction',params:[{from:account,to:tx.to,data:tx.data||'0x',value:tx.value?hex(tx.value):'0x0'}]});
 }
 async function execute(){
  if(!quote)return;
  setBusy(true);setMsg('');
  try{
   for(const tx of quote.approvalTxns||[])await sendTx(tx);
   const tx=quote.swapTx||quote.swapTxn||quote.transaction;
   if(!tx)throw Error('Across did not return an executable transaction.');
   const hash=await sendTx(tx);setMsg('Submitted: '+hash);setQuote(null);refreshBalance();
  }catch(e){setMsg(e.message||'Transaction failed')}finally{setBusy(false)}
 }
 const chainId=c=>Number(c.chainId??c.id);
 const chainName=c=>c.name||c.chainName||`Chain ${chainId(c)}`;
 const out=quote?.expectedOutputAmount||quote?.outputAmount||quote?.steps?.bridge?.outputAmount||quote?.steps?.destinationSwap?.outputAmount;
 const outDecimals=Number(selectedOut?.decimals??quote?.outputToken?.decimals??18);
 const outSymbol=selectedOut?tokenSym(selectedOut):(quote?.outputToken?.symbol||'');
 const formattedOut=out!=null?pretty(out,outDecimals,6):null;
 const quoteTime=quote?.estimatedFillTimeSec??quote?.estimatedFillTime??quote?.estimatedTime;
 const totalFeeUsd=quote?.fees?.total?.amountUsd??quote?.totalFeeUsd??quote?.fees?.totalFeeUsd;
 const outputUsd=quote?.expectedOutputAmountUsd??quote?.outputAmountUsd??quote?.outputUsd;
 return <div className="acrossBox">
  <div className="acrossTop"><div><small>ACROSS SWAP API</small><strong>Direct Across route</strong></div><button onClick={connect}>{account?short(account):'Connect wallet'}</button></div>
  <div className="two">
   <label>From<select value={fromChain} onChange={e=>setFromChain(+e.target.value)}>{chains.map(c=><option key={chainId(c)} value={chainId(c)}>{chainName(c)}</option>)}</select></label>
   <label>To<select value={toChain} onChange={e=>setToChain(+e.target.value)}>{chains.map(c=><option key={chainId(c)} value={chainId(c)}>{chainName(c)}</option>)}</select></label>
  </div>
  <div className="two">
   <label>Pay token<select value={fromToken} onChange={e=>setFromToken(e.target.value)}><option value="">Select token</option>{tokens.map((t,i)=><option key={tokenAddr(t)+i} value={tokenAddr(t)}>{tokenSym(t)}</option>)}</select><small>Balance: {balance} {selected?tokenSym(selected):''}</small>{wrongChain&&<button type="button" className="switchBtn" onClick={switchSource}>Switch to {chains.find(c=>chainId(c)===fromChain)?chainName(chains.find(c=>chainId(c)===fromChain)):'source chain'}</button>}</label>
   <label>Receive token<select value={toToken} onChange={e=>setToToken(e.target.value)}><option value="">Select token</option>{outTokens.map((t,i)=><option key={tokenAddr(t)+i} value={tokenAddr(t)}>{tokenSym(t)}</option>)}</select></label>
  </div>
  <label>Amount<input inputMode="decimal" placeholder="0.00" value={amount} onChange={e=>{setAmount(e.target.value);setQuote(null)}}/></label>
  {!quote?<button className="primary" disabled={busy} onClick={getQuote}>{busy?'Checking route…':'Get Across route'}</button>:
   <div className="quote"><b>Across route available</b>
    <div className="breakdown">
      <span><i>You send</i><strong>{amount} {selected?tokenSym(selected):''}</strong></span>
      {formattedOut&&<span><i>You receive</i><strong>{formattedOut} {outSymbol}</strong></span>}
      {outputUsd&&<span><i>Estimated value</i><strong>{money(outputUsd)}</strong></span>}
      <span><i>DEAD PIXELS fee</i><strong>0.30%</strong></span>
      {totalFeeUsd&&<span><i>Provider / network fees</i><strong>{money(totalFeeUsd)}</strong></span>}
      {quoteTime&&<span><i>Estimated time</i><strong>~{Number(quoteTime)>=60?Math.ceil(Number(quoteTime)/60)+' min':Math.ceil(Number(quoteTime))+' sec'}</strong></span>}
    </div>
    <button className="primary" disabled={busy||wrongChain} onClick={execute}>{wrongChain?'Switch source chain first':busy?'Waiting for wallet…':'Bridge with Across'}</button></div>}
  {msg&&<div className="msg">{msg}</div>}
  <div className="fine">Only routes returned live by Across are executable. Quotes are never cached.</div>
 </div>
}


function CirclePanel(){
 const[account,setAccount]=useState('');
 const[chains,setChains]=useState([]);
 const[fromChain,setFromChain]=useState('Base');
 const[toChain,setToChain]=useState('');
 const[amount,setAmount]=useState('');
 const[estimate,setEstimate]=useState(null);
 const[busy,setBusy]=useState(false);
 const[msg,setMsg]=useState('');
 const[events,setEvents]=useState([]);
 const kit=useMemo(()=>new BridgeKit(),[]);
 const arc=chains.find(c=>!c.isTestnet&&(Number(c.chainId)===5042||String(c.chain).toLowerCase()==='arc'||String(c.name||'').toLowerCase()==='arc'));

 useEffect(()=>{let dead=false;(async()=>{try{
   const all=await kit.getSupportedChains();
   const main=all.filter(c=>c.isTestnet===false);
   if(!dead){setChains(main);const a=main.find(c=>Number(c.chainId)===5042||String(c.chain).toLowerCase()==='arc'||String(c.name||'').toLowerCase()==='arc');if(a)setToChain(a.chain)}
 }catch(e){if(!dead)setMsg('Circle Bridge Kit: '+(e.message||'could not load supported chains'))}})();return()=>{dead=true}},[kit]);

 async function connect(){
  if(!window.ethereum)return setMsg('Install an EVM wallet first.');
  try{const a=await window.ethereum.request({method:'eth_requestAccounts'});setAccount(a[0]||'');setMsg('')}catch(e){setMsg(e.message||'Wallet connection failed')}
 }
 async function adapter(){if(!window.ethereum)throw Error('EVM wallet not found');return createViemAdapterFromProvider({provider:window.ethereum})}
 const selectedFrom=chains.find(c=>c.chain===fromChain);
 async function switchSource(){
  if(!selectedFrom?.chainId)return;
  try{await window.ethereum.request({method:'wallet_switchEthereumChain',params:[{chainId:hex(selectedFrom.chainId)}]})}
  catch(e){setMsg(e.message||'Switch chain failed')}
 }
 async function doEstimate(){
  if(!account)return setMsg('Connect wallet first.');
  if(!fromChain||!toChain||!amount||Number(amount)<=0)return setMsg('Choose a route and enter an amount.');
  setBusy(true);setMsg('');setEstimate(null);
  try{
   const a=await adapter();
   const r=await kit.estimate({from:{adapter:a,chain:fromChain},to:{adapter:a,chain:toChain},amount});
   setEstimate(r);
  }catch(e){setMsg(e.message||'Circle route unavailable')}finally{setBusy(false)}
 }
 async function bridge(){
  if(!estimate)return;
  setBusy(true);setMsg('');setEvents([]);
  const handler=e=>{const method=e?.method||e?.name||'bridge';const state=e?.values?.state||e?.state||'';setEvents(v=>[...v.slice(-5),`${method}${state?' · '+state:''}`])};
  try{
   await switchSource();
   const a=await adapter();
   kit.on('*',handler);
   const r=await kit.bridge({from:{adapter:a,chain:fromChain},to:{adapter:a,chain:toChain},amount});
   const bad=r?.steps?.find(x=>x.state==='error');
   if(bad)throw Error(bad.errorMessage||'Bridge stopped during '+bad.name);
   setMsg(r?.state==='success'?'USDC bridge completed successfully.':'Bridge submitted. Follow the progress below.');
   setEstimate(null);
  }catch(e){setMsg(e.message||'Circle bridge failed')}finally{try{kit.off('*',handler)}catch{}setBusy(false)}
 }
 const cname=c=>c?.name||String(c?.chain||'').replaceAll('_',' ');
 return <div className="acrossBox circleBox">
   <div className="acrossTop"><div><small>CIRCLE CCTP / BRIDGE KIT</small><strong>Native USDC → ARC</strong></div><button onClick={connect}>{account?short(account):'Connect wallet'}</button></div>
   <div className="circleLive">{arc?<><i/> ARC MAINNET DETECTED LIVE BY CIRCLE SDK</>:<>ARC MAINNET NOT YET RETURNED BY SDK</>}</div>
   <div className="two">
    <label>From<select value={fromChain} onChange={e=>{setFromChain(e.target.value);setEstimate(null)}}>{chains.filter(c=>c.chain!==toChain).map(c=><option key={c.chain} value={c.chain}>{cname(c)}</option>)}</select></label>
    <label>To<select value={toChain} onChange={e=>{setToChain(e.target.value);setEstimate(null)}}>{chains.map(c=><option key={c.chain} value={c.chain}>{cname(c)}</option>)}</select></label>
   </div>
   <label>Asset<input value="USDC" disabled/></label>
   <label>Amount<input inputMode="decimal" placeholder="0.00 USDC" value={amount} onChange={e=>{setAmount(e.target.value);setEstimate(null)}}/></label>
   {!estimate?<button className="primary circlePrimary" disabled={busy||!arc} onClick={doEstimate}>{busy?'Checking Circle…':arc?'Get Circle quote':'Waiting for Arc support'}</button>:
    <div className="quote circleQuote"><b>Circle CCTP route available</b>
      <div className="breakdown"><span><i>You send</i><strong>{amount} USDC</strong></span><span><i>Destination</i><strong>{cname(chains.find(c=>c.chain===toChain))}</strong></span><span><i>Asset received</i><strong>Native USDC</strong></span></div>
      <div className="mainnetWarn">MAINNET · Review chain, amount and recipient in your wallet before signing. Transfers are irreversible.</div>
      <button className="primary circlePrimary" disabled={busy} onClick={bridge}>{busy?'Bridge in progress…':'Confirm & Bridge USDC'}</button>
    </div>}
   {events.length>0&&<div className="circleEvents">{events.map((e,i)=><span key={i}>{e}</span>)}</div>}
   {msg&&<div className="msg">{msg}</div>}
   <div className="fine">Powered by Circle CCTP. Native USDC burn-and-mint; no wrapped USDC. Circle route availability is discovered at runtime.</div>
 </div>
}

function App(){
 const[provider,setProvider]=useState('circle');
 const config=useMemo(()=>({
   appearance:'dark',
   variant:'compact',
   fromChain:RH,
   toChain:ARC,
   buildUrl:true,
   routePriority:'RECOMMENDED',
   useRecommendedRoute:true,
   useRelayerRoutes:true,
   poweredBy:'jumper',
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
  <header className="top"><a className="brand" href="/"><img src="/favicon.svg"/><span>DEAD PIXELS <b>BRIDGE</b></span></a><div className="headerActions"><a className="friendsLink" href="https://opensea.io/collection/friends-pixels/overview" target="_blank" rel="noopener noreferrer">FRIENDS PIXELS ↗</a><div className="secure"><i/> NON-CUSTODIAL</div></div></header>
  <section className="hero"><div className="eyebrow">DEAD PIXELS LABS / CROSS-CHAIN</div><h1>BRIDGE THE<br/><em>GLITCH.</em></h1><p>Three bridge engines. Circle CCTP brings native USDC routing to ARC.</p><div className="route"><span>Circle</span><b>+</b><span>LI.FI</span><b>+</b><span>Across</span><small>live route discovery</small></div></section>
  <section className="layout"><aside><div><label>01</label><h3>Three providers</h3><p>LI.FI now includes Intents/relayer routes used by Jumper, plus Circle CCTP and Across.</p></div><div><label>02</label><h3>Native USDC to ARC</h3><p>Circle CCTP burns USDC on the source chain and mints native USDC on the destination.</p></div><div><label>03</label><h3>Live routing</h3><p>LI.FI recommended + relayer routes are enabled. Arc mainnet chain ID 5042 is preselected.</p></div></aside>
   <div className="card"><div className="providerTabs three"><button className={provider==='circle'?'active circleActive':''} onClick={()=>setProvider('circle')}>CIRCLE</button><button className={provider==='lifi'?'active':''} onClick={()=>setProvider('lifi')}>LI.FI</button><button className={provider==='across'?'active':''} onClick={()=>setProvider('across')}>ACROSS</button></div>
    {provider==='circle'?<CirclePanel/>:provider==='lifi'?<>
      <div className="lifiLive"><i/> LI.FI INTENTS + RELAYER ROUTES ENABLED · ARC 5042</div>
      <LiFiWidget integrator={INTEGRATOR} config={config}/>
      <div className="powered">POWERED BY <b>LI.FI / JUMPER ROUTING</b> · {INTEGRATOR}</div>
    </>:<AcrossPanel/>}
   </div>
  </section>
  <footer><strong>DEAD PIXELS LABS</strong><p>Cross-chain transactions involve smart-contract, liquidity, slippage and third-party provider risk. Verify every transaction before signing.</p><code>{TREASURY.slice(0,8)}…{TREASURY.slice(-6)}</code></footer>
 </main>
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
