/**
 * Original two-tone synthesized game cues. No third-party sounds or melodies.
 * AudioContext is created only on an explicit player gesture.
 */
export function playCue(kind:'select'|'hit'|'win'|'lose',enabled:boolean):void {
  if(!enabled || typeof window==='undefined')return;
  const Context=window.AudioContext;
  if(!Context)return;
  try{
    const ctx=new Context();
    const notes=kind==='win'?[523,659,784]:kind==='lose'?[330,275]:kind==='hit'?[420,190]:[510,650];
    notes.forEach((frequency,i)=>{
      const at=ctx.currentTime+i*0.085;
      const osc=ctx.createOscillator();
      const gain=ctx.createGain();
      osc.type=kind==='hit'?'sawtooth':'square';
      osc.frequency.setValueAtTime(frequency,at);
      gain.gain.setValueAtTime(0.0001,at);
      gain.gain.exponentialRampToValueAtTime(0.035,at+0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001,at+0.09);
      osc.connect(gain);gain.connect(ctx.destination);
      osc.start(at);osc.stop(at+0.1);
    });
    void new Promise(resolve=>setTimeout(resolve,Math.ceil(notes.length*85)+180))
      .finally(()=>void ctx.close().catch(()=>{}));
  }catch{/* Browsers can deny autoplay or audio contexts without affecting battle logic. */}
}
