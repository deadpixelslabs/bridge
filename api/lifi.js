const BASE='https://li.quest/v1';
const INTEGRATOR='dead-pixels-bridge';
function qs(obj){return new URLSearchParams(Object.entries(obj).filter(([,v])=>v!==undefined&&v!==null&&v!==''))}
export default async function handler(req,res){
 try{
  const q=req.query||{};
  const headers={accept:'application/json'};
  if(process.env.LIFI_API_KEY)headers['x-lifi-api-key']=process.env.LIFI_API_KEY;
  let url;
  if(q.action==='chains') url=BASE+'/chains?'+qs({chainTypes:'EVM'});
  else if(q.action==='tokens') url=BASE+'/tokens?'+qs({chains:q.chainId,chainTypes:'EVM'});
  else if(q.action==='quote') url=BASE+'/quote?'+qs({
    fromChain:q.fromChain,toChain:q.toChain,fromToken:q.fromToken,toToken:q.toToken,
    fromAmount:q.fromAmount,fromAddress:q.fromAddress,toAddress:q.toAddress,
    integrator:INTEGRATOR,fee:'0.003',slippage:'0.005',order:'CHEAPEST',skipSimulation:'true'
  });
  else return res.status(400).json({message:'Unknown LI.FI action'});
  let r=await fetch(url,{headers});
  let text=await r.text();
  let data;try{data=JSON.parse(text)}catch{data={message:text||'Invalid LI.FI response'}}

  // Diagnostic/fallback parity with route discovery UIs:
  // If LI.FI rejects the monetized quote, retry the exact transfer without fee.
  // This tells the UI whether the route exists and avoids falsely saying "no route".
  if(q.action==='quote' && !r.ok){
    const fallbackUrl=BASE+'/quote?'+qs({
      fromChain:q.fromChain,toChain:q.toChain,fromToken:q.fromToken,toToken:q.toToken,
      fromAmount:q.fromAmount,fromAddress:q.fromAddress,toAddress:q.toAddress,
      integrator:INTEGRATOR,slippage:'0.005',order:'CHEAPEST',skipSimulation:'true'
    });
    const r2=await fetch(fallbackUrl,{headers});
    const t2=await r2.text();
    let d2;try{d2=JSON.parse(t2)}catch{d2={message:t2||'Invalid LI.FI fallback response'}}
    if(r2.ok){
      d2._deadPixels={feeApplied:false,routeRecovered:true,
        warning:'Route exists, but LI.FI rejected the 0.30% fee quote. Execution is disabled until the integrator fee configuration is accepted.'};
      res.setHeader('Cache-Control','no-store');
      return res.status(200).json(d2);
    }
    data={primary:data,fallback:d2};
    r=r2;
  }

  res.setHeader('Cache-Control','no-store');
  if(!r.ok){
   return res.status(r.status).json({
     message:data?.primary?.message||data?.fallback?.message||data?.message||data?.error?.message||data?.error||'LI.FI quote request failed',
     lifi:data,
     request:{action:q.action,fromChain:q.fromChain,toChain:q.toChain,fromToken:q.fromToken,toToken:q.toToken,skipSimulation:true}
   });
  }
  data._deadPixels={feeApplied:true,routeRecovered:false};
  return res.status(r.status).json(data);
 }catch(e){return res.status(500).json({message:e?.message||'LI.FI proxy failed'})}
}
