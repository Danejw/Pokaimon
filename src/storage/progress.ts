export interface Progress { schema: 1; cleared: string[]; }
export const defaultProgress: Progress = { schema: 1, cleared: [] };
const KEY='pokaimon:progress:v1';
export function loadProgress(): Progress {
  try {
    const value:unknown=JSON.parse(localStorage.getItem(KEY)||'null');
    if(!value||typeof value!=='object')return {schema:1,cleared:[]};
    const o=value as Record<string,unknown>;
    if(o.schema!==1||!Array.isArray(o.cleared))return {schema:1,cleared:[]};
    return {schema:1,cleared:[...new Set(o.cleared.filter((x):x is string=>typeof x==='string'&&/^[a-z-]+$/.test(x)))].slice(0,100)};
  }catch{return {schema:1,cleared:[]};}
}
export function saveProgress(p:Progress):void{try{localStorage.setItem(KEY,JSON.stringify(p));}catch{/* Storage unavailable */}}
export function markCleared(p:Progress,id:string):Progress{
  if(p.cleared.includes(id))return p;
  return {schema:1,cleared:[...p.cleared,id]};
}
export function clearProgress():Progress{const p={schema:1 as const,cleared:[]};saveProgress(p);return p;}
