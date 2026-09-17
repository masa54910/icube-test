import {locale,t} from '../i18n';
import {tutorialCopy,tutorialMemoAnswer} from '../i18n/tutorial';
import type {Locale} from '../types';
import './spotlight-tutorial.css';

/** Existing game captures; Memo deliberately leaves the real control unobstructed. */
export const tutorialScenes=['explore','look-up','jump','climb',null,'solve'] as const;

const nav:Record<Locale,{next:string;back:string;skip:string}>={
 ja:{next:'次へ',back:'戻る',skip:'スキップ'},en:{next:'Next',back:'Back',skip:'Skip'},
 de:{next:'Weiter',back:'Zurück',skip:'Überspringen'},fr:{next:'Suivant',back:'Retour',skip:'Passer'},
 es:{next:'Siguiente',back:'Atrás',skip:'Omitir'},pt:{next:'Seguinte',back:'Voltar',skip:'Pular'},
 ko:{next:'다음',back:'이전',skip:'건너뛰기'},'zh-CN':{next:'下一步',back:'上一步',skip:'跳过'},'zh-TW':{next:'下一步',back:'上一步',skip:'略過'}
};
export function spotlightSteps(touch:boolean){
 const touchCopy=[t('how.touch.move'),t('how.touch.camera')+' '+t('how.touch.lookUp'),t('how.touch.jump'),t('how.touch.ladder')];
 if(locale()==='ja'){
  touchCopy[0]='左下の操作パッド（ジョイスティック）をドラッグして移動・旋回します。';
  touchCopy[2]='画面のジャンプボタンをタップしてジャンプします。';
  touchCopy[3]='梯子に近づき、左下の操作パッドを上へドラッグして登ります。下へドラッグすると降ります。左右ドラッグで横移動し、梯子の端では視点を旋回できます。';
 }
 const both=(pc:string,index:number)=>(locale()==='ja'?'キーボード操作':t('how.keyboard'))+'：'+pc+'\n\n'+t('how.touch.body')+'：'+touchCopy[index];
 return [
  {title:t('how.controls.movement'),body:both('WASD / ↑↓←→ — '+t('how.explore.body'),0),target:touch?'.touch-stick':'.control-hint'},
  {title:t('how.controls.camera'),body:both(tutorialCopy[locale()].mouse+' V — '+t('how.controls.switchView'),1),target:null},
  {title:t('how.controls.jump'),body:both('Space — '+t('how.controls.jump'),2),target:touch?'.touch-jump':'.control-hint'},
  {title:t('how.ladder.title'),body:both(t('how.ladder.body')+' W / ↑ — '+t('how.controls.up')+' · S / ↓ — '+t('how.controls.down')+'. '+t('how.controls.edge'),3)+(locale()==='ja'?'\n\nジャンプで飛び降りることができます。':''),target:touch?'.touch-stick':null},
  {title:'CUBE MEMO',body:tutorialCopy[locale()].memo,target:'.mini-memo'},
  {title:t('how.answer.title'),body:t('how.explore.body')+' '+t('how.answer.body')+' '+tutorialMemoAnswer[locale()],target:null}
 ];
}
export interface TutorialRect {x:number;y:number;width:number;height:number}
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(n,Math.max(min,max)));
/** Pure layout: prefer an adjacent bubble, then a contained fallback on small screens. */
export function placeTutorialBubble(target:TutorialRect,width:number,height:number,viewport:TutorialRect):{x:number;y:number}{
 const gap=16,points=[
  {x:target.x+(target.width-width)/2,y:target.y+target.height+gap},
  {x:target.x+(target.width-width)/2,y:target.y-height-gap},
  {x:target.x-width-gap,y:target.y+(target.height-height)/2},
  {x:target.x+target.width+gap,y:target.y+(target.height-height)/2}
 ].map(p=>({...p,x:clamp(p.x,viewport.x,viewport.x+viewport.width-width)}));
 const point=points.find(p=>p.x>=viewport.x&&p.y>=viewport.y&&p.x+width<=viewport.x+viewport.width&&p.y+height<=viewport.y+viewport.height)
  ??{x:viewport.x+(viewport.width-width)/2,y:target.y>viewport.y+viewport.height/2?viewport.y:viewport.y+viewport.height-height};
 return {x:clamp(point.x,viewport.x,viewport.x+viewport.width-width),y:clamp(point.y,viewport.y,viewport.y+viewport.height-height)};
}

