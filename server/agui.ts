import { createServer, type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { EventType, PROTOCOL_VERSION, type BaseEvent, type RunAgentInput } from '@ag-ui/core';
import { RunAgentInputSchema } from '@ag-ui/core/schemas';
import { EventEncoder } from '@ag-ui/encoder';
import { liveAdapters } from './provider-contract';

const BODY_LIMIT = 64 * 1024;
const MAX_MESSAGES = 20;

function json(res: ServerResponse, code: number, data: unknown): void {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(data));
}
async function readBody(req: IncomingMessage): Promise<string> {
  let size=0;
  const chunks: Buffer[]=[];
  for await (const chunk of req) {
    const part = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size+=part.length;
    if(size>BODY_LIMIT){throw new Error('BODY_TOO_LARGE');}
    chunks.push(part);
  }
  return Buffer.concat(chunks).toString('utf8');
}
async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const path=new URL(req.url??'/', 'http://localhost').pathname;
  if(req.method==='GET' && path==='/api/health') {
    json(res,200,{status:'ok',mode:'simulation',agui:'1.0',liveProviders:liveAdapters.length});return;
  }
  if(path!=='/api/agui'){json(res,404,{error:'Not found'});return;}
  if(req.method!=='POST'){json(res,405,{error:'POST required'});return;}
  if(!(req.headers['content-type']??'').includes('application/json')){
    json(res,415,{error:'application/json required'});return;
  }
  let body:string;
  try {body=await readBody(req);}
  catch(e){json(res,e instanceof Error&&e.message==='BODY_TOO_LARGE'?413:400,{error:'Request could not be read'});return;}
  let parsed:unknown;
  try {parsed=JSON.parse(body);}catch{json(res,400,{error:'Invalid JSON'});return;}
  const input=RunAgentInputSchema.safeParse(parsed);
  if(!input.success){json(res,400,{error:'Invalid AG-UI RunAgentInput'});return;}
  if(input.data.messages.length>MAX_MESSAGES){json(res,422,{error:'Too many messages'});return;}
  // The MVP's AG-UI endpoint is only a simulation handshake, never an inference proxy.
  const info: RunAgentInput=input.data;
  const fail=typeof info.forwardedProps==='object' && info.forwardedProps!==null &&
    (info.forwardedProps as Record<string,unknown>).simulateError === true;
  const encoder=new EventEncoder({accept:'text/event-stream'});
  res.writeHead(200,{
    'Content-Type':encoder.getContentType(),
    'Cache-Control':'no-cache, no-transform',
    'Connection':'keep-alive',
    'X-Accel-Buffering':'no',
    'X-Content-Type-Options':'nosniff'
  });
  const send=(event:BaseEvent)=>{if(!res.destroyed)res.write(encoder.encode(event));};
  const metadata={mode:'simulation',verified:false,providerCalls:0};
  send({type:EventType.RUN_STARTED,threadId:info.threadId,runId:info.runId,protocolVersion:PROTOCOL_VERSION,metadata});
  if(fail){
    send({type:EventType.RUN_ERROR,message:'Simulated AG-UI failure. No work was performed.',code:'SIMULATED_FAILURE',metadata});
    res.end();return;
  }
  send({type:EventType.STATE_SNAPSHOT,snapshot:{mode:'simulation',verified:false,providerCalls:0}});
  const messageId=randomUUID();
  send({type:EventType.TEXT_MESSAGE_START,messageId,role:'assistant'});
  for(const delta of ['Pokaimon AG-UI simulation connected. ', 'This endpoint makes no model calls. ', 'Only verified tool outcomes can power future live victories.']){
    send({type:EventType.TEXT_MESSAGE_CONTENT,messageId,delta});
  }
  send({type:EventType.TEXT_MESSAGE_END,messageId});
  send({type:EventType.RUN_FINISHED,threadId:info.threadId,runId:info.runId,metadata});
  res.end();
}
export function createAppServer(): Server {
  return createServer((req,res)=>{void handle(req,res).catch(()=>{
    if(!res.headersSent)json(res,500,{error:'Internal server error'});
    else if(!res.destroyed)res.end();
  });});
}
