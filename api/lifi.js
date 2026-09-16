const BASE='https://li.quest/v1';
const INTEGRATOR='dead-pixels-bridge';
function qs(obj){return new URLSearchParams(Object.entries(obj).filter(([,v])=>v!==undefined&&v!==null&&v!==''))}
async function bodyOf(r){const t=await r.text();try{return JSON.parse(t)}catch{return {message:t||'Invalid LI.FI response'}}}
export default async function handler(req,res){
 try{
  const q=req.query||{};
  const headers={accept:'application/json'};
  if(process.env.LIFI_API_KEY)headers['x-lifi-api-key']=process.env.LIFI_API_KEY;
  res.setHeader('Cache-Control','no-store');

  if(q.action==='chains'){
    const r=await fetch(BASE+'/chains?'+qs({chainTypes:'EVM'}),{headers});
    return res.status(r.status).json(await bodyOf(r));
  }
  if(q.action==='tokens'){
    const r=await fetch(BASE+'/tokens?'+qs({chains:q.chainId,chainTypes:'EVM'}),{headers});
    return res.status(r.status).json(await bodyOf(r));
  }
  if(q.action==='routes'){
    if(req.method!=='POST')return res.status(405).json({message:'POST required'});
    headers['content-type']='application/json';
    const b=req.body||{};
    const payload={
      fromChainId:Number(b.fromChainId),
      toChainId:Number(b.toChainId),
      fromTokenAddress:b.fromTokenAddress,
      toTokenAddress:b.toTokenAddress,
      fromAmount:String(b.fromAmount),
      ...(b.fromAddress?{fromAddress:b.fromAddress,toAddress:b.toAddress||b.fromAddress}:{}),
      executionType:'all',
      options:{
        integrator:INTEGRATOR,
        fee:0.003,
        slippage:0.005,
        order:'CHEAPEST',
        allowSwitchChain:true,
        timing:{
          routeTimingStrategies:[{strategy:'minWaitTime',minWaitTimeMs:1800,startingExpectedResults:6,reduceEveryMs:300}],
          swapStepTimingStrategies:[{strategy:'minWaitTime',minWaitTimeMs:800,startingExpectedResults:4,reduceEveryMs:250}]
        }
      }
    };
    let r=await fetch(BASE+'/advanced/routes',{method:'POST',headers,body:JSON.stringify(payload)});
    let data=await bodyOf(r);

    // Never report "no route" merely because partner monetization was rejected.
    // Retry exact route discovery without the fee, but mark those routes non-executable.
    if(!r.ok || !Array.isArray(data?.routes) || data.routes.length===0){
      const fallback={...payload,options:{...payload.options}};
      delete fallback.options.fee;
      r=await fetch(BASE+'/advanced/routes',{method:'POST',headers,body:JSON.stringify(fallback)});
      data=await bodyOf(r);
      if(r.ok && Array.isArray(data?.routes) && data.routes.length){
        data._deadPixels={feeApplied:false,routeRecovered:true};
        return res.status(200).json(data);
      }
    } else {
      data._deadPixels={feeApplied:true,routeRecovered:false};
    }
    return res.status(r.status).json(data);
  }
  return res.status(400).json({message:'Unknown LI.FI action'});
 }catch(e){return res.status(500).json({message:e?.message||'LI.FI proxy failed'})}
}
