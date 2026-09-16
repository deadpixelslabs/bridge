import React,{useEffect,useMemo,useState}from'react';
import ReactDOM from'react-dom/client';
import{LiFiWidget}from'@lifi/widget';
import'./style.css';

const INTEGRATOR='dead-pixels-bridge';
const TREASURY='0xc225b514223ad76d0792ececd836ad922b6d0673';
const RH=4663, ARC=5042;
const ZERO='0x0000000000000000000000000000000000000000';

const hex=n=>'0x'+BigInt(n).toString(16);
const short=a=>a?`${a.slice(0,6)}…${a.slice(-4)}`:'';
const fmt=(raw,d=18)=>{try{let s=BigInt(raw||0).toString().padStart(d+1,'0');let a=s.slice(0,-d),b=s.slice(-d).replace(/0+$/,'').slice(0,6);return b?`${a}.${b}`:a}catch{return'0'}};
const units=(v,d)=>{let[a,b='']=String(v||'0').trim().split('.');b=(b+'0'.repeat(d)).slice(0,d);return(BigInt(a||0)*10n**BigInt(d)+BigInt(b||0)).toString()};
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
 const[quote,setQuote]=useState(null);
 const[busy,setBusy]=useState(false);
 const[msg,setMsg]=useState('');

 async function api(q){const r=await fetch('/api/across?'+new URLSearchParams(q));const j=await r.json();if(!r.ok)throw Error(j.message||j.error||'Across request failed');return j}
 async function connect(){if(!window.ethereum)return setMsg('Install an EVM wallet first.');const a=await window.ethereum.request({method:'eth_requestAccounts'});setAccount(a[0]||'')}
 useEffect(()=>{api({action:'chains'}).then(x=>setChains(normalizeList(x))).catch(e=>setMsg(e.message))},[]);
 useEffect(()=>{setFromToken('');setQuote(null);api({action:'tokens',chainId:String(fromChain)}).then(x=>setTokens(normalizeList(x))).catch(()=>setTokens([]))},[fromChain]);
 useEffect(()=>{setToToken('');setQuote(null);api({action:'tokens',chainId:String(toChain)}).then(x=>setOutTokens(normalizeList(x))).catch(()=>setOutTokens([]))},[toChain]);
 const tokenAddr=t=>t?.address||t?.tokenAddress||t?.contractAddress||'';
 const tokenSym=t=>t?.symbol||t?.name||short(tokenAddr(t));
 const tokenDec=t=>Number(t?.decimals??18);
 const selected=tokens.find(t=>tokenAddr(t).toLowerCase()===fromToken.toLowerCase());
 async function refreshBalance(){
  if(!account||!selected)return setBalance('—');
  try{
   const cid=await window.ethereum.request({method:'eth_chainId'});
   if(BigInt(cid)!==BigInt(fromChain)){setBalance('switch chain');return}
   let raw;
   if(tokenAddr(selected)===ZERO||selected.isNative) raw=await window.ethereum.request({method:'eth_getBalance',params:[account,'latest']});
   else{
    const data='0x70a08231'+account.slice(2).padStart(64,'0');
    raw=await window.ethereum.request({method:'eth_call',params:[{to:tokenAddr(selected),data},'latest']});
   }
   setBalance(fmt(raw,tokenDec(selected)));
  }catch{setBalance('unavailable')}
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
 return <div className="acrossBox">
  <div className="acrossTop"><div><small>ACROSS SWAP API</small><strong>Direct Across route</strong></div><button onClick={connect}>{account?short(account):'Connect wallet'}</button></div>
  <div className="two">
   <label>From<select value={fromChain} onChange={e=>setFromChain(+e.target.value)}>{chains.map(c=><option key={chainId(c)} value={chainId(c)}>{chainName(c)}</option>)}</select></label>
   <label>To<select value={toChain} onChange={e=>setToChain(+e.target.value)}>{chains.map(c=><option key={chainId(c)} value={chainId(c)}>{chainName(c)}</option>)}</select></label>
  </div>
  <div className="two">
   <label>Pay token<select value={fromToken} onChange={e=>setFromToken(e.target.value)}><option value="">Select token</option>{tokens.map((t,i)=><option key={tokenAddr(t)+i} value={tokenAddr(t)}>{tokenSym(t)}</option>)}</select><small>Balance: {balance}</small></label>
   <label>Receive token<select value={toToken} onChange={e=>setToToken(e.target.value)}><option value="">Select token</option>{outTokens.map((t,i)=><option key={tokenAddr(t)+i} value={tokenAddr(t)}>{tokenSym(t)}</option>)}</select></label>
  </div>
  <label>Amount<input inputMode="decimal" placeholder="0.00" value={amount} onChange={e=>{setAmount(e.target.value);setQuote(null)}}/></label>
  {!quote?<button className="primary" disabled={busy} onClick={getQuote}>{busy?'Checking route…':'Get Across route'}</button>:
   <div className="quote"><b>Across route available</b>{out&&<span>Estimated output: {out}</span>}<span>DEAD PIXELS fee: 0.30%</span><button className="primary" disabled={busy} onClick={execute}>{busy?'Waiting for wallet…':'Bridge with Across'}</button></div>}
  {msg&&<div className="msg">{msg}</div>}
  <div className="fine">Only routes returned live by Across are executable. Quotes are never cached.</div>
 </div>
}

