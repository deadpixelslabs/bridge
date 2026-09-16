const BASE='https://app.across.to/api';
const ALLOWED=new Set(['chains','tokens','sources','approval','status']);

export default async function handler(req,res){
  res.setHeader('cache-control','no-store');
  const key=process.env.ACROSS_API_KEY;
  const integratorId=process.env.ACROSS_INTEGRATOR_ID;
  if(!key||!integratorId) return res.status(500).json({error:'Across credentials are not configured'});
  const action=String(req.query.action||'');
  if(!ALLOWED.has(action)) return res.status(400).json({error:'Invalid action'});
  const map={chains:'/swap/chains',tokens:'/swap/tokens',sources:'/swap/sources',approval:'/swap/approval',status:'/deposit/status'};
  const p=new URLSearchParams();
  for(const [k,v] of Object.entries(req.query)){
    if(k==='action'||Array.isArray(v)||typeof v!=='string'||v.length>500) continue;
    p.set(k,v);
  }
  p.set('integratorId',integratorId);
  if(action==='approval'){
    p.set('tradeType','exactInput');
    p.set('appFee','0.003');
    p.set('appFeeRecipient','0xc225b514223ad76d0792ececd836ad922b6d0673');
  }
  try{
    const r=await fetch(`${BASE}${map[action]}?${p}`,{
      method:'GET',
      headers:{Authorization:`Bearer ${key}`,Accept:'application/json'}
    });
    const body=await r.text();
    res.status(r.status);
    res.setHeader('content-type',r.headers.get('content-type')||'application/json');
    return res.send(body);
  }catch(e){
    return res.status(502).json({error:'Across upstream request failed'});
  }
}
