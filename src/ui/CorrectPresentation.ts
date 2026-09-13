import {correctFrame} from './CorrectTimeline';
import {CUBIE_POSES,poseUrl,type CubiePose} from '../game/CorrectSceneVariants';
import './correct-variants.css';
export const CUBIE_IMAGE_URL=import.meta.env.BASE_URL+'assets/cubie/cubie-correct.png';
/** Official 2D asset presentation. No camera/physics/score ownership. */
export class CorrectPresentation {
  readonly hero:HTMLImageElement;
  readonly spin:HTMLDivElement;
  readonly light:HTMLDivElement;
  readonly anchor:HTMLDivElement;
  readonly shadow:HTMLDivElement;
  private layoutKey='';
  private readonly reduced=matchMedia('(prefers-reduced-motion: reduce)');
  constructor(root:HTMLElement){
    this.hero=document.createElement('img');this.hero.className='cubie-correct hidden';this.hero.alt='キュービー — Cubie';this.hero.width=168;this.hero.height=376;this.hero.draggable=false;
    this.anchor=document.createElement('div');this.anchor.className='cubie-anchor hidden';
    this.shadow=document.createElement('div');this.shadow.className='cubie-contact';this.shadow.setAttribute('aria-hidden','true');
    this.anchor.append(this.shadow,this.hero);
    this.spin=document.createElement('div');this.spin.className='correct-spin hidden';this.spin.setAttribute('aria-hidden','true');
    this.spin.innerHTML='<div class="correct-spin-frame"><span>i CUBE TEST</span><b>◇</b></div>';
    this.light=document.createElement('div');this.light.className='correct-light hidden';this.light.setAttribute('aria-hidden','true');
    root.append(this.anchor,this.spin,this.light);
  }
  preload():void {if(!this.hero.getAttribute('src'))this.setPose(CUBIE_POSES[0]);}
  setPose(pose:CubiePose):void {
    this.layoutKey='';
    this.hero.src=poseUrl(pose);this.hero.width=192;this.hero.height=358;this.hero.dataset.pose=pose.id;
    this.anchor.style.setProperty('--pose-scale',String(pose.scale));this.anchor.style.setProperty('--pose-x',`${pose.x}px`);this.anchor.style.setProperty('--pose-y',`${pose.y}px`);
    this.shadow.style.bottom=`${(1-pose.anchor)*100}%`;this.shadow.style.width=`${pose.shadow*100}%`;
    // Fetch/decode only the selected pose during the existing spin, not eight at startup.
    void this.hero.decode().catch(()=>{});
  }
  update(time:number):ReturnType<typeof correctFrame>{
    const frame=correctFrame(time,this.reduced.matches);
    this.spin.classList.toggle('hidden',!frame.spinVisible);this.spin.style.transform=`rotate(${frame.angle}deg)`;this.spin.dataset.angle=String(frame.angle);
    this.light.classList.toggle('hidden',frame.light===0);this.light.style.opacity=String(frame.light);
    this.anchor.classList.toggle('hidden',frame.entry===0);this.hero.classList.toggle('hidden',frame.entry===0);this.anchor.style.opacity=String(frame.entry);
    const idle=this.reduced.matches?0:Math.sin(Math.max(0,time-3.6)*1.4)*2;
    this.hero.style.transform=`translateY(${(1-frame.entry)*30+idle}px) scale(${.85+.15*frame.entry})`;
    const panel=this.anchor.parentElement?.querySelector<HTMLElement>('.result-panel .modal-card');
    const key=`${innerWidth}:${innerHeight}:${panel?.offsetHeight??0}`;
    if(key!==this.layoutKey){
      this.layoutKey=key;
      const clearance=panel&&!(innerHeight<500&&innerWidth>innerHeight)?innerHeight-panel.getBoundingClientRect().top+12:0;
      this.anchor.style.setProperty('--result-clearance',`${clearance}px`);
    }
    return frame;
  }
  reset():void {for(const e of [this.anchor,this.hero,this.spin,this.light])e.classList.add('hidden');this.spin.dataset.angle='0';this.light.style.opacity='0';}
}
