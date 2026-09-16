const UPSTREAM='https://li.quest/v1';

function appendQuery(searchParams,key,value){
  if(value===undefined||value===null||key==='path') return;
  if(Array.isArray(value)){
    for(const item of value) searchParams.append(key,String(item));
  }else{
    searchParams.append(key,String(value));
  }
}

export default async function handler(req,res){
  if(req.method==='OPTIONS'){
    res.setHeader('Allow','GET,POST,PUT,PATCH,DELETE,OPTIONS');
    return res.status(204).end();
  }

  try{
    const rawPath=req.query?.path;
    const path=Array.isArray(rawPath)?rawPath.join('/'):String(rawPath||'');
    if(!path||path.includes('..')||!/^[-A-Za-z0-9_./]+$/.test(path)){
      return res.status(400).json({message:'Invalid LI.FI API path'});
    }

    const qs=new URLSearchParams();
    for(const [key,value] of Object.entries(req.query||{})) appendQuery(qs,key,value);
    const target=`${UPSTREAM}/${path}${qs.toString()?`?${qs.toString()}`:''}`;

    const headers={
      accept:req.headers.accept||'application/json',
      'content-type':req.headers['content-type']||'application/json'
    };
    if(process.env.LIFI_API_KEY) headers['x-lifi-api-key']=process.env.LIFI_API_KEY;

    const init={method:req.method,headers,signal:AbortSignal.timeout(25000)};
    if(!['GET','HEAD'].includes(req.method) && req.body!==undefined && req.body!==null){
      init.body=typeof req.body==='string'?req.body:JSON.stringify(req.body);
    }

    const upstream=await fetch(target,init);
    const body=await upstream.text();
    res.status(upstream.status);
    res.setHeader('cache-control','no-store');
    const contentType=upstream.headers.get('content-type');
    if(contentType) res.setHeader('content-type',contentType);
    return res.send(body);
  }catch(error){
    console.error('LI.FI proxy error',error);
    return res.status(502).json({message:'LI.FI upstream request failed'});
  }
}
