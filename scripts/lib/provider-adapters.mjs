import { ALLOWED_DOC_HOSTS, classifyModel } from './evolution-core.mjs';

const PROVIDERS={
  openai:{url:'https://api.openai.com/v1/models',key:'OPENAI_API_KEY'},
  anthropic:{url:'https://api.anthropic.com/v1/models?limit=100',key:'ANTHROPIC_API_KEY'},
  xai:{url:'https://api.x.ai/v1/models',key:'XAI_API_KEY'},
};
const LIMIT=400;
async function boundedJson(url,headers,fetcher=fetch){
  const response=await fetcher(url,{headers,redirect:'error',signal:AbortSignal.timeout(14000)});
  if(!response.ok)throw Error('Model listing returned HTTP '+response.status);
  if(Number(response.headers.get('content-length')??0)>1200000)throw Error('Model listing too large');
  const body=await response.text();
  if(body.length>1200000)throw Error('Model listing too large');
  return JSON.parse(body);
}
export function normalizeListing(provider,body){
  if(!Array.isArray(body?.data))throw Error('Unexpected '+provider+' list shape');
  return body.data.slice(0,LIMIT).filter(item=>item && typeof item.id==='string')
    .map(item=>({id:item.id,displayName:typeof item.display_name==='string'?item.display_name:item.id}))
    .filter(item=>classifyModel(provider,item.id)!==null);
}
function docUrl(provider,id){
  if(provider==='openai')return 'https://developers.openai.com/api/docs/models/'+id;
  if(provider==='anthropic')return 'https://platform.claude.com/docs/en/models/'+id.replace(/^claude-/,'')+'/overview';
  return 'https://x.ai/news/'+id;
}
export async function verifyOfficialDocument(provider,model,fetcher=fetch){
  const url=docUrl(provider,model.id);
  const parsed=new URL(url);
  if(!ALLOWED_DOC_HOSTS[provider]?.includes(parsed.hostname))return {verified:false,reason:'untrusted-domain'};
  let response;
  try{response=await fetcher(url,{redirect:'error',signal:AbortSignal.timeout(13000),
      headers:{accept:'text/html,text/plain'}});}
  catch{return {verified:false,reason:'official-doc-unavailable'};}
  if(!response.ok)return {verified:false,reason:'official-doc-http-'+response.status};
  const length=Number(response.headers.get('content-length')??0);
  if(length>900000)return {verified:false,reason:'official-doc-too-large'};
  const text=await response.text();
  if(text.length>900000)return {verified:false,reason:'official-doc-too-large'};
  const safeText=text.toLowerCase();
  if(!safeText.includes(model.id.toLowerCase()))return {verified:false,reason:'official-model-id-not-documented'};
  return {verified:true,sourceUrl:url};
}
export async function listOfficialModels(provider,env=process.env,fetcher=fetch){
  const config=PROVIDERS[provider];
  if(!config)return {provider,status:'unsupported',models:[]};
  const key=env[config.key];
  if(!key)return {provider,status:'missing-key',models:[]};
  const headers={accept:'application/json'};
  if(provider==='anthropic'){
    headers['x-api-key']=key;
    headers['anthropic-version']='2026-10-21';
  }else headers.authorization='Bearer '+key;
  try{
    let body=await boundedJson(config.url,headers,fetcher);
    const models=normalizeListing(provider,body);
    let pages=1;
    while(provider==='anthropic' && body.has_more && pages<4){
      const lastId=typeof body.last_id==='string'?body.last_id:body.data?.at(-1)?.id;
      if(typeof lastId!=='string'||lastId.length>90)return {provider,status:'partial-pagination',models};
      body=await boundedJson(config.url+'&after_id='+encodeURIComponent(lastId),headers,fetcher);
      models.push(...normalizeListing(provider,body));
      pages++;
      if(models.length>400)return {provider,status:'partial-pagination',models:models.slice(0,400)};
    }
    // If a provider's listing exceeds the bounded scan, publish nothing from it.
    if(provider==='anthropic' && body.has_more)return {provider,status:'partial-pagination',models};
    return {provider,status:'ok',models:[...new Map(models.map(m=>[m.id,m])).values()]};
  }catch(error){
    const message=error instanceof Error?error.message:'Source failed';
    return {provider,status:'error',models:[],reason:message.replaceAll(key,'[REDACTED]').slice(0,200)};
  }
}
export function providerKeysConfigured(env=process.env){
  return Object.keys(PROVIDERS).filter(id=>!!env[PROVIDERS[id].key]);
}
