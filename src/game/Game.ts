import * as THREE from 'three';
import {TestSession,type TestSave} from '../test-mode/TestSession';
import {TEST_STAGES,testStagesForRevision} from '../test-mode/test-stages';
import {testChoices} from '../test-mode/test-choices';
import {TestUI} from '../test-mode/TestUI';
import {AudioManager} from '../audio/AudioManager';
import {qaAudioManifest} from '../audio/qaManifest';
import {compareMemoToCanonical,type MemoPoint} from './MemoComparator';
import { STAGES } from '../stages/stage-data';
import {ALL_STAGES,catalogStage} from '../stages/catalog';
import {stageWithAutoBoostPads} from '../stages/boost-corridors';
import { buildChoices,shuffle } from '../stages/stage-utils';
import { GameState,StateMachine } from './GameState';
import { PlayerController } from './PlayerController';
import {BoostPads} from './BoostPads';
import { InputController } from './InputController';
import { CameraController } from './CameraController';
import { Character } from './Character';
import {GameplayVisuals} from './GameplayVisuals';
import type {CharacterVisualAdapter} from './CharacterVisualAdapter';
import { CelebrationScene } from './CelebrationScene';
import { WorldBuilder } from './WorldBuilder';
import { PlayablesSDK } from '../platform/PlayablesSDK';
import { UIController } from '../ui/UIController';
import { CorrectPresentation } from '../ui/CorrectPresentation';
import {loadLocale} from '../i18n/languageStore';
import {WorldFeedback} from './WorldFeedback';
import {CharacterVisibility} from './CharacterVisibility';
import {fitCelestialToSky} from './CelestialLayout';
import {CorrectSceneVariantService,BACKGROUND_PRESETS,type BackgroundPreset} from './CorrectSceneVariants';
import type { ShapeChoice,StageDefinition } from '../types';
import {AnalyticsManager} from '../analytics/AnalyticsManager';
export class Game {
  readonly state=new StateMachine();
  readonly platform=new PlayablesSDK();
  readonly audio=new AudioManager(qaAudioManifest());
  readonly scene=new THREE.Scene();
  readonly camera=new THREE.PerspectiveCamera(70,1,.05,250);
  readonly renderer:THREE.WebGLRenderer;
  readonly world=new WorldBuilder();
  readonly player=new PlayerController();
  readonly boosts=new BoostPads();
  readonly input:InputController;
  readonly cameraController:CameraController;
  readonly character=new Character();
  readonly characterVisual:CharacterVisualAdapter=this.character;
  readonly visuals:GameplayVisuals;
  readonly feedback=new WorldFeedback();
  private readonly characterVisibility=new CharacterVisibility();
  private readonly variants=new CorrectSceneVariantService();
  private backgroundPreset:BackgroundPreset=BACKGROUND_PRESETS[0];
  private readonly reducedMotion=matchMedia('(prefers-reduced-motion: reduce)');
  private idleSeconds=0;
  readonly ui:UIController;
  private stage:StageDefinition|null=null;
  private overview:THREE.Group|null=null;
  private elapsed=0;
  private memoOpen=false;
  private submittedMemo:readonly MemoPoint[]|null=null;
  private memoIncorrectRemaining=0;
  private attempts=0;
  private choices:ShapeChoice[]=[];
  private used=new Set<string>();
  private lastFrame=0;
  private revealTime=0;
  private readonly lookUpSources=new Set<'button'|'shift'>();
  private requestLookUp(source:'button'|'shift',active:boolean):void {
    if(active&&!this.memoOpen&&this.state.state===GameState.Exploration&&!this.platform.paused)this.lookUpSources.add(source);else this.lookUpSources.delete(source);
    this.cameraController.setLookUp(this.lookUpSources.size>0);
  }
  private clearLookUp():void {this.lookUpSources.clear();this.cameraController.setLookUp(false);}
  readonly correctPresentation:CorrectPresentation;
  private testSession=new TestSession(undefined,data=>{Object.assign(this.platform.save,{cubeTest:data});void this.platform.persist();});
  private readonly testUI:TestUI;
  private testActive=false;
  private testIntro=false;
  private testPaused=false;
  private testSaveClock=0;
  private gameStarted=false;
  private analyticsHintTracked=false;
  readonly analytics=new AnalyticsManager(()=>loadLocale());
  constructor(canvas:HTMLCanvasElement,root:HTMLElement,loading:HTMLElement) {
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.setClearColor(0xe9eff6);
    this.input=new InputController(canvas);this.cameraController=new CameraController(this.camera);
    this.ui=new UIController(root,loading,{
      audioEvent:(event,count)=>this.audio.emit(event,{count}),
      newGame:()=>{this.platform.save.memoRunId=crypto.randomUUID();this.startStage(1);},
      startStage:id=>this.startStage(id),continueGame:()=>this.startStage(ALL_STAGES.find(s=>s.id===this.platform.save.lastPlayed)?.numericId??1),
      openStageSelect:()=>this.openStageSelect(),openQuiz:()=>this.openQuiz(),submitAnswer:id=>this.submitAnswer(id),
      closeQuiz:()=>this.closeQuiz(),retryStage:()=>{if(this.stage){if(this.testActive)this.testSession.restart();this.startStage(this.stage.numericId);}},
      nextStage:()=>{if(this.stage)this.startStage((ALL_STAGES.filter(s=>s.section===this.stage!.section).find(s=>s.numericId>this.stage!.numericId)??this.stage).numericId);},
      backToTitle:()=>this.testActive?this.pauseTest():this.backToTitle(),setLookUp:active=>this.requestLookUp('button',active),
      toggleCamera:()=>this.toggleCamera(),jump:()=>this.input.jump(),openMemo:()=>this.toggleMemo(),answerFromMemo:()=>this.requestAnswer('cube-memo'),confirmMemoAnswer:()=>this.confirmMemoAnswer(),backMemoAnswer:()=>this.backMemoAnswer()
    },this.platform.locale);
    this.testUI=new TestUI(root,()=>this.testSession,fresh=>this.startTest(fresh),()=>this.backToTitle(),()=>({standard:this.platform.save.completed.filter(id=>STAGES.some(s=>s.id===id)).length,advanced:this.platform.save.completed.filter(id=>ALL_STAGES.some(s=>s.section==='advanced'&&s.id===id)).length}),value=>this.ui.setLocale(value));
    window.addEventListener('pagehide',()=>this.saveTest());
    this.ui.attachAudio(this.audio);this.audio.initialize();
    this.player.onJump=()=>this.audio.emit('JUMP_START');
    this.character.onAudioContact=kind=>{if(this.state.state!==GameState.Exploration||this.memoOpen||this.player.airborne||this.player.exitingLadderTop)return;this.audio.emit(kind==='step'?'JOG_CONTACT':'LADDER_CONTACT',{strength:this.boosts.boosting?.4:1});};
    this.boosts.onStart=()=>this.audio.emit('BOOST_START');this.boosts.onEnd=()=>this.audio.stopSE('boost');
    this.feedback.onEvent=event=>{if(event==='land')this.audio.emit('FOOT_CONTACT',{strength:this.character.landingImpact});};
    this.correctPresentation=new CorrectPresentation(root);
    this.input.onInteract=()=>this.openQuiz();this.input.onToggleCamera=()=>this.toggleCamera();
    this.input.onLookUp=active=>this.requestLookUp('shift',active);
    this.character.root.visible=false;this.scene.add(this.character.root,this.feedback.root);
    this.scene.add(new THREE.HemisphereLight(0xffffff,0xa9b9cb,2.5));
    const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(4,9,6);this.scene.add(light);
    this.visuals=new GameplayVisuals(this.renderer,this.scene,this.character.root);
    window.addEventListener('resize',()=>this.resize());window.addEventListener('blur',()=>this.clearLookUp());this.resize();
    document.addEventListener('visibilitychange',()=>{
      if(document.hidden){this.clearLookUp();this.saveTest();}
      this.input.setEnabled(!document.hidden&&!this.memoOpen&&!this.testPaused&&!this.testIntro&&!this.platform.paused&&this.state.state===GameState.Exploration);
      this.ui.showPause(document.hidden||this.platform.paused);this.lastFrame=performance.now();
    });
  }
  async init():Promise<void> {
    this.state.transition(GameState.Loading);
    await this.platform.initialize(()=>{this.audio.pause('sdk');this.input.setEnabled(false);this.clearLookUp();this.ui.showPause(true);},
      ()=>{this.audio.resume('sdk');this.ui.showPause(false);this.input.setEnabled(!this.memoOpen&&!this.testPaused&&!this.testIntro&&this.state.state===GameState.Exploration);this.lastFrame=performance.now();},enabled=>this.audio.setHostEnabled(enabled));
    this.audio.setHostEnabled(this.platform.audioEnabled);
    const qa=import.meta.env.DEV&&new URLSearchParams(location.search).has('testQA');
    let savedTest=(this.platform.save as typeof this.platform.save&{cubeTest?:TestSave}).cubeTest;
    if(qa){try{savedTest=JSON.parse(localStorage.getItem('icube-test-qa-session')??'null')??undefined;}catch{savedTest=undefined;}}
    this.testSession=new TestSession(savedTest,data=>{if(qa){localStorage.setItem('icube-test-qa-session',JSON.stringify(data));return;}Object.assign(this.platform.save,{cubeTest:data});void this.platform.persist();});
    if(qa)this.attachTestQA();
    this.ui.setLocale(loadLocale());this.ui.hideLoading();this.state.transition(GameState.Title);this.showHome();
    this.analytics.startSession();
    this.renderer.render(this.scene,this.camera);this.ui.renderPreview(0);this.platform.markFirstFrame();this.platform.markReady();
    this.lastFrame=performance.now();requestAnimationFrame(time=>this.frame(time));
  }
  private frame(time:number):void {
    const wallDelta=Math.max(0,time-this.lastFrame);const dt=Math.min(.05,wallDelta/1000);this.lastFrame=time;
    if(!this.platform.paused&&!document.hidden&&!this.testPaused) {
      if(this.testActive&&!this.testIntro){const phase=this.memoIncorrectRemaining>0?'excluded':this.memoOpen?(this.state.state===GameState.MemoConfirm?'answer':'memo'):this.state.state===GameState.Exploration?'gameplay':this.state.state===GameState.Quiz?'answer':'excluded';this.testSession.tick(wallDelta,phase);this.testSaveClock+=dt;if(this.testSaveClock>=2){this.testSaveClock=0;this.saveTest();}this.testUI.question(this.testSession.run!.currentQuestion,this.testSession.run!.current.effectiveSolveTime);}
      this.analytics.tick(wallDelta,this.state.state===GameState.Exploration||this.memoOpen||this.state.state===GameState.Quiz);
      if(this.memoOpen){if(this.memoIncorrectRemaining>0){this.memoIncorrectRemaining=Math.max(0,this.memoIncorrectRemaining-dt);if(this.memoIncorrectRemaining===0){this.submittedMemo=null;if(this.attempts>=2){this.memoOpen=false;if(this.testActive)this.finishTestQuestion(false);else this.ui.finishMemoAnswer(true);}else{this.state.transition(GameState.Exploration);this.ui.backMemoAnswer();}}}if(this.ui.memoUsage().hintUsed&&!this.analyticsHintTracked){this.analyticsHintTracked=true;this.analytics.track('hint_used',{stageId:this.stage?.id});}this.ui.renderMemo();requestAnimationFrame(next=>this.frame(next));return;}
      if(this.state.state===GameState.Exploration&&!this.memoOpen) {
        const input=this.input.sample(),look=this.input.consumeLook();
        const mode=this.cameraController.mode;
        const wasLadder=!!this.player.ladder;
        if(wasLadder)this.cameraController.rotate(look.x,look.y);
        else {
          if(!this.cameraController.lookingUp)this.player.rotate(look.x);
          this.cameraController.rotate(0,look.y);
        }
        const movement=this.cameraController.lookingUp?{...input,x:0,turn:0,forward:Math.max(0,input.forward)}:input;
        this.boosts.update(dt,this.player,movement.forward);
        this.player.update(dt,this.world,movement,this.cameraController.yaw,'third-person');
        if(this.player.ladder){
          this.cameraController.rotate(this.player.ladderCameraDelta,0);
        } else {
          if(this.player.justCompletedTopExit)this.cameraController.beginTopExitFollow();
          else if(wasLadder)this.player.alignYaw(this.cameraController.yaw);
          if(this.cameraController.followTopExitYaw(this.player.yaw,dt)){/* Smoothly recover camera/body coupling without walking back into the hatch. */}
          else if(mode==='pov'&&!this.cameraController.lookingUp)this.cameraController.yaw=this.player.yaw;
          else this.cameraController.followYaw(this.player.yaw,dt);
        }
        const active=!!(input.x||input.forward||input.turn||input.jump||look.x||look.y||this.player.ladder||this.player.airborne||this.cameraController.lookingUp||this.player.speed>.01);
        this.idleSeconds=active?0:this.idleSeconds+dt;
        this.character.idleContext=this.world.terminalWake>.5?'terminal':this.world.ladderAt(this.player.position)?'ladder':'free';
        if(this.world.world){const target=this.world.world.answerPosition;const heading=Math.atan2(target.x-this.player.position.x,-(target.z-this.player.position.z));this.character.idleLookYaw=Math.atan2(Math.sin(heading-this.player.yaw),Math.cos(heading-this.player.yaw));}
        this.character.idleSeconds=this.idleSeconds;this.character.reducedMotion=this.reducedMotion.matches;
        this.characterVisual.update(this.player.position,this.player.yaw,this.player.speed,dt*(this.boosts.boosting?1.25:1),!!this.player.ladder,this.player.turnRate,this.player.airborne);
        this.world.update(dt,this.player.position);
        this.feedback.update(dt,this.world,this.player,this.reducedMotion.matches);
        this.cameraController.update(this.player.position,this.world,dt);
        this.character.root.visible=this.characterVisibility.update(dt,this.camera.position,this.player.position,this.cameraController.mode==='third-person',this.cameraController.lookingUp||this.cameraController.transitioning);
        this.elapsed+=dt*1000;this.ui.updateExploration(this.elapsed,this.canAnswer());this.ui.updateCamera(this.cameraController.mode);
      } else if(this.state.state===GameState.Quiz||this.state.state===GameState.AnswerResult) {this.elapsed+=dt*1000;this.world.update(dt,this.player.position,true);this.feedback.update(dt,this.world,this.player,this.reducedMotion.matches);}
      else if(this.state.state===GameState.Reveal)this.updateReveal(dt);
      else if((this.state.state===GameState.StageResult||this.state.state===GameState.Complete)&&this.overview){this.revealTime+=dt;this.correctPresentation.update(this.revealTime);}
      this.visuals.update([GameState.Exploration,GameState.Quiz,GameState.AnswerResult,GameState.Reveal].includes(this.state.state)&&!this.overview,this.player.position,this.world.world,this.world.colliders);
      this.renderer.render(this.scene,this.camera);this.ui.renderPreview(dt);
    }
    requestAnimationFrame(next=>this.frame(next));
  }
  private resize():void {this.camera.aspect=innerWidth/innerHeight;if(this.overview)this.layoutCelebration();this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight,false);}
  private layoutCelebration():void {
    const portrait=this.camera.aspect<.8;
    const landscape=innerHeight<500&&!portrait;
    this.camera.fov=42;this.camera.position.set(0,4,portrait?17:14);this.camera.lookAt(0,portrait?3:2.6,0);this.camera.updateProjectionMatrix();
    for(const name of ['earth','atmosphere']){const planet=this.overview?.getObjectByName(name);if(planet){planet.userData.baseScale??=planet.scale.x;planet.userData.baseY??=planet.position.y;planet.scale.setScalar(planet.userData.baseScale*(portrait?.5:1));planet.position.set(portrait?4:21,planet.userData.baseY,-45);}}
    if(this.overview)fitCelestialToSky(this.overview,this.camera);
    const shape=this.overview?.getObjectByName('correct-overview');if(shape){
      const base=shape.userData.baseScale??shape.scale.x;shape.userData.baseScale=base;shape.userData.baseY??=shape.position.y;
      shape.scale.setScalar(base*(portrait?.52:landscape?.55:.85));shape.position.x=portrait?1.25:landscape?2.5:2;shape.position.y=portrait?3.6:landscape?5.1:shape.userData.baseY+.4;
      const reflection=this.overview?.getObjectByName('correct-reflection');if(reflection){reflection.position.copy(shape.position);reflection.position.y=-shape.position.y;reflection.scale.copy(shape.scale);reflection.scale.y*=-1;}
    }
  }
  private removeOverview():void {
    if(!this.overview)return;
    this.overview.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.LineSegments||o instanceof THREE.Points){o.geometry.dispose();const materials=Array.isArray(o.material)?o.material:[o.material];materials.forEach(m=>m.dispose());}});
    this.overview.removeFromParent();this.overview=null;
  }
  private startStage(id:number):void {
    let stage=catalogStage(id);if(!stage)return;
    if(stage.section==='test'){if(!this.testSession.run)return;this.testActive=true;const base=testStagesForRevision(this.testSession.run.geometryRevision)[this.testSession.run.currentQuestion]!;stage={...base,id:base.id+'@'+this.testSession.run.memoEpoch};}else{this.testActive=false;this.testUI.leave();}
    // BOOST pads are a derived presentation aid; canonical room geometry remains unchanged.
    stage=stageWithAutoBoostPads(stage);
    this.audio.stopSE();this.audio.fadeBGM(1);this.audio.playBGM('GAMEPLAY');
    this.ui.setMemoRun(this.testActive?undefined:this.platform.save.memoRunId);
    this.memoOpen=false;this.submittedMemo=null;this.memoIncorrectRemaining=0;this.ui.closeMemo();
    this.correctPresentation.reset();this.correctPresentation.preload();
    this.stage=stage;this.attempts=this.testActive?this.testSession.run!.current.answerAttempts:0;this.elapsed=0;this.used=new Set(this.testActive?this.testSession.run!.usedChoices:[]);this.choices=shuffle(stage.section==='test'&&stage.stageType==='shape'?testChoices(stage):buildChoices(stage),stage.numericId);
    if(!this.gameStarted){this.gameStarted=true;this.analytics.track('game_start',{entry:stage.section??'standard',stageId:stage.id});}
    this.analyticsHintTracked=false;this.analytics.startStage(stage.id,stage.section??'standard',stage.stageType??'shape');
    this.feedback.reset(this.world);this.removeOverview();this.world.build(stage);this.scene.add(this.world.world!.root);this.feedback.reset(this.world);this.feedback.root.visible=true;this.idleSeconds=0;
    this.scene.children.forEach(o=>{if(o instanceof THREE.Light&&o.userData.originalIntensity!==undefined)o.intensity=o.userData.originalIntensity;});
    this.camera.fov=70;this.camera.updateProjectionMatrix();
    this.player.reset(new THREE.Vector3(stage.start[0]*6,stage.start[1]*6-2.939,stage.start[2]*6),Math.PI/2);
    this.player.boostMotion=null;this.boosts.build(stage);this.world.world!.root.add(this.boosts.root);
    this.cameraController.reset(Math.PI/2);this.cameraController.update(this.player.position,this.world);
    this.characterVisibility.reset();this.character.root.scale.setScalar(.7);this.character.update(this.player.position,this.player.yaw,0,1);this.character.root.visible=false;
    if(this.state.state!==GameState.Exploration)this.state.transition(GameState.Exploration);
    this.input.setEnabled(!this.platform.paused);if(!this.testActive)this.platform.setLastPlayed(stage.id);this.ui.showExploration(stage,0,this.canAnswer());this.ui.updateCamera('third-person');
  }
  private showHome():void {this.audio.stopSE();this.audio.fadeBGM(1);this.audio.playBGM('HOME');this.input.setEnabled(false);this.character.root.visible=false;this.ui.showTitle(this.platform.save.completed.filter(id=>STAGES.some(s=>s.id===id)).length,STAGES.length,this.platform.save);this.testUI.leave();}
  private backToTitle():void {
    this.analytics.abandon('title');
    this.gameStarted=false;
    if(this.testPaused)this.audio.resume('test-menu');this.testPaused=false;
    this.saveTest();this.testActive=false;this.testIntro=false;this.memoOpen=false;this.ui.closeMemo();
    this.boosts.clear();this.player.boostMotion=null;
    this.feedback.reset(this.world);this.feedback.root.visible=false;this.idleSeconds=0;
    this.correctPresentation.reset();
    this.clearLookUp();this.world.clear();this.removeOverview();this.stage=null;
    if(this.state.state!==GameState.Title)this.state.transition(GameState.Title);this.showHome();
  }
  private openStageSelect():void {
    this.feedback.root.visible=false;this.idleSeconds=0;
    this.correctPresentation.reset();
    if(this.state.state!==GameState.StageSelect)this.state.transition(GameState.StageSelect);
    this.input.setEnabled(false);this.character.root.visible=false;this.ui.showStageSelect(ALL_STAGES,this.platform.save.completed);
  }
  private openQuiz():void {
    this.requestAnswer('answer-point');
  }
  private requestAnswer(source:'answer-point'|'cube-memo'):void {
    if(!this.stage||this.state.state!==GameState.Exploration||this.attempts>=2||this.platform.paused||document.hidden)return;
    if(source==='cube-memo'){
      if(!this.memoOpen||!this.stage.memo?.enabled)return;
      this.submittedMemo=this.ui.prepareMemoAnswer();this.analytics.track('cube_memo_submit',{stageId:this.stage.id,source:'cube-memo-direct'});this.state.transition(GameState.MemoConfirm);return;
    }else if(this.memoOpen||!this.canAnswer())return;
    this.audio.emit('ANSWER_ENTER');
    this.idleSeconds=0;this.character.idleSeconds=0;this.character.update(this.player.position,this.player.yaw,0,.05,false,0,false);this.feedback.root.visible=false;
    if(source==='answer-point'){this.clearLookUp();this.cameraController.update(this.player.position,this.world);}this.input.setEnabled(false);
    this.analytics.track('cube_memo_open',{stageId:this.stage.id,source});
    this.state.transition(GameState.Quiz);this.ui.showQuiz(this.choices,2-this.attempts,[...this.used]);
  }
  private closeQuiz():void {
    if(this.state.state!==GameState.Quiz||!this.stage)return;
    this.feedback.root.visible=true;this.state.transition(GameState.Exploration);this.input.setEnabled(!this.platform.paused);this.ui.showExploration(this.stage,this.elapsed,this.canAnswer());
  }
  private backMemoAnswer():void {
    if(this.state.state!==GameState.MemoConfirm||this.platform.paused||document.hidden)return;
    this.submittedMemo=null;this.state.transition(GameState.Exploration);this.ui.backMemoAnswer();
  }
  private confirmMemoAnswer():void {
    if(this.state.state!==GameState.MemoConfirm||!this.submittedMemo||!this.stage?.memo||this.attempts>=2||this.platform.paused||document.hidden)return;
    this.ui.lockMemoAnswer();this.state.transition(GameState.AnswerResult);this.attempts++;
    if(this.testActive){this.testSession.run!.current.directSubmissionUsed=true;this.saveTest();}
    const correct=compareMemoToCanonical(this.submittedMemo,this.stage.memo.canonicalCubes).isExactMatch;
    this.analytics.answer({answerSource:'cube_memo_direct',attemptNumber:this.attempts,correct});
    if(this.testActive)this.testSession.recordJudgment(correct);
    if(!correct){this.audio.emit('ANSWER_INCORRECT');this.ui.unlockMemoHint();this.ui.incorrectMemoAnswer();this.memoIncorrectRemaining=.75;return;}
    this.submittedMemo=null;this.memoOpen=false;this.ui.finishMemoAnswer();this.beginCorrectReveal();
  }
  private submitAnswer(id:string):void {
    if(this.state.state!==GameState.Quiz||this.used.has(id)||this.attempts>=2)return;
    const choice=this.choices.find(c=>c.id===id);if(!choice)return;
    this.attempts++;this.used.add(id);this.state.transition(GameState.AnswerResult);
    this.analytics.answer({answerSource:'answer_point',attemptNumber:this.attempts,correct:choice.correct});
    this.saveTest();if(this.testActive)this.testSession.recordJudgment(choice.correct);
    if(!choice.correct){this.audio.emit('ANSWER_INCORRECT');if(this.stage?.memo?.enabled)this.ui.unlockMemoHint();this.ui.showIncorrect(id,2-this.attempts);if(this.attempts<2)this.state.transition(GameState.Quiz);else if(this.testActive)this.finishTestQuestion(false);else this.ui.showFailed();return;}
    this.ui.showCorrect();this.beginCorrectReveal();
  }
  private beginCorrectReveal():void {
    this.audio.fadeBGM(.4);this.audio.emit('ANSWER_CORRECT');
    this.backgroundPreset=this.variants.selectBackground();this.correctPresentation.setPose(this.variants.selectCubiePose());
    this.state.transition(GameState.Reveal);this.revealTime=0;
  }
  private updateReveal(dt:number):void {
    if(!this.stage)return;
    this.revealTime+=dt;
    const frame=this.correctPresentation.update(this.revealTime);
    if(!frame.sceneReady)return;
    if(!this.overview){
      this.audio.playBGM('CORRECT_SCENE');this.audio.fadeBGM(1);
      this.ui.hideQuizForReveal();if(this.world.world)this.world.world.root.visible=false;
      this.character.root.visible=false;
      this.overview=new CelebrationScene(this.world,this.stage,STAGES,this.backgroundPreset).root;this.scene.add(this.overview);
      this.scene.children.forEach(o=>{if(o instanceof THREE.Light){o.userData.originalIntensity??=o.intensity;o.intensity=o.userData.originalIntensity*.55;}});
      const shape=this.overview.getObjectByName('correct-overview');if(shape)shape.userData.baseY=shape.position.y;
      this.layoutCelebration();
    }
    for(const name of ['correct-overview','correct-reflection']){const shape=this.overview.getObjectByName(name);if(shape)shape.visible=frame.shapeVisible;}
    if(!frame.resultReady)return;
    this.state.transition(GameState.StageResult);
    this.analytics.completeStage({answerAttempts:this.attempts,firstTry:this.attempts===1,hintUsed:this.ui.memoUsage().hintUsed,memoUsed:this.memoOpen||!!this.submittedMemo,directSubmission:this.submittedMemo!==null,completed:true});
    if(this.testActive){this.showTestCorrectResult();return;}
    void this.platform.completeStage(this.stage.id,this.elapsed,this.attempts).catch(error=>console.warn('保存失敗',error));
    const section=this.stage.section==='advanced'?ALL_STAGES.filter(s=>s.section==='advanced'):STAGES;const complete=section.every(s=>this.platform.save.completed.includes(s.id));if(complete)this.state.transition(GameState.Complete);
    this.ui.showResult(this.stage,this.elapsed,this.attempts,complete);
  }
  private toggleCamera():void {
    this.idleSeconds=0;this.character.idleSeconds=0;
    if(this.memoOpen||this.state.state!==GameState.Exploration)return;
    if(this.cameraController.lookingUp)return;
    // The newly visible character and camera share a heading on mode changes.
    if(!this.player.ladder){
      if(this.cameraController.mode==='pov')this.player.alignYaw(this.cameraController.yaw);
      else this.cameraController.yaw=this.player.yaw;
    }
    this.character.root.visible=false;this.cameraController.toggle();this.ui.updateCamera(this.cameraController.mode);
  }
  private toggleMemo():void {
    if(this.state.state!==GameState.Exploration||!this.stage?.memo?.enabled)return;
    this.memoOpen=!this.memoOpen;
    if(this.memoOpen)this.analytics.track('cube_memo_open',{stageId:this.stage.id});
    if(this.testActive&&this.memoOpen)this.testSession.run!.current.memoUsed=true;
    this.input.setEnabled(!this.memoOpen&&!this.platform.paused&&!document.hidden);
    if(this.memoOpen)this.ui.openMemo();else this.ui.closeMemo();
    this.lastFrame=performance.now();
  }
  private canAnswer():boolean {
    if(!this.world.world)return false;
    return this.world.world.answerPositions.some(pad=>Math.hypot(this.player.position.x-pad.x,this.player.position.z-pad.z)<1.8&&Math.abs(this.player.position.y-pad.y)<1);
  }
  private saveTest(){if(!this.testActive||!this.testSession.run)return;const r=this.testSession.run;r.current.answerAttempts=this.attempts;r.usedChoices=[...this.used];r.current.hintUsed||=this.ui.memoUsage().hintUsed;this.testSession.save();}
  private attachTestQA(){
    if(!import.meta.env.DEV)return;
    const panel=document.createElement('details');panel.className='test-dev-qa';panel.open=true;
    const title=document.createElement('summary');title.textContent='DEV QA · isolated test save / fixture-assisted, not human timing';panel.append(title);
    const button=(name:string,action:()=>void)=>{const b=document.createElement('button');b.textContent=name;b.onclick=action;panel.append(b);};
    button('QA: Canonical Memo',()=>{if(this.stage?.section==='test'&&!this.memoOpen&&this.state.state===GameState.Exploration)this.ui.prepareTestQAMemo(this.stage);});
    button('QA: Answer Point',()=>{if(this.stage?.section==='test'&&!this.memoOpen&&this.state.state===GameState.Exploration){const p=this.world.world!.answerPositions[0]!.clone().add(new THREE.Vector3(0,-.0798,-1.1));this.player.reset(p,Math.PI);this.cameraController.reset(Math.PI);}});
    const ladderReport=document.createElement('pre');panel.append(ladderReport);
    let ladderQA=false;
    button('QA: Q2 F (new isolated test)',()=>{
      if(ladderQA)return;this.backToTitle();this.testSession.start();this.testSession.finish(false);this.startTest(false);
    });
    button('QA: Q3 hold + Jump dismount x20',()=>{
      if(ladderQA)return;ladderQA=true;this.backToTitle();this.testSession.start();this.testSession.finish(false);this.testSession.finish(false);this.startTest(false);
      let cycle=0,phase='climb',started=performance.now(),ladder=this.stage!.ladders[0]!,top=0,holdY=0;
      const key=(down:boolean)=>window.dispatchEvent(new KeyboardEvent(down?'keydown':'keyup',{code:'KeyW',key:'w',bubbles:true}));
      const setup=()=>{ladder=this.stage!.ladders[cycle%this.stage!.ladders.length]!;top=ladder.to[1]*6-2.94;this.player.reset(new THREE.Vector3(ladder.from[0]*6,ladder.from[1]*6-2.939,ladder.from[2]*6-1.6),Math.PI);this.cameraController.reset(Math.PI);phase='climb';started=performance.now();key(true);};setup();
      const fail=(reason:string)=>{key(false);ladderQA=false;ladderReport.textContent=`FAIL / ${reason}: ${cycle}/20 (fixture-assisted)`;};
      const tick=()=>{if(!ladderQA)return;const now=performance.now();
        if(this.state.state!==GameState.Exploration||document.hidden||this.testPaused||now-started>15000){fail(`interruption / timeout: phase=${phase}, hidden=${document.hidden}, paused=${this.testPaused}, state=${this.state.state}, y=${this.player.position.y.toFixed(3)}, top=${top}, attached=${this.player.ladder?.id??'none'}`);return;}
        if(phase==='climb'&&this.player.position.y>=top+.15){key(false);holdY=this.player.position.y;phase='hold';started=now;}
        if(phase==='hold'){
          if(this.player.ladder?.id!==ladder.id||Math.abs(this.player.position.y-holdY)>.02){fail('automatic exit / drift');return;}
          if(now-started>=1500){key(true);phase='resume';started=now;}
        }else if(phase==='resume'&&now-started>=400){
          key(false);if(this.player.position.y<holdY+.2||!this.player.ladder){fail('input resume');return;}this.input.jump();phase='jump';started=now;
        }else if(phase==='jump'&&!this.player.ladder&&!this.player.airborne&&this.world.hasSafeFloor(this.player.position)){phase='landed';started=now;}
        else if(phase==='landed'){
          if(this.player.ladder||Math.abs(this.player.position.y-top)>.02){fail('landing / recapture');return;}
          if(now-started>=1000){cycle++;ladderReport.textContent=`Q3 climb → attached hold → Jump → same-floor landing: ${cycle}/20 PASS (fixture start + scripted inputs; not physical user QA)`;if(cycle===20){ladderQA=false;return;}setup();}
        }
        requestAnimationFrame(tick);
      };requestAnimationFrame(tick);
    });
    const status=document.createElement('pre');panel.append(status);document.body.append(panel);
    let lastTime=performance.now(),lastFrame=this.renderer.info.render.frame;
    setInterval(()=>{const now=performance.now(),frame=this.renderer.info.render.frame,fps=(frame-lastFrame)*1000/(now-lastTime);lastTime=now;lastFrame=frame;if(panel.open)status.textContent=JSON.stringify({state:this.state.state,run:this.testSession.run,correctChoice:this.choices.findIndex(c=>c.correct)+1,result:this.testSession.data.best?.score,render:this.renderer.info.render,fps,memory:this.renderer.info.memory,jsHeap:(performance as Performance&{memory?:{usedJSHeapSize:number}}).memory?.usedJSHeapSize},null,2);},500);
  }
  private pauseTest(){
    if(!this.testActive||this.state.state!==GameState.Exploration||this.memoOpen)return;
    this.saveTest();this.testPaused=true;this.input.setEnabled(false);this.clearLookUp();this.audio.pause('test-menu');
    const resume=()=>{this.testPaused=false;this.lastFrame=performance.now();this.audio.resume('test-menu');this.input.setEnabled(!this.platform.paused&&!document.hidden);};
    this.testUI.pause(resume,()=>{this.testSession.restart();resume();this.startStage(this.stage!.numericId);},()=>this.backToTitle());
  }
  private startTest(fresh:boolean){
    if(fresh){this.testSession.start();this.analytics.track('cube_test_start',{testSetId:'test-set-a',scoreModelVersion:'cube-score-1'});}const run=this.testSession.run;if(!run)return;
    this.testUI.hide();
    // A reload during the reveal resumes the saved outcome, never a third answer.
    if(typeof run.pendingOutcome==='boolean'){
      if(run.pendingOutcome){
        this.testActive=true;this.startStage(TEST_STAGES[run.currentQuestion]!.numericId);
        this.input.setEnabled(false);this.state.transition(GameState.Quiz);this.state.transition(GameState.AnswerResult);this.beginCorrectReveal();
      }else this.finishTestQuestion(false);
      return;
    }
    this.testActive=true;this.startStage(TEST_STAGES[run.currentQuestion]!.numericId);
    this.lastFrame=performance.now();
    if(run.currentQuestion===4&&!run.finalAnnouncementSeen){
      this.testIntro=true;this.input.setEnabled(false);
      this.testUI.finalChallenge(()=>{run.finalAnnouncementSeen=true;this.testSession.save();this.testIntro=false;this.lastFrame=performance.now();this.input.setEnabled(!this.platform.paused&&!document.hidden);});
    }
  }
  private showTestCorrectResult(){
    const run=this.testSession.run;if(!run)return;
    this.saveTest();this.input.setEnabled(false);let advanced=false;
    const next=()=>{if(advanced||this.testSession.run!==run)return;advanced=true;
      const result=this.testSession.finish(true);this.testUI.hide();
      this.analytics.track('cube_test_complete',{testSetId:run.setId,completed:true});
      if(result){this.testActive=false;this.ui.hideQuizForReveal();this.testUI.analyze(result);}
      else this.startTest(false);
    };
    this.testUI.waitOnCorrect(()=>this.ui.showTestCorrectResult(run.currentQuestion,next));
  }
  private finishTestQuestion(completed:boolean){this.saveTest();const result=this.testSession.finish(completed);this.testActive=false;this.backToTitle();this.audio.playBGM('CORRECT_SCENE');if(result)this.testUI.analyze(result);else this.testUI.between(completed,()=>this.startTest(false));}
  snapshot():object {return {revealTime:this.revealTime,airborne:this.player.airborne,movementState:this.player.movementState,legAngles:this.character.legs.map(leg=>[leg.upper.rotation.x,leg.lower.rotation.x]),state:this.state.state,position:this.player.position.toArray(),yaw:this.cameraController.yaw,playerYaw:this.player.yaw,turnRate:this.player.turnRate,turningAround:this.player.turningAround,animation:this.character.state,speed:this.player.speed,pitch:this.cameraController.pitch,mode:this.cameraController.mode,lookingUp:this.cameraController.lookingUp,characterVisible:this.character.root.visible,elapsed:this.elapsed,attempts:this.attempts,ladder:this.player.ladder?.id??null,camera:this.camera.position.toArray(),quaternion:this.camera.quaternion.toArray()};}
}
