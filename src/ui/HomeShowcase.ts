import {HomeShowcaseClock,HOME_SHOWCASE_TRANSITION_MS} from './HomeShowcaseClock';
import './home-showcase.css';

const LABELS=['BRAND','EXPLORE','CLIMB','SOLVE','CORRECT'] as const;
const BASE=import.meta.env.BASE_URL;
/** One live scene plus four captured game images. All lifecycle work stays in the UI. */
export class HomeShowcase {
  readonly clock=new HomeShowcaseClock();
  private layers:HTMLElement[]=[];
  private images:HTMLImageElement[]=[];
  private buttons:HTMLButtonElement[]=[];
  private ready=[true,false,false,false,false];
  private failed=new Set<number>();
  private controller:AbortController|null=null;
  private timer:ReturnType<typeof setTimeout>|null=null;
  private cancelLoad:(()=>void)|null=null;
  private active=false;
  private paused=false;
  private pending:number|null=null;
  private brandFade=0;
  private reduced=matchMedia('(prefers-reduced-motion: reduce)');
  private caption:HTMLElement;
  constructor(private surface:HTMLElement){
    surface.classList.add('home-showcase');
    surface.style.setProperty('--showcase-transition',HOME_SHOWCASE_TRANSITION_MS+'ms');
    const brand=document.createElement('div');brand.className='showcase-layer showcase-brand is-current';
    brand.append(...Array.from(surface.childNodes));surface.append(brand);this.layers.push(brand);
    for(let i=1;i<5;i++){
      const layer=document.createElement('div');layer.className='showcase-layer showcase-static';
      const img=document.createElement('img');img.alt=LABELS[i]!;img.width=1200;img.height=900;img.decoding='async';img.draggable=false;
      layer.append(img);surface.append(layer);this.layers.push(layer);this.images.push(img);
    }
    this.caption=document.createElement('div');this.caption.className='showcase-caption';surface.append(this.caption);
    const nav=document.createElement('nav');nav.className='showcase-navigation';nav.setAttribute('aria-label','Home showcase');
    LABELS.forEach((label,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`${String(i+1).padStart(2,'0')} ${label}`);b.dataset.showcase=String(i);b.innerHTML='<span aria-hidden="true"></span>';nav.append(b);this.buttons.push(b);});surface.append(nav);
    this.paint();
  }
  start():void {
    this.stop();this.active=true;this.paused=false;this.clock.reset();this.brandFade=0;this.paint();
    this.controller=new AbortController();const {signal}=this.controller;
    this.buttons.forEach((button,i)=>button.addEventListener('click',()=>{
      if(this.failed.has(i))return;
      this.clock.elapsed=0;
      if(this.ready[i])this.select(i);else {this.pending=i;this.preload();}
    },{signal}));
    document.addEventListener('visibilitychange',()=>this.syncPause(),{signal});
    this.syncPause();this.schedulePreload();
  }
  stop():void {
    this.active=false;this.pending=null;this.controller?.abort();this.controller=null;
    if(this.timer!==null)clearTimeout(this.timer);this.timer=null;
    this.cancelLoad?.();this.cancelLoad=null;this.surface.classList.add('showcase-paused');
  }
  setPaused(value:boolean):void {this.paused=value;this.syncPause();}
  private syncPause():void {
    const paused=!this.active||this.paused||document.hidden;
    this.surface.classList.toggle('showcase-paused',paused);
    if(paused&&this.timer!==null){clearTimeout(this.timer);this.timer=null;}
    if(!paused)this.schedulePreload();
  }
  get renderBrand():boolean {return this.active&&!this.paused&&!document.hidden&&(this.clock.current===0||this.brandFade>0);}
  update(dt:number):void {
    if(!this.active||this.paused||document.hidden)return;
    this.brandFade=Math.max(0,this.brandFade-dt*1000);
    const before=this.clock.current;
    if(this.clock.tick(dt*1000,this.ready)){this.brandFade=before===0?this.duration:0;this.paint();}
  }
  private get duration():number {return this.reduced.matches?160:HOME_SHOWCASE_TRANSITION_MS;}
  private select(index:number):void {
    this.pending=null;this.brandFade=this.clock.current===0&&index!==0?this.duration:0;this.clock.select(index);this.paint();
  }
  private paint():void {
    const current=this.clock.current;this.surface.dataset.showcase=String(current);
    this.layers.forEach((layer,i)=>{layer.classList.toggle('is-current',i===current);layer.setAttribute('aria-hidden',String(i!==current));});
    this.buttons.forEach((button,i)=>{button.setAttribute('aria-current',String(i===current));button.disabled=this.failed.has(i);});
    this.caption.textContent=current?`${String(current+1).padStart(2,'0')} / ${LABELS[current]}`:'';
  }
  private schedulePreload():void {
    if(!this.active||this.timer!==null||this.cancelLoad)return;
    this.timer=setTimeout(()=>{this.timer=null;if(document.hidden||this.paused){this.schedulePreload();return;}this.preload();},650);
  }
  private preload():void {
    if(!this.active||this.cancelLoad)return;
    const next=this.pending??this.ready.findIndex((ready,i)=>i>0&&!ready&&!this.failed.has(i));
    if(next<1)return;
    const img=this.images[next-1]!;
    let finished=false;
    const cleanup=()=>{clearTimeout(timeout);img.onload=null;img.onerror=null;this.cancelLoad=null;};
    const done=(ok:boolean)=>{if(finished)return;finished=true;cleanup();if(!this.active)return;
      if(ok)this.ready[next]=true;else this.failed.add(next);
      if(this.pending===next){this.pending=null;if(ok)this.select(next);}
      this.paint();this.schedulePreload();
    };
    const timeout=setTimeout(()=>done(false),8000);
    this.cancelLoad=()=>{finished=true;cleanup();img.removeAttribute('src');};
    img.onload=()=>{img.decode().then(()=>done(true),()=>done(false));};img.onerror=()=>done(false);
    img.src=BASE+`assets/home-showcase/${LABELS[next]!.toLowerCase()}.webp`;
  }
}
