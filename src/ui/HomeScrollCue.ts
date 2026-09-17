import './home-scroll-cue.css';
/** Presentation only: no changes to Home grid dimensions. */
export class HomeScrollCue {
 private button=document.createElement('button');
 constructor(private home:HTMLElement){
  this.button.type='button';this.button.className='home-scroll-cue';this.button.setAttribute('aria-label','下のコンテンツへ');
  this.button.innerHTML='<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m7 8 9 8 9-8M7 18l9 8 9-8"/></svg>';home.append(this.button);
  this.button.onclick=()=>{
   const viewport=home.getBoundingClientRect();
   const next=[...home.querySelectorAll<HTMLElement>('.home-menu,.progress-panel,.home-game-flow-wrap')].map(el=>el.getBoundingClientRect().top-viewport.top+home.scrollTop).filter(y=>y>home.scrollTop+80).sort((a,b)=>a-b)[0]??home.clientHeight*.8;
   home.scrollTo({top:next,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  };
  home.addEventListener('scroll',()=>this.update(),{passive:true});
  new ResizeObserver(()=>this.update()).observe(home);
 }
 update(){this.button.hidden=this.home.classList.contains('hidden')||this.home.scrollTop>24||this.home.scrollHeight<=this.home.clientHeight+24;}
}