export class SpotlightTutorial {
 readonly root=document.createElement('section');
 private hole=document.createElement('div');
 private card=document.createElement('div');
 private step=0;
 private complete:(()=>void)|null=null;
 private priorFocus:HTMLElement|null=null;
 private inert=new Map<HTMLElement,boolean>();
 private observer:ResizeObserver;
 private coarse=matchMedia('(pointer:coarse)');
 private rebuild=()=>{if(this.complete)this.render();};
 private reposition=()=>{if(this.complete)this.layout();};
 constructor(private host:HTMLElement){
  this.root.className='spotlight-tutorial hidden';this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');this.root.setAttribute('aria-labelledby','spotlight-title');
  this.hole.className='spotlight-hole';this.hole.setAttribute('aria-hidden','true');this.card.className='spotlight-card';this.card.tabIndex=-1;
  this.root.append(this.hole,this.card);host.append(this.root);
  this.root.addEventListener('keydown',e=>{
   e.stopPropagation();
   if(e.key==='Escape'){e.preventDefault();return;} // Only explicit Skip or final acknowledgement completes onboarding.
   if(e.key!=='Tab')return;
   const buttons=[...this.card.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')],first=buttons[0],last=buttons.at(-1);
   if(e.shiftKey&&(document.activeElement===first||document.activeElement===this.card)){e.preventDefault();last?.focus();}
   else if(!e.shiftKey&&(document.activeElement===last||document.activeElement===this.card)){e.preventDefault();first?.focus();}
  });
  this.observer=new ResizeObserver(this.reposition);
 }
 open(complete:()=>void):void {
  if(this.complete)return;
  this.complete=complete;this.step=0;this.priorFocus=document.activeElement as HTMLElement;
  for(const child of this.host.children){if(child instanceof HTMLElement&&child!==this.root){this.inert.set(child,child.inert);child.inert=true;}}
  this.root.classList.remove('hidden');this.observer.observe(this.root);
  for(const selector of ['.touch-stick','.touch-jump','.mini-memo','.control-hint']){const target=this.host.querySelector(selector);if(target)this.observer.observe(target);}
  window.addEventListener('resize',this.reposition);window.visualViewport?.addEventListener('resize',this.reposition);this.coarse.addEventListener('change',this.rebuild);
  this.render();
 }
 close():void {
  this.complete=null;this.root.classList.add('hidden');this.observer.disconnect();
  window.removeEventListener('resize',this.reposition);window.visualViewport?.removeEventListener('resize',this.reposition);this.coarse.removeEventListener('change',this.rebuild);
  for(const [element,inert]of this.inert)element.inert=inert;this.inert.clear();
  const focus=this.priorFocus?.isConnected&&!this.priorFocus.closest('.hidden')?this.priorFocus:this.host.querySelector<HTMLElement>('.tutorial-help-button');focus?.focus({preventScroll:true});
 }
 private render():void {
  const steps=spotlightSteps(this.coarse.matches),step=steps[this.step]!,labels=nav[locale()];
  this.card.replaceChildren();const count=document.createElement('small');count.textContent=`${this.step+1} / ${steps.length}`;
  const title=document.createElement('h2');title.id='spotlight-title';title.textContent=step.title;
  const copy=document.createElement('p');copy.textContent=step.body;copy.setAttribute('aria-live','polite');
  const actions=document.createElement('div');actions.className='spotlight-actions';
  const add=(text:string,action:()=>void,primary=false)=>{const b=document.createElement('button');b.type='button';b.textContent=text;if(primary)b.className='spotlight-next';b.onclick=action;actions.append(b);return b;};
  add(labels.skip,()=>this.complete?.());
  const back=add(labels.back,()=>{if(this.step>0){this.step--;this.render();}});back.disabled=this.step===0;
  add(this.step===steps.length-1?tutorialCopy[locale()].start:labels.next,()=>{if(this.step===steps.length-1)this.complete?.();else{this.step++;this.render();}},true);
  const content=document.createElement('div');content.className='spotlight-content';content.append(count,title);
  const scene=tutorialScenes[this.step];this.card.classList.toggle('has-scene',!!scene);
  if(scene){
   const img=document.createElement('img');img.className='spotlight-scene';img.alt=step.title;img.width=1200;img.height=900;img.draggable=false;img.decoding='async';
   img.onload=this.reposition;
   if(scene==='jump'||scene==='look-up')void import('./TutorialJumpStill').then(({jumpStill})=>{if(img.isConnected){const src=jumpStill(scene);if(src)img.src=src;}}).catch(()=>{});
   else img.src=import.meta.env.BASE_URL+'assets/home-showcase/'+scene+'.webp';
   content.append(img);
  }
  content.append(copy);this.card.append(content,actions);this.layout();this.card.focus({preventScroll:true});
 }
 private layout():void {
  const bounds=this.root.getBoundingClientRect(),css=getComputedStyle(this.root);
  const left=parseFloat(css.paddingLeft)||12,right=parseFloat(css.paddingRight)||12,top=parseFloat(css.paddingTop)||12,bottom=parseFloat(css.paddingBottom)||12;
  const safe={x:left,y:top,width:Math.max(0,bounds.width-left-right),height:Math.max(0,bounds.height-top-bottom)};
  const selector=spotlightSteps(this.coarse.matches)[this.step]!.target,target=selector?this.host.querySelector<HTMLElement>(selector):null;
  const rect=target?.getBoundingClientRect();
  const valid=rect&&rect.width>0&&rect.height>0&&!target?.closest('.hidden');
  this.hole.hidden=!valid;this.root.classList.toggle('without-spotlight',!valid);
  const region:TutorialRect=valid?{x:rect.left-bounds.left-7,y:rect.top-bounds.top-7,width:rect.width+14,height:rect.height+14}:{x:bounds.width*.36,y:bounds.height*.27,width:bounds.width*.28,height:bounds.height*.23};
  region.x=clamp(region.x,safe.x,safe.x+safe.width);region.y=clamp(region.y,safe.y,safe.y+safe.height);
  region.width=Math.max(0,Math.min(region.width,safe.x+safe.width-region.x));region.height=Math.max(0,Math.min(region.height,safe.y+safe.height-region.y));
  Object.assign(this.hole.style,{left:region.x+'px',top:region.y+'px',width:region.width+'px',height:region.height+'px'});
  this.card.style.width=Math.min(tutorialScenes[this.step]?620:390,safe.width)+'px';this.card.style.maxHeight=safe.height+'px';
  const size=this.card.getBoundingClientRect(),position=valid?placeTutorialBubble(region,size.width,size.height,safe):{x:safe.x+(safe.width-size.width)/2,y:safe.y+(safe.height-size.height)/2};
  this.card.style.left=position.x+'px';this.card.style.top=position.y+'px';
 }
}