function App(){
 const[provider,setProvider]=useState('lifi');
 const config=useMemo(()=>({appearance:'dark',variant:'compact',fromChain:RH,toChain:ARC,buildUrl:true,routePriority:'RECOMMENDED',feeConfig:{fee:0.003,name:'DEAD PIXELS fee',showFeePercentage:true,showFeeTooltip:true},theme:{container:{borderRadius:'22px',boxShadow:'0 24px 80px rgba(0,0,0,.55)'},palette:{primary:{main:'#ff2b2b'},secondary:{main:'#fff'}},shape:{borderRadius:14,borderRadiusSecondary:10},typography:{fontFamily:'Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif'}}}),[]);
 return <main className="shell">
  <header className="top"><a className="brand" href="/"><img src="/favicon.svg"/><span>DEAD PIXELS <b>BRIDGE</b></span></a><div className="secure"><i/> NON-CUSTODIAL</div></header>
  <section className="hero"><div className="eyebrow">DEAD PIXELS LABS / CROSS-CHAIN</div><h1>BRIDGE THE<br/><em>GLITCH.</em></h1><p>Two live routing engines. Your wallet stays in control.</p><div className="route"><span>LI.FI</span><b>+</b><span>Across</span><small>live route discovery</small></div></section>
  <section className="layout"><aside><div><label>01</label><h3>Two providers</h3><p>Choose LI.FI aggregation or query Across directly.</p></div><div><label>02</label><h3>0.30% platform fee</h3><p>Integrator fee is configured on both providers. Network/provider costs remain separate.</p></div><div><label>03</label><h3>Live only</h3><p>No executable quote means no bridge transaction is offered.</p></div></aside>
   <div className="card"><div className="providerTabs"><button className={provider==='lifi'?'active':''} onClick={()=>setProvider('lifi')}>LI.FI</button><button className={provider==='across'?'active':''} onClick={()=>setProvider('across')}>ACROSS</button></div>
    {provider==='lifi'?<><LiFiWidget integrator={INTEGRATOR} config={config}/><div className="powered">POWERED BY <b>LI.FI</b> · {INTEGRATOR}</div></>:<AcrossPanel/>}
   </div>
  </section>
  <footer><strong>DEAD PIXELS LABS</strong><p>Cross-chain transactions involve smart-contract, liquidity, slippage and third-party provider risk. Verify every transaction before signing.</p><code>{TREASURY.slice(0,8)}…{TREASURY.slice(-6)}</code></footer>
 </main>
}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
