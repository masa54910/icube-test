const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export const CORRECT_DURATION=4.15;
/** One continuous pulse, two full turns; advanced only by the game's unpaused clock. */
export function correctFrame(time:number,reducedMotion=false){
  const spin=time>=2.65?1:clamp((time-1.05)/1.6),entry=clamp((time-3.05)/.55);
  const light=time<1.05?clamp((time-.7)/.35)*.7:time<2.65?.7+.3*spin:clamp(1-(time-2.65)/.65);
  return {angle:reducedMotion?0:spin*720,spinVisible:time>=1.05&&time<2.65,light:light*(reducedMotion?.45:1),sceneReady:time>=2.65,shapeVisible:time>=3.45,entry,resultReady:time>=CORRECT_DURATION};
}
