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
    integrator:INTEGRATOR,fee:'0.003',slippage:'0.005',order:'RECOMMENDED'
  });
  else return res.status(400).json({message:'Unknown LI.FI action'});
  const r=await fetch(url,{headers});
  const text=await r.text();
  let data;try{data=JSON.parse(text)}catch{data={message:text||'Invalid LI.FI response'}}
  res.setHeader('Cache-Control','no-store');
  return res.status(r.status).json(data);
 }catch(e){return res.status(500).json({message:e?.message||'LI.FI proxy failed'})}
}
