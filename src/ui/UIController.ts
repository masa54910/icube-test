import {drawRouteChoices} from './RouteAnswerPreview';
import {CubeMemoSystem} from '../game/CubeMemoSystem';
import {memoStageForRun} from '../game/MemoRun';
import {MiniMemoView} from './MiniMemoView';
import {AudioSettings} from './AudioSettings';
import type {AudioManager} from '../audio/AudioManager';
import {MemoConfirmation} from './MemoConfirmation';
import type {MemoCube} from '../game/CubeMemo';
import type { Locale, ShapeChoice, StageDefinition } from '../types';
import type { SaveData } from '../platform/PlayablesSDK';
import type { CameraMode } from '../game/CameraController';
import { normalizeVoxels } from '../stages/stage-utils';
import { HomePreview } from './HomePreview';
import { HomeShowcase } from './HomeShowcase';
import { HOME_COPY,homeIcon } from './HomeContent';
import { CUBIE_IMAGE_URL } from './CorrectPresentation';
import './home.css';
import './answer-feedback.css';
import './responsive-qa.css';
import {CubeMemoPanel} from './CubeMemoPanel';
import {createHowToMemo} from './HowToMemo';
import {t,LANGUAGE_NAMES,SUPPORTED_LOCALES,locale as currentLocale,setLocale as setI18nLocale} from '../i18n';
export interface UICallbacks {
  newGame():void;
  answerFromMemo():void;
  audioEvent?:(event:'MEMO_CUBE_COMMIT'|'ANSWER_SELECT',count?:number)=>void;
  confirmMemoAnswer():void; backMemoAnswer():void;
  startStage(id:number):void; continueGame():void; openStageSelect():void; openQuiz():void;
  submitAnswer(id:string):void; closeQuiz():void; retryStage():void; nextStage():void;
  backToTitle():void; setLookUp(active:boolean):void; toggleCamera():void; jump():void; openMemo():void;
}
const button=(label:string,className='secondary'):HTMLButtonElement=>{
  const item=document.createElement('button');item.type='button';item.className=className;item.textContent=label;return item;
};
export const formatTime=(ms:number):string=>{const s=Math.max(0,ms)/1000;return String(Math.floor(s/60)).padStart(2,'0')+':'+(s%60).toFixed(1).padStart(4,'0');};
export class UIController {
  private memoRun:unknown;
  setMemoRun(run:unknown):void {this.memoRun=run;}
  readonly preview:HomePreview;
  readonly showcase:HomeShowcase;
  readonly answerButton:HTMLButtonElement;
  readonly lookButton:HTMLButtonElement;
  readonly pauseOverlay:HTMLElement;
  private title:HTMLElement;
  private hud:HTMLElement;
  private modal:HTMLElement;
  private view='';
  private refreshStageSelect:(()=>void)|null=null;
  private selected:string|null=null;
  private choices:readonly ShapeChoice[]=[];
  private used=new Set<string>();
  private locale:Locale;
  private answerPromptKey='';
  private mini:MiniMemoView|null=null;
  private miniRevision=-1;
  private memoStage=false;
  private routeStage=false;
  private memoExpanded=false;
  private miniPaused=false;
  private memoSystem=new CubeMemoSystem();
  private memo:CubeMemoPanel|null=null;
  private audioSettings:AudioSettings|null=null;
  attachAudio(audio:AudioManager){this.audioSettings=new AudioSettings(audio);this.title.querySelector('.home-menu')!.append(this.audioSettings.root);}
  private memoConfirmation:MemoConfirmation|null=null;
  memoUsage(){return {hintUsed:this.memo?.data.hintUsed??false};}
  prepareTestQAMemo(stage:StageDefinition){if(!import.meta.env.DEV||stage.section!=='test')return;const store=this.memoSystem.get(stage);store.clear();store.addBatch(stage.memo!.canonicalCubes.map(([x,y,z])=>({x,y,z})));}
  constructor(readonly root:HTMLElement,readonly loading:HTMLElement,private cb:UICallbacks,locale:Locale) {
    this.locale=locale;
    this.title=document.createElement('section');this.title.className='home';
    this.title.innerHTML=`<aside class="home-menu"><header><h1>i CUBE <span>TEST</span></h1><p class="home-headline">${HOME_COPY.headline}</p><p class="home-supporting">${HOME_COPY.supporting}</p><p class="home-tagline">${HOME_COPY.tagline}</p></header><nav class="menu-list" aria-label="メインメニュー"></nav><small class="analytics-notice"></small><section class="progress-panel"><h3><span class="progress-emblem" aria-hidden="true">◇</span> PLAYER PROGRESS</h3><div class="progress-track" role="progressbar" aria-label="クリア済みステージ" aria-valuemin="0" aria-valuemax="31" aria-valuenow="0"><i></i></div><div class="progress-grid"><div><small>PROGRESS</small><strong data-progress>0 / 31</strong></div><div><small>NEXT STAGE</small><strong data-next-stage>1-1</strong></div><div><small>BEST TIME</small><strong data-best>—</strong></div><div><small>TOTAL TIME</small><strong data-total>—</strong></div></div></section></aside><section class="home-right"><section class="preview-panel"><div class="preview-surface"><canvas aria-label="白い惑星と宇宙、銀河、遠くの地球、浮遊する7 Cube Cross"></canvas><div class="home-world-label">${HOME_COPY.worldTagline}</div><div class="home-cubie"><img src="${CUBIE_IMAGE_URL}" width="168" height="376" alt="${HOME_COPY.cubieAlt}" draggable="false" decoding="async"></div><div class="home-world-signature"><span class="signature-cubes" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>i CUBE TEST<small>${HOME_COPY.worldTagline}</small></span></div></div></section><div class="home-game-flow-wrap"><img class="home-game-flow" src="/assets/home-game-flow.png" alt="i CUBE TEST gameplay flow: Explore, Memo, Solve, Cube Score" loading="lazy" draggable="false"></div></section>`;
    const rows:[string,string,string,()=>void][]=[
      ['new',t('home.newGame'),t('home.newGameSub'),()=>cb.newGame()],
      ['continue',t('home.continue'),t('home.continueSub'),()=>cb.continueGame()],
      ['stages',t('home.stageSelect'),t('home.stageSelectSub'),()=>cb.openStageSelect()],
      ['how',t('home.howToPlay'),t('home.howToPlaySub'),()=>this.showHowTo()],
    ];
    for(const [icon,name,sub,action] of rows) {
      const item=button('','menu-button');item.setAttribute('aria-label',name);
      item.innerHTML='<span class="menu-icon">'+homeIcon(icon)+'</span><span><strong>'+name+'</strong><small>'+sub+'</small></span><span class="menu-arrow" aria-hidden="true">›</span>';
      item.addEventListener('pointerdown',event=>{item.classList.add('is-pressed');item.setPointerCapture(event.pointerId);});
      for(const name of ['pointerup','pointercancel','lostpointercapture','blur'])item.addEventListener(name,()=>item.classList.remove('is-pressed'));
      item.onclick=action;this.title.querySelector('nav')!.append(item);
    }
    this.hud=document.createElement('section');this.hud.className='hud hidden';
    this.hud.innerHTML='<div class="hud-top"><div class="hud-chip"><b data-stage></b><span>TIME <strong data-time>00:00.0</strong></span></div><div class="hud-actions"></div></div><div class="control-hint">WASD / ↑↓←→ MOVE · DRAG TO LOOK · Q / R TURN · SPACE JUMP · V CAMERA · E / F ANSWER</div><div class="touch-stick" aria-hidden="true"><i></i><span>MOVE</span></div><div class="crosshair" aria-hidden="true">+</div>';
    const actions=this.hud.querySelector('.hud-actions')!;
    const camera=button('THIRD PERSON · V','camera-button');camera.dataset.camera='';camera.onclick=()=>cb.toggleCamera();
    this.lookButton=button('↑ LOOK UP','look-button');
    this.lookButton.onpointerdown=e=>{e.preventDefault();this.lookButton.setPointerCapture(e.pointerId);cb.setLookUp(true);};
    for(const name of ['pointerup','pointercancel','lostpointercapture'])this.lookButton.addEventListener(name,()=>cb.setLookUp(false));
    this.lookButton.onkeydown=e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();cb.setLookUp(true);}};
    this.lookButton.onkeyup=e=>{if(e.code==='Space'||e.code==='Enter')cb.setLookUp(false);};
    this.lookButton.onblur=()=>cb.setLookUp(false);
    const menu=button('MENU','hud-button');menu.dataset.menu='';menu.onclick=()=>cb.backToTitle();actions.append(camera,this.lookButton,menu);
    const jump=button('↑ JUMP','touch-jump');jump.onclick=()=>cb.jump();this.hud.append(jump);
    this.answerButton=button('','answer-button hidden');this.answerButton.onclick=()=>cb.openQuiz();this.hud.append(this.answerButton);this.updateAnswerPrompt();
    this.modal=document.createElement('section');this.mini?.show(false);if(this.mini)this.root.append(this.mini.root);this.modal.className='modal-layer hidden';
    this.pauseOverlay=document.createElement('section');this.pauseOverlay.className='pause-overlay hidden';this.pauseOverlay.innerHTML='<h2>PAUSED</h2><p>一時停止中</p>';
    const lang=document.createElement('select');lang.className='language-selector';lang.setAttribute('aria-label','Language');for(const l of SUPPORTED_LOCALES){const o=document.createElement('option');o.value=l;o.textContent=LANGUAGE_NAMES[l];lang.append(o);}lang.value=locale;lang.onchange=()=>{this.setLocale(lang.value as Locale);};this.title.querySelector('header')!.append(lang);
    root.append(this.title,this.hud,this.modal,this.pauseOverlay);
    new MutationObserver(()=>{if(this.view==='stage-select')this.refreshStageSelect?.();}).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
    this.preview=new HomePreview(this.title.querySelector('canvas')!);
    this.showcase=new HomeShowcase(this.title.querySelector('.preview-surface')!);
  }
  setLocale(locale:Locale):void {this.locale=locale;setI18nLocale(locale);document.documentElement.lang=locale; if(this.view==='how')this.showHowTo(); this.title.querySelector('.home-headline')!.textContent=t('home.mainCopy1');this.title.querySelector('.home-supporting')!.textContent=t('home.mainCopy2'); this.title.querySelectorAll('.menu-button:not(.test-primary-cta)').forEach((el,i)=>{const keys=[['home.newGame','home.newGameSub'],['home.continue','home.continueSub'],['home.stageSelect','home.stageSelectSub'],['home.howToPlay','home.howToPlaySub']][i];if(keys){el.setAttribute('aria-label',t(keys[0]!));const s=el.querySelectorAll('strong,small');s[0]!.textContent=t(keys[0]!);s[1]!.textContent=t(keys[1]!);}});const lang=this.title.querySelector('.language-selector') as HTMLSelectElement|null;if(lang)lang.value=locale;this.updateStaticLabels();this.memo?.refreshTexts();this.mini?.refreshTexts();}
  private updateStaticLabels():void {
    this.audioSettings?.refresh();
    const privacy=this.title.querySelector('.analytics-notice');if(privacy)privacy.textContent='Anonymous gameplay data may be collected to improve i CUBE TEST. No personal information is collected.';
    const heading=this.title.querySelector('.progress-panel h3')!;heading.lastChild!.textContent=' '+t('home.playerProgress');
    this.title.querySelectorAll('.progress-grid small').forEach((el,i)=>{el.textContent=t(['home.progress','home.nextStage','home.bestTime','home.totalTime'][i]!);});
    this.hud.querySelector('.control-hint')!.textContent='WASD / ↑↓←→ '+t('how.controls.movement')+' · SPACE '+t('how.controls.jump')+' · V '+t('how.controls.switchView');
  }
  hideLoading():void {this.loading.classList.add('hidden');}
  renderPreview(dt:number):void {this.updateMini();this.showcase.update(dt);if(this.showcase.renderBrand)this.preview.render(dt);}
  showTitle(completed:number,total:number,save?:SaveData):void {
    this.mini?.show(false);this.showcase.start();
    this.view='home';this.title.classList.remove('hidden');this.hud.classList.add('hidden');this.modal.classList.add('hidden');
    this.title.querySelector('[data-progress]')!.textContent=completed+' / '+total;
    (this.title.querySelector('.progress-track i') as HTMLElement).style.width=(completed/total*100)+'%';
    this.title.querySelector('.progress-track')!.setAttribute('aria-valuenow',String(completed));
    this.title.querySelector('.progress-track')!.setAttribute('aria-valuemax',String(total));
    if(save){this.title.querySelector('[data-next-stage]')!.textContent=(save.lastPlayed.startsWith('advanced-route1-')?'ROUTE 1 · 1-'+save.lastPlayed.slice('advanced-route1-'.length):save.lastPlayed.startsWith('advanced_route_')?'A-'+save.lastPlayed.slice('advanced_route_'.length):save.lastPlayed.replace('stage_','').replace('_','-'));
      const times=Object.values(save.bestTimesMs);this.title.querySelector('[data-best]')!.textContent=times.length?formatTime(Math.min(...times)):'—';
      this.title.querySelector('[data-total]')!.textContent=times.length?formatTime(times.reduce((a,b)=>a+b,0)):'—';}
  }
  private panel(title:string,className=''):HTMLElement {
    this.showcase.stop();
    this.modal.className='modal-layer '+className;this.modal.innerHTML='<div class="modal-card"><div class="panel-header"><h2>'+title+'</h2></div><div class="modal-body"></div></div>';
    this.hud.classList.add('hidden');return this.modal.querySelector('.modal-body')!;
  }
  showStageSelect(stages:readonly StageDefinition[],completed:readonly string[],selectedGroup=0):void {
    this.view='stage-select';const body=this.panel(t('stageSelect.title'),'stage-panel');
    const header=this.modal.querySelector('.panel-header')!,tools=document.createElement('div');tools.className='stage-header-tools';
    const lang=document.createElement('select');lang.className='stage-language';lang.setAttribute('aria-label','Language');
    for(const l of SUPPORTED_LOCALES){const option=document.createElement('option');option.value=l;option.textContent=LANGUAGE_NAMES[l];lang.append(option);}lang.value=currentLocale();
    lang.onchange=()=>this.setLocale(lang.value as Locale);
    const back=button(t('common.back'),'ghost');back.onclick=()=>this.cb.backToTitle();tools.append(lang,back);header.append(tools);
    this.refreshStageSelect=()=>{const scroll=body.scrollTop,focused=document.activeElement===lang;this.showStageSelect(stages,completed,selectedGroup);this.modal.querySelector('.modal-body')!.scrollTop=scroll;if(focused)(this.modal.querySelector('.stage-language') as HTMLElement).focus({preventScroll:true});};
    const standard=document.createElement('h3');standard.textContent=t('advanced.standard');body.append(standard);const tabs=document.createElement('div');tabs.className='filter-tabs';body.append(tabs);
    const list=document.createElement('div');list.className='stage-grid';body.append(list);
    const render=(group:number)=>{selectedGroup=group;list.replaceChildren();stages.filter(s=>s.section!=='advanced'&&(!group||s.group===group)).forEach(stage=>{
      const card=button('','stage-tile');const clear=completed.includes(stage.id);card.setAttribute('aria-label',t('game.stage')+' '+stage.displayName);
      card.innerHTML='<strong>'+t('game.stage')+' '+stage.displayName+'</strong><span class="badge">'+t(clear?'common.clear':'common.play')+'</span><small>'+t('stageSelect.'+['alphabet','digits','shapes'][stage.group-1])+'</small><span class="stage-stars">'+(clear?'★★★':'☆☆☆')+'</span>';
      card.onclick=()=>this.cb.startStage(stage.numericId);list.append(card);
    });};
    ['all','alphabet','digits','shapes'].forEach((name,index)=>{const b=button(t('stageSelect.'+name),'filter '+(index===selectedGroup?'active':''));b.onclick=()=>{tabs.querySelectorAll('button').forEach(e=>e.classList.remove('active'));b.classList.add('active');render(index);};tabs.append(b);});render(selectedGroup);const advanced=stages.filter(s=>s.section==='advanced');if(advanced.length){const heading=document.createElement('h3');heading.textContent=t('advanced.title');const description=document.createElement('p');description.textContent=t('advanced.select');const cards=document.createElement('div');cards.className='stage-grid advanced-stages';for(const stage of advanced){const card=button('','stage-tile');card.dataset.advanced=stage.id;const name=document.createElement('strong');name.textContent=stage.displayName+' · '+stage.subtitle;const badge=document.createElement('span');badge.className='badge';badge.textContent=completed.includes(stage.id)?t('common.clear'):'ROUTE';card.append(name,badge);card.onclick=()=>this.cb.startStage(stage.numericId);cards.append(card);}body.append(heading,description,cards);}
  }
  showHowTo():void {
    this.view='how';const body=this.panel(t('how.title'),'how-panel');
    const header=this.modal.querySelector('.panel-header')!;
    const lang=document.createElement('select');lang.className='how-language';lang.setAttribute('aria-label','Language');
    for(const l of SUPPORTED_LOCALES){const o=document.createElement('option');o.value=l;o.textContent=LANGUAGE_NAMES[l];lang.append(o);}lang.value=this.locale;
    lang.onchange=()=>{const scrollTop=body.scrollTop;this.setLocale(lang.value as Locale);this.modal.querySelector('.modal-body')!.scrollTop=scrollTop;(this.modal.querySelector('.how-language') as HTMLSelectElement).focus({preventScroll:true});};
    const back=button(t('how.back'),'ghost');back.onclick=()=>this.cb.backToTitle();header.append(lang,back);
    const grid=document.createElement('div');grid.className='how-steps';
    const keyRow=(keys:string[],label:string)=>{const row=document.createElement('div');row.className='how-key-row';const caps=document.createElement('span');caps.className='how-keycaps';for(const key of keys){const cap=document.createElement('kbd');cap.textContent=key;caps.append(cap);}const text=document.createElement('span');text.textContent=t('how.controls.'+label);row.append(caps,text);return row;};
    ['explore','controls','ladder','answer'].forEach((key,i)=>{
      const article=document.createElement('article');article.dataset.howSection=key;const visual=document.createElement('div');visual.className='how-step-visual';visual.setAttribute('aria-hidden','true');visual.textContent=['◇','⌨','☷','✣'][i]!;
      const title=document.createElement('h3');title.textContent=(i+1)+'. '+t('how.'+key+'.title');
      const copy=document.createElement('p');copy.textContent=t('how.'+key+'.body');
      article.append(visual,title,copy);
      if(key==='controls'){
        if(matchMedia('(pointer:coarse)').matches)copy.textContent=t('how.touch.body');
        const touch=document.createElement('section');touch.className='touch-help';
        for(const item of ['move','camera','jump','ladder','lookUp','answer']){const p=document.createElement('p');p.textContent=t('how.touch.'+item);touch.append(p);}article.append(touch);
        const keyboard=document.createElement('p');keyboard.className='how-desktop-note';keyboard.textContent=t('how.keyboard');article.append(keyboard);
        const columns=document.createElement('div');columns.className='how-control-columns';
        for(const group of ['movement','camera']){const column=document.createElement('section');const heading=document.createElement('h4');heading.textContent=t('how.controls.'+group);column.append(heading);
          const rows:[string[],string][]=group==='movement'?[[['W','↑'],'forward'],[['S','↓'],'backward'],[['A','←'],'turnLeft'],[['D','→'],'turnRight'],[['SPACE'],'jump']]:[[['V'],'switchView'],[['LOOK UP','Shift'],'lookUp']];
          for(const [keys,label]of rows)column.append(keyRow(keys,label));columns.append(column);
        }article.append(columns);
      }
      if(key==='ladder'){const list=document.createElement('div');list.className='how-ladder-keys';for(const [keys,label]of [[['W','↑'],'up'],[['S','↓'],'down'],[['A','←'],'left'],[['D','→'],'right']] as [string[],string][])list.append(keyRow(keys,label));const note=document.createElement('p');note.className='how-edge-note';note.textContent=t('how.controls.edge');article.append(list,note);}
      grid.append(article);
    });body.append(grid,createHowToMemo());const footer=document.createElement('div');footer.className='how-footer';const bottomBack=button(t('how.back'),'ghost');bottomBack.onclick=()=>this.cb.backToTitle();footer.append(bottomBack);body.append(footer);
  }
  showExploration(stage:StageDefinition,ms:number,canAnswer:boolean):void {
    stage=memoStageForRun(stage,this.memoRun);
    this.showcase.stop();
    this.routeStage=stage.stageType==='route';this.memoStage=stage.memo?.enabled===true;if(this.mini){this.root.append(this.mini.root);this.mini.root.classList.remove('mini-quiz');this.mini.root.disabled=false;}this.view='exploration';this.title.classList.add('hidden');this.modal.classList.add('hidden');this.hud.classList.remove('hidden');this.hud.querySelector('[data-stage]')!.textContent=t('game.stage')+' '+stage.displayName;const timeLabel=this.hud.querySelector('[data-time]')!.parentElement!;timeLabel.firstChild!.textContent=t('game.time')+' ';if(stage.memo?.enabled&&this.memo?.root.dataset.stage!==stage.id){this.memo?.dispose();this.memo=null;this.miniRevision=-1;this.memo=new CubeMemoPanel(stage,{close:()=>this.cb.openMemo(),language:l=>this.setLocale(l)},this.memoSystem.get(stage));this.root.append(this.memo.root);}if(this.memoStage&&!this.mini){this.mini=new MiniMemoView(()=>this.cb.openMemo());this.root.append(this.mini.root);}this.updateMini();this.updateExploration(ms,canAnswer);
  }
  openMemo():void {this.memoExpanded=true;this.mini?.show(false);if(this.memo){this.memo.onAnswer=()=>this.cb.answerFromMemo();this.memo.setPlacementListener(count=>this.cb.audioEvent?.('MEMO_CUBE_COMMIT',count));}this.memo?.open();}
  prepareMemoAnswer():readonly MemoCube[] {const cubes=this.memo?.prepareAnswer()??[];this.memoConfirmation??=new MemoConfirmation(()=>this.cb.confirmMemoAnswer(),()=>this.cb.backMemoAnswer());if(!this.memoConfirmation.root.isConnected)this.root.append(this.memoConfirmation.root);this.memoConfirmation.show(cubes);return cubes;}
  backMemoAnswer():void {this.memoConfirmation?.hide();this.openMemo();}
  lockMemoAnswer():void {this.memoConfirmation?.lock();}
  incorrectMemoAnswer():void {this.memoConfirmation?.incorrect();}
  finishMemoAnswer(failed=false):void {this.memoConfirmation?.hide();this.memoExpanded=false;this.mini?.show(false);const body=this.panel(t(failed?'answer.failed':'result.correct'),'quiz-panel');body.innerHTML='<p class="quiz-message" role="status"></p><div class="quiz-actions"></div>';if(failed){this.view='quiz';this.showFailed();}else this.showCorrect();}
  closeMemo():void {this.memoConfirmation?.hide();this.memoExpanded=false;this.memo?.hide();this.updateMini();}
  renderMemo():void {this.memo?.renderFrame();this.memoConfirmation?.refreshTexts();this.memoConfirmation?.render();}
  private updateMini():void {if(!this.mini)return;if(this.memo&&this.miniRevision!==this.memo.revision){this.miniRevision=this.memo.revision;const data=this.memo.data;this.mini.sync(data.cubes,data.hintUsed);}this.mini.show(this.memoStage&&!this.memoExpanded&&!this.miniPaused&&(this.view==='exploration'||this.view==='quiz'));this.mini.render();}
  unlockMemoHint():void {this.memo?.unlockHint();}
  private updateAnswerPrompt():void {
    const touch=matchMedia('(pointer:coarse)').matches;
    const text=t(touch?'game.answerTouch':'game.answerPrompt',{key:'\uE000'});
    if(text===this.answerPromptKey)return;this.answerPromptKey=text;
    this.answerButton.replaceChildren();this.answerButton.setAttribute('aria-label',text.replace('\uE000','E'));
    const parts=text.split('\uE000');parts.forEach((part,i)=>{if(i){const key=document.createElement('kbd');key.textContent='E';this.answerButton.append(key);}this.answerButton.append(document.createTextNode(part));});
  }
  updateExploration(ms:number,canAnswer:boolean):void {this.updateAnswerPrompt();this.hud.querySelector('[data-time]')!.textContent=formatTime(ms);this.answerButton.classList.toggle('hidden',!canAnswer);}
  updateCamera(mode:CameraMode):void {const touch=matchMedia('(pointer:coarse)').matches;this.hud.querySelector('[data-camera]')!.textContent=(mode==='pov'?'POV':t('game.thirdPerson'))+(touch?'':' · V');this.lookButton.textContent='↑ '+t('game.lookUp');this.hud.querySelector('[data-menu]')!.textContent=t('game.menu');this.hud.querySelector('.touch-jump')!.textContent='↑ '+t('game.jump');this.hud.querySelector('.touch-stick span')!.textContent=t('game.move');this.hud.classList.toggle('pov',mode==='pov');}
  showQuiz(choices:readonly ShapeChoice[],remaining:number,used:readonly string[]=[]):void {
    this.view='quiz';this.choices=choices;this.used=new Set(used);this.selected=null;
    const body=this.panel(t('answer.title'),'quiz-panel');if(this.memoStage&&this.mini){this.mini.root.classList.add('mini-quiz');this.mini.root.disabled=true;this.modal.querySelector('.panel-header')!.append(this.mini.root);this.updateMini();}
    body.innerHTML='<p class="chance-label">'+t('answer.remainingAttempts')+': <b>'+remaining+' / 2</b></p><p class="quiz-message" role="status"></p><div class="choice-grid"></div><div class="quiz-actions"></div>';
    const grid=body.querySelector('.choice-grid')!;
    for(const [index,choice] of choices.entries()) {
      const card=button('','choice-card');card.dataset.choiceId=choice.id;card.setAttribute('aria-label','Choice '+(index+1));
      const label=document.createElement('span');label.textContent=String(index+1);label.className='choice-number';
      const canvas=document.createElement('canvas');canvas.width=300;canvas.height=200;drawShape(canvas,choice.voxels);card.append(label,canvas);card.disabled=this.used.has(choice.id);card.classList.toggle('wrong',card.disabled);
      card.onclick=()=>{if(this.selected!==choice.id)this.cb.audioEvent?.('ANSWER_SELECT');this.selected=choice.id;grid.querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b===card));(body.querySelector('[data-submit]') as HTMLButtonElement).disabled=false;};grid.append(card);
    }
    if(this.routeStage)drawRouteChoices(choices,[...grid.querySelectorAll('canvas')]);
    const submit=button(t('answer.submit'),'primary');submit.dataset.submit='';submit.disabled=true;submit.onclick=()=>{if(this.selected)this.cb.submitAnswer(this.selected);};
    const back=button(t('answer.backToExploration'));back.onclick=()=>this.cb.closeQuiz();body.querySelector('.quiz-actions')!.append(submit,back);
  }
  showIncorrect(id:string,remaining:number):void {
    this.used.add(id);this.showQuiz(this.choices,remaining,[...this.used]);this.modal.querySelector('.quiz-message')!.textContent=t('answer.incorrect');
    this.modal.querySelectorAll<HTMLButtonElement>('.choice-card').forEach(card=>{if(card.dataset.choiceId===id)card.classList.add('just-incorrect');});
  }
  showFailed():void {
    this.modal.querySelector('.quiz-message')!.textContent=t('answer.failed');
    this.modal.querySelectorAll('.choice-card').forEach(e=>(e as HTMLButtonElement).disabled=true);
    const actions=this.modal.querySelector('.quiz-actions')!;actions.replaceChildren();
    const retry=button(t('result.retry'),'primary');retry.onclick=()=>this.cb.retryStage();const select=button(t('result.stageSelect'));select.onclick=()=>this.cb.openStageSelect();actions.append(retry,select);
  }
  showCorrect():void {this.view='correct';this.mini?.show(false);
    this.modal.querySelector('.quiz-message')!.textContent=t('result.correct');
    this.modal.querySelectorAll('button').forEach(e=>e.disabled=true);
    this.modal.querySelectorAll('.choice-card').forEach(e=>e.classList.add((e as HTMLElement).dataset.choiceId===this.selected?'correct':'dim'));
  }
  hideQuizForReveal():void {this.view='reveal';this.mini?.show(false);this.modal.classList.add('hidden');}
  showTestCorrectResult(question:number,next:()=>void):void {
    this.view='result';const body=this.panel(t('result.correct'),'result-panel');
    const label=document.createElement('h3');label.textContent=t('test.question',{n:question+1});
    const actions=document.createElement('div');actions.className='result-actions';
    const advance=button(t(question===4?'test.seeResults':'test.next'),'primary');
    advance.onclick=()=>{if(advance.disabled)return;advance.disabled=true;next();};
    actions.append(advance);body.append(label,actions);
  }
  showResult(stage:StageDefinition,ms:number,attempts:number,complete:boolean):void {
    this.view='result';const body=this.panel(t(complete?'result.allClear':'result.correct'),'result-panel');
    body.innerHTML='<h3>'+t('result.stageClear',{stage:stage.displayName})+'</h3><p>'+t('game.time')+' '+formatTime(ms)+' · '+t('result.attempts')+' '+attempts+'</p><div class="result-actions"></div>';
    const actions=body.querySelector('.result-actions')!;
    if(!complete){const next=button(t('result.nextStage'),'primary');next.onclick=()=>this.cb.nextStage();actions.append(next);}
    const retry=button(t('result.retry'));retry.onclick=()=>this.cb.retryStage();const select=button(t('result.stageSelect'));select.onclick=()=>this.cb.openStageSelect();actions.append(retry,select);
  }
  showPause(paused:boolean):void {this.miniPaused=paused;this.updateMini();this.showcase.setPaused(paused);this.pauseOverlay.querySelector('h2')!.textContent=t('common.paused');this.pauseOverlay.querySelector('p')!.textContent='';this.pauseOverlay.classList.toggle('hidden',!paused);}
  get currentView():string {return this.view;}
}
function drawShape(canvas:HTMLCanvasElement,voxels:ShapeChoice['voxels']):void {
  const ctx=canvas.getContext('2d');if(!ctx)return;
  const cells=normalizeVoxels(voxels);
  const p=(x:number,y:number,z:number):[number,number]=>[(x-z)*.866,-y+(x+z)*.5];
  const all=cells.flatMap(([x,y,z])=>[p(x,y,z),p(x+1,y+1,z+1),p(x+1,y,z),p(x,y+1,z+1)]);
  const minX=Math.min(...all.map(p=>p[0])),maxX=Math.max(...all.map(p=>p[0])),minY=Math.min(...all.map(p=>p[1])),maxY=Math.max(...all.map(p=>p[1]));
  const scale=Math.min(240/(maxX-minX),158/(maxY-minY));
  const project=(x:number,y:number,z:number)=>{const q=p(x,y,z);return [(q[0]-(minX+maxX)/2)*scale+150,(q[1]-(minY+maxY)/2)*scale+102] as const;};
  cells.sort((a,b)=>a[0]+a[1]+a[2]-b[0]-b[1]-b[2]).forEach(([x,y,z])=>{
    const faces=[{c:'#ffffff',p:[[x,y+1,z],[x+1,y+1,z],[x+1,y+1,z+1],[x,y+1,z+1]]},{c:'#bac6d3',p:[[x+1,y+1,z],[x+1,y,z],[x+1,y,z+1],[x+1,y+1,z+1]]},{c:'#e2e8ef',p:[[x,y+1,z+1],[x+1,y+1,z+1],[x+1,y,z+1],[x,y,z+1]]}];
    faces.forEach(face=>{ctx.beginPath();face.p.forEach((q,i)=>{const pt=project(q[0]!,q[1]!,q[2]!);if(i===0)ctx.moveTo(...pt);else ctx.lineTo(...pt);});ctx.closePath();ctx.fillStyle=face.c;ctx.fill();ctx.strokeStyle='#8796a7';ctx.lineWidth=.8;ctx.stroke();});
  });
}
