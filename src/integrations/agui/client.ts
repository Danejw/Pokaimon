import { HttpAgent } from '@ag-ui/client';

export interface AguiProbeResult {
  started: boolean;
  finished: boolean;
  simulated: boolean;
  message: string;
  error?: string;
}
/** Official AG-UI HttpAgent integration. Safe read-only simulation handshake. */
export async function probeAgui(url='/api/agui'):Promise<AguiProbeResult> {
  const agent = new HttpAgent({url});
  agent.addMessage({id:crypto.randomUUID(),role:'user',content:'Pokaimon simulation transport check'});
  let started=false,finished=false,error: string|undefined;
  let message='';
  try {
    await agent.runAgent({},{
      onRunStartedEvent:({event})=>{started=Boolean(event.protocolVersion);},
      onTextMessageContentEvent:({event})=>{message+=event.delta;},
      onRunErrorEvent:({event})=>{error=event.message;},
      onRunFinishedEvent:()=>{finished=true;},
    });
    if(!started||!finished||error)return {started,finished,simulated:true,message,error:error??'AG-UI run did not finish correctly.'};
    return {started,finished,simulated:true,message};
  } catch(e) {
    return {started,finished:false,simulated:true,message,error:e instanceof Error?e.message:'AG-UI connection failed'};
  }
}
