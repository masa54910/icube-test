/** Presentation only: contact 0–80ms, compression to 220ms, hold to 280ms, recover at 580ms. */
export const LANDING_DURATION=.58;
export const LANDING_COMPRESSION_START=.08;
export function landingStrength(fallSpeed:number):number {return Math.max(0,Math.min(1,(fallSpeed-3)/7));}
export function landingCompression(remaining:number):number {
  const elapsed=LANDING_DURATION-remaining;
  if(elapsed<0||elapsed>=LANDING_DURATION)return 0;
  const t=elapsed<.08?.18*elapsed/.08:elapsed<.22?.18+.82*(elapsed-.08)/.14:elapsed<.28?1:1-(elapsed-.28)/.30;
  const x=Math.max(0,Math.min(1,t));return x*x*(3-2*x);
}
