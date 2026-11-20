import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { Server } from 'node:http';
import { HttpAgent } from '@ag-ui/client';
import { createAppServer } from '../server/agui';
import { getAdapter, liveAdapters } from '../server/provider-contract';

let server:Server;let url:string;
beforeAll(async()=>{
  server=createAppServer();
  await new Promise<void>(resolve=>server.listen(0,'127.0.0.1',resolve));
  const address=server.address();
  if(!address||typeof address==='string')throw new Error('Test server port unavailable');
  url='http://127.0.0.1:'+address.port;
});
afterAll(async()=>{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));});

describe('AG-UI simulation transport',()=>{
  it('uses a genuine official HttpAgent client and lifecycle stream',async()=>{
    const agent=new HttpAgent({url:url+'/api/agui'});
    agent.addMessage({id:crypto.randomUUID(),role:'user',content:'Hello'});
    const received:string[]=[];let text='';
    await agent.runAgent({},{
      onRunStartedEvent:({event})=>{expect(event.protocolVersion).toBeDefined();received.push('start');},
      onTextMessageContentEvent:({event})=>{text+=event.delta;received.push('content');},
      onRunFinishedEvent:()=>{received.push('finish');},
      onRunErrorEvent:({event})=>{throw new Error('Unexpected agent error: '+event.message);},
    });
    expect(received[0]).toBe('start');expect(received.at(-1)).toBe('finish');
    expect(text).toContain('simulation');expect(text).toContain('no model calls');
  });
  it('rejects malformed and oversized requests before streaming',async()=>{
    const endpoint=url+'/api/agui';
    const invalid=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:'{"wrong":true}'});
    expect(invalid.status).toBe(400);
    const wrongType=await fetch(endpoint,{method:'POST',headers:{'content-type':'text/plain'},body:'hello'});
    expect(wrongType.status).toBe(415);
    const tooLarge=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:'x'.repeat(66000)});
    expect(tooLarge.status).toBe(413);
  });
  it('can emit a valid RUN_ERROR without reporting a victory',async()=>{
    const input={threadId:crypto.randomUUID(),runId:crypto.randomUUID(),state:{},messages:[],tools:[],context:[],forwardedProps:{simulateError:true}};
    const res=await fetch(url+'/api/agui',{method:'POST',headers:{'content-type':'application/json','accept':'text/event-stream'},body:JSON.stringify(input)});
    expect(res.status).toBe(200);
    const body=await res.text();
    expect(body).toContain('RUN_STARTED');
    expect(body).toContain('RUN_ERROR');
    expect(body).not.toContain('RUN_FINISHED');
  });
  it('exposes a safe simulation-only health report and no live adapters',async()=>{
    const res=await fetch(url+'/api/health');
    expect(await res.json()).toMatchObject({status:'ok',mode:'simulation',liveProviders:0});
    expect(liveAdapters).toHaveLength(0);
    expect(getAdapter('openai','some-model')).toBeUndefined();
  });
});
