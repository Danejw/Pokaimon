/**
 * Synthesized original audio cues for retro handheld pacing.
 * No copyrighted game music, sound recordings or vendor assets.
 */
type Cue = 'select'|'confirm'|'encounter'|'throw'|'summon'|'attack'|'hit'|'win'|'lose'|'text';
const sequence:Record<Cue,readonly number[]> = {
  select:[590], confirm:[560,760], encounter:[380,490,710],
  throw:[610,740,860], summon:[690,880,1040], attack:[300,470,670],
  hit:[410,210], win:[540,680,810,1020], lose:[390,315,240], text:[780],
};
/** Audio contexts only start after a user gesture, and are always disposable. */
export function playCue(kind:Cue,enabled:boolean):void{
  if(!enabled||typeof window==='undefined')return;
  const Audio=window.AudioContext;
  if(!Audio)return;
  try{
    const ctx=new Audio();
    const notes=sequence[kind];
    const length=kind==='text'?0.025:0.09;
    notes.forEach((frequency,i)=>{
      const t=ctx.currentTime+i*(kind==='win'?0.11:0.075);
      const oscillator=ctx.createOscillator();
      const gain=ctx.createGain();
      oscillator.type=kind==='hit'||kind==='attack'?'sawtooth':'square';
      oscillator.frequency.setValueAtTime(frequency,t);
      gain.gain.setValueAtTime(0.0001,t);
      gain.gain.exponentialRampToValueAtTime(kind==='text'?0.009:0.026,t+0.009);
      gain.gain.exponentialRampToValueAtTime(0.0001,t+length);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(t);oscillator.stop(t+length+0.01);
    });
    void new Promise(resolve=>window.setTimeout(resolve,notes.length*140+200))
      .finally(()=>void ctx.close().catch(()=>{}));
  }catch{/* No audio permission must never interrupt a battle. */}
}
