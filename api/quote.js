export default async function handler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const key=process.env.LIFI_API_KEY;
 if(!key)return res.status(500).json({error:'LIFI_API_KEY is not configured'});
 const allowed=['fromChain','toChain','fromToken','toToken','fromAmount','fromAddress','toAddress','slippage','order','allowBridges','denyBridges','allowExchanges','denyExchanges','fee','integrator'];
 const params=new URLSearchParams();
 for(const k of allowed){const v=req.query[k];if(typeof v==='string'&&v.length<500)params.set(k,v)}
 // Enforce this integration identity and fee server-side.
 params.set('integrator','dead-pixels-bridge');
 params.set('fee','0.003');
 try{
  const r=await fetch(`https://li.quest/v1/quote?${params.toString()}`,{headers:{'x-lifi-api-key':key,'accept':'application/json'}});
  const body=await r.text();
  res.status(r.status);
  res.setHeader('content-type',r.headers.get('content-type')||'application/json');
  res.setHeader('cache-control','no-store');
  return res.send(body);
 }catch(e){return res.status(502).json({error:'LI.FI upstream request failed'})}
}