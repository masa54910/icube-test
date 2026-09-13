import {CubeMemoStore,MEMO_COLORS} from '../game/CubeMemo';
import type {StageDefinition,Locale} from '../types';
import {t,locale,LANGUAGE_NAMES,SUPPORTED_LOCALES} from '../i18n';
import {MemoViewport,type MemoDisplay} from './MemoViewport';
import './cube-memo.css';
export interface MemoCallbacks{close():void;language(locale:Locale):void}
export class CubeMemoPanel {
 onAnswer=()=>{};
 setPlacementListener(listener:(count:number)=>void){this.store.onPlacement=listener;}
 revision=0;
 get data(){return {cubes:this.store.cubes,hintUsed:this.store.hintUsed};}
 readonly root=document.createElement('section');
 private store:CubeMemoStore;
 private viewport:MemoViewport|null=null;
 private abort:AbortController|null=null;
 private previousFocus:HTMLElement|null=null;
 private host:HTMLElement;
 private stock:HTMLButtonElement;
 private active=false;
 constructor(stage:StageDefinition,private cb:MemoCallbacks,store:CubeMemoStore){
  this.store=store;
  this.root.className='cube-memo hidden';this.root.dataset.stage=stage.id;this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');this.root.setAttribute('aria-labelledby','memo-title');
  this.root.innerHTML=`<header class="memo-header"><div class="memo-brand"><svg class="memo-logo" aria-hidden="true" viewBox="0 0 48 52" width="44" height="48"><path d="M24 2 45 14 45 38 24 50 3 38 3 14Z" fill="#e7faff" stroke="#049ddb" stroke-width="2"/><path d="m3 14 21 12 21-12M24 26v24" fill="none" stroke="#049ddb" stroke-width="2"/><path d="M25 28 43 18v19L25 47Z" fill="#4acded"/></svg><h2 id="memo-title">CUBE MEMO</h2><p data-memo-text="subtitle"></p></div><div class="memo-header-end"><select class="memo-language" aria-label="Language"></select><button data-action="close" class="memo-close">×</button></div></header>
  <div class="memo-layout"><aside class="memo-stock memo-panel"><h3 data-memo-text="stock.title"></h3><button class="memo-stock-cube" data-memo-label="stock.drag"></button><p class="memo-stock-instructions" data-memo-text="stock.instructions"></p><div class="memo-mode"><button data-action="single" data-memo-text="place.single"></button><button data-action="continuous" data-memo-text="place.continuous"></button></div><div class="memo-plus"><button data-action="plus3">＋ 3</button><button data-action="plus5">＋ 5</button></div><div class="memo-palette"><h3 data-memo-text="color.title"></h3><div class="memo-swatches"></div><small data-memo-text="color.note"></small></div></aside>
  <main class="memo-canvas" data-memo-label="workspace"><p class="memo-intro" data-memo-text="intro"></p><span class="memo-grid-label">GRID 1 × 1 × 1</span><span class="memo-count"></span></main>
  <aside class="memo-edit memo-panel"><div class="memo-tools"></div><fieldset><legend data-memo-text="display.title"></legend><div class="memo-display"></div></fieldset><section class="memo-help"><h3 data-memo-text="help.title"></h3><p data-memo-text="help.drag"></p><p data-memo-text="controls.extend"></p><p data-memo-text="help.orbit"></p><p data-memo-text="help.zoom"></p><p data-memo-text="help.select"></p></section></aside></div>
  <footer class="memo-footer"><div class="memo-hint-info"><h3><span aria-hidden="true">☀ </span><span data-memo-text="hint.title"></span></h3><p data-memo-text="hint.body"></p></div><button data-action="hint" class="memo-hint"></button><button data-action="close" class="memo-primary" data-memo-text="close"></button></footer>`;
  const answer=document.createElement('button');answer.dataset.action='answer';answer.dataset.memoText='answer';answer.className='memo-primary memo-answer';const close=this.root.querySelector('.memo-footer [data-action="close"]')!;close.classList.remove('memo-primary');close.before(answer);
  this.host=this.root.querySelector('.memo-canvas')!;this.stock=this.root.querySelector('.memo-stock-cube')!;
  const lang=this.root.querySelector('select')!;for(const l of SUPPORTED_LOCALES){const o=document.createElement('option');o.value=l;o.textContent=LANGUAGE_NAMES[l];lang.append(o);}lang.onchange=()=>{cb.language(lang.value as Locale);this.refreshTexts();};
  for(const [action,key,icon,shortcut] of [['reset','camera.reset','↻',''],['undo','undo','↶','Ctrl + Z'],['redo','redo','↷','Ctrl + Y'],['delete','delete','⌫','Del'],['clear','deleteAll','▱','']]){
   const b=document.createElement('button');b.dataset.action=action;b.innerHTML='<span aria-hidden="true">'+icon+'</span><span data-memo-text="'+key+'"></span>'+(shortcut?'<kbd>'+shortcut+'</kbd>':'');this.root.querySelector('.memo-tools')!.append(b);
  }
  for(const [mode,key] of [['normal','normal'],['wire','wireframe'],['hide','hideColors']]){const b=document.createElement('button');b.dataset.display=mode;b.dataset.memoText='display.'+key;this.root.querySelector('.memo-display')!.append(b);}
  for(const color of MEMO_COLORS){const b=document.createElement('button');b.className='memo-swatch '+color;b.dataset.color=color;b.dataset.memoLabel=color;this.root.querySelector('.memo-swatches')!.append(b);}
  this.root.addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLButtonElement>('button');if(!b||b.disabled)return;
   if(!this.active)return;if(b.dataset.action==='answer'){this.onAnswer();return;}if(b.dataset.action==='close'){this.close();return;}if(!this.viewport)return;
   if(b.dataset.color){const c=MEMO_COLORS.find(c=>c===b.dataset.color)!;this.viewport.color=c;this.store.color(this.viewport.selected,c);}
   if(b.dataset.display)this.viewport.display=b.dataset.display as MemoDisplay;
   switch(b.dataset.action){case 'single':this.viewport.continuous=false;break;case 'continuous':this.viewport.continuous=true;break;case 'plus3':this.viewport.addLine(3);break;case 'plus5':this.viewport.addLine(5);break;case 'reset':this.viewport.reset();break;case 'undo':this.store.undoOnce();break;case 'redo':this.store.redoOnce();break;case 'delete':this.store.remove(this.viewport.selected);break;case 'clear':this.store.clear();break;case 'hint':this.store.useHint();break;}
   this.viewport.sync();this.updateState();
  });
  this.refreshTexts();
 }
 open(){if(this.active)return;this.active=true;this.previousFocus=document.activeElement as HTMLElement;this.root.classList.remove('hidden');
  try{this.viewport??=new MemoViewport(this.host,this.stock,this.store,()=>this.updateState());this.viewport.setActive(true);}catch(error){console.warn('Memo renderer unavailable',error);const p=document.createElement('p');p.className='memo-error';p.textContent=t('memo.error');this.host.append(p);}
  this.abort=new AbortController();this.root.addEventListener('keydown',e=>{
   if(e.key==='Escape'){e.preventDefault();e.stopPropagation();this.close();return;}
   if(e.target instanceof HTMLSelectElement)return;
   if(e.key==='Tab'){const buttons=[...this.root.querySelectorAll<HTMLElement>('button:not(:disabled),select')].filter(el=>el.getClientRects().length);const first=buttons[0],last=buttons.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}return;}
   if((e.ctrlKey||e.metaKey)&&['z','y'].includes(e.key.toLowerCase())){e.preventDefault();e.stopPropagation();if(e.key.toLowerCase()==='y'||e.shiftKey)this.store.redoOnce();else this.store.undoOnce();this.viewport?.sync();this.updateState();}
   else if(['Delete','Backspace'].includes(e.key)){e.preventDefault();if(this.viewport)this.store.remove(this.viewport.selected);this.viewport?.sync();this.updateState();}
  },{signal:this.abort.signal});this.refreshTexts();this.root.querySelector<HTMLButtonElement>('.memo-close')!.focus();
 }
 hide(){this.active=false;this.abort?.abort();this.abort=null;this.viewport?.setActive(false);this.root.classList.add('hidden');if(this.previousFocus?.isConnected)this.previousFocus.focus();}
 close(){this.hide();this.cb.close();}
 prepareAnswer(){this.viewport?.cancel();this.store.flush();this.hide();return structuredClone(this.store.cubes);}
 renderFrame(){this.viewport?.render();}
 unlockHint(){this.store.unlockHint();this.updateState();}
 refreshTexts(){this.root.querySelectorAll<HTMLElement>('[data-memo-text]').forEach(e=>e.textContent=t('memo.'+e.dataset.memoText));this.root.querySelectorAll<HTMLElement>('[data-memo-label]').forEach(e=>e.setAttribute('aria-label',t('memo.'+e.dataset.memoLabel)));this.root.querySelector('.memo-close')!.setAttribute('aria-label',t('memo.close'));this.root.querySelector('select')!.value=locale();this.updateState();}
 private updateState(){
  this.revision++;
  const button=(action:string)=>this.root.querySelector<HTMLButtonElement>('[data-action="'+action+'"]')!;
  button('undo').disabled=!this.store.canUndo;button('redo').disabled=!this.store.canRedo;button('clear').disabled=this.store.cubes.length<2;button('delete').disabled=!this.viewport||this.viewport.selected==='origin'||!this.store.cubes.some(c=>c.id===this.viewport!.selected);
  button('hint').disabled=!this.store.hintUnlocked||this.store.hintExhausted;button('hint').textContent=(!this.store.hintUnlocked?'🔒 ':'✧ ')+t('memo.hint.'+(this.store.hintExhausted?'used':this.store.hintUnlocked?'available':'locked'));
  this.root.querySelector('.memo-count')!.textContent=String(this.store.cubes.length)+' / 256';
  for(const mode of ['single','continuous']){const active=(mode==='continuous')===(this.viewport?.continuous??false);button(mode).classList.toggle('active',active);button(mode).setAttribute('aria-pressed',String(active));}
  this.root.querySelectorAll<HTMLButtonElement>('[data-display]').forEach(b=>{const active=b.dataset.display===(this.viewport?.display??'normal');b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
  this.root.querySelectorAll<HTMLButtonElement>('[data-color]').forEach(b=>{const active=b.dataset.color===(this.viewport?.color??'white');b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active));});
 }
 dispose(){this.hide();this.viewport?.dispose();this.root.remove();}
}
