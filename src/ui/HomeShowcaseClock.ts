export const HOME_SHOWCASE_INTERVAL_MS=10_000;
export const HOME_SHOWCASE_TRANSITION_MS=1_100;
/** Presentation-only clock: no game or save state. Unavailable images are skipped. */
export class HomeShowcaseClock {
  current=0;
  elapsed=0;
  reset():void {this.current=0;this.elapsed=0;}
  select(index:number):void {this.current=index;this.elapsed=0;}
  tick(ms:number,available:readonly boolean[]):boolean {
    this.elapsed+=ms;
    if(this.elapsed<HOME_SHOWCASE_INTERVAL_MS)return false;
    this.elapsed=0;
    for(let step=1;step<=5;step++){
      const next=(this.current+step)%5;
      if(available[next]){const changed=next!==this.current;this.current=next;return changed;}
    }
    return false;
  }
}
