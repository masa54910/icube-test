import {afterEach,expect,it,vi} from 'vitest';
import {FirstPlayTutorial} from '../src/game/FirstPlayTutorial';
import {PlayablesSDK,type SaveData} from '../src/platform/PlayablesSDK';
import {InputController} from '../src/game/InputController';
import {Game} from '../src/game/Game';
import {GameState} from '../src/game/GameState';
import {spotlightSteps,placeTutorialBubble} from '../src/ui/SpotlightTutorial';
import {readFileSync} from 'node:fs';
const fresh=():SaveData=>({version:1,completed:[],bestTimesMs:{},bestAttempts:{},lastPlayed:'stage_1_1'});
afterEach(()=>vi.unstubAllGlobals());
it.each(['standard','advanced','special','test'])('first %s opens, saves only on completion, subsequent auto starts skip',()=>{
 const save=fresh(),persist=vi.fn(async()=>{}),gate=new FirstPlayTutorial(()=>save,persist),resume=vi.fn();let complete=()=>{};
 expect(gate.open(false,done=>{complete=done;},resume)).toBe(true);
 expect(gate.active).toBe(true);expect(resume).not.toHaveBeenCalled();expect(save.tutorialCompleted).toBeUndefined();expect(persist).not.toHaveBeenCalled();
 complete();complete();expect(save.tutorialCompleted).toBe(true);expect(persist).toHaveBeenCalledTimes(1);expect(resume).toHaveBeenCalledTimes(1);expect(gate.active).toBe(false);
 expect(gate.open(false,()=>{throw Error('redisplay');},resume)).toBe(false);
});
it('explicit skip saves; duplicate open cannot replace active tutorial',()=>{
 const save=fresh(),persist=vi.fn(async()=>{}),gate=new FirstPlayTutorial(()=>save,persist);let skip=()=>{};
 gate.open(false,done=>{skip=done;},()=>{});expect(gate.open(true,vi.fn(),vi.fn())).toBe(false);skip();expect(save.tutorialCompleted).toBe(true);expect(persist).toHaveBeenCalledOnce();
});
it('reload before acknowledgement retries, after completion skips',()=>{
 let save=fresh();let stored='';const gate=new FirstPlayTutorial(()=>save,async()=>{stored=JSON.stringify(save);});let done=()=>{};
 gate.open(false,cb=>{done=cb;},()=>{});expect(new FirstPlayTutorial(()=>fresh(),async()=>{}).open(false,()=>{},()=>{})).toBe(true);
 done();save=JSON.parse(stored);expect(new FirstPlayTutorial(()=>save,async()=>{}).open(false,vi.fn(),vi.fn())).toBe(false);
});
it('manual reopen does not reset or rewrite flag',()=>{
 const save={...fresh(),tutorialCompleted:true},persist=vi.fn(async()=>{}),gate=new FirstPlayTutorial(()=>save,persist);let done=()=>{};
 for(let i=0;i<2;i++){expect(gate.open(true,cb=>{done=cb;},()=>{})).toBe(true);done();expect(save.tutorialCompleted).toBe(true);}
 expect(persist).not.toHaveBeenCalled();
});
it('input locked until completion; failed storage does not freeze play',async()=>{
 vi.stubGlobal('window',{addEventListener:vi.fn()});vi.stubGlobal('document',{addEventListener:vi.fn()});
 const input=new InputController({addEventListener:vi.fn()} as unknown as HTMLCanvasElement);input.setEnabled(true);
 const gate=new FirstPlayTutorial(fresh,async()=>{throw Error('unavailable');});let done=()=>{};
 gate.open(false,cb=>{input.setEnabled(false);done=cb;},()=>input.setEnabled(true));input.jump();
 expect(input.sample()).toEqual({x:0,forward:0,jump:false,turn:0});expect(input.consumeLook()).toEqual({x:0,y:0});done();expect(input.enabled).toBe(true);await Promise.resolve();
});
it.each([false,true])('existing platform save persists flag (Playables=%s)',async playables=>{
 let data='';vi.stubGlobal('navigator',{languages:['ja']});vi.stubGlobal('localStorage',{getItem:()=>data,setItem:(_key:string,value:string)=>{data=value;}});
 const saveData=vi.fn(async(value:string)=>{data=value;});vi.stubGlobal('ytgame',playables?{IN_PLAYABLES_ENV:true,system:{isAudioEnabled:()=>true,onAudioEnabledChange:()=>()=>{},onPause:()=>()=>{},onResume:()=>()=>{},getLanguage:async()=>'ja'},game:{loadData:async()=>data,saveData}}:undefined);
 const sdk=new PlayablesSDK();await sdk.initialize(()=>{},()=>{},()=>{});sdk.save.tutorialCompleted=true;await sdk.persist();const reloaded=new PlayablesSDK();await reloaded.initialize(()=>{},()=>{},()=>{});expect(reloaded.save.tutorialCompleted).toBe(true);expect(saveData).toHaveBeenCalledTimes(playables?1:0);
});
it('Game tutorial frame renders scene without advancing timers or physics',()=>{
 vi.stubGlobal('requestAnimationFrame',vi.fn());const game:any={lastFrame:0,tutorial:{active:true},elapsed:123,renderer:{render:vi.fn()},scene:{},camera:{},analytics:{tick:vi.fn()},testSession:{tick:vi.fn()},player:{update:vi.fn()},boosts:{update:vi.fn()}};
 (Game.prototype as any).frame.call(game,10000);expect(game.elapsed).toBe(123);expect(game.renderer.render).toHaveBeenCalledWith(game.scene,game.camera);
 for(const call of [game.analytics.tick,game.testSession.tick,game.player.update,game.boosts.update])expect(call).not.toHaveBeenCalled();expect(game.lastFrame).toBe(10000);
});
it('Game manual action locks input and resumes original exploration',()=>{
 vi.stubGlobal('document',{hidden:false});const save={...fresh(),tutorialCompleted:true};let finish=()=>{};
 const game:any={state:{state:GameState.Exploration},tutorial:new FirstPlayTutorial(()=>save,async()=>{}),platform:{paused:false},elapsed:123,input:{setEnabled:vi.fn()},clearLookUp:vi.fn(),audio:{stopSE:vi.fn()},ui:{renderPreview:vi.fn(),showSpotlightTutorial:vi.fn((done:()=>void)=>{finish=done;}),closeSpotlightTutorial:vi.fn()},renderer:{render:vi.fn()},scene:{},camera:{}};
 (Game.prototype as any).openTutorial.call(game,true);expect(game.tutorial.active).toBe(true);expect(game.input.setEnabled).toHaveBeenLastCalledWith(false);
 finish();expect(game.tutorial.active).toBe(false);expect(game.input.setEnabled).toHaveBeenLastCalledWith(true);expect(game.ui.closeSpotlightTutorial).toHaveBeenCalledOnce();expect(game.elapsed).toBe(123);
});
it('desktop/mobile steps use correct input and actual HUD targets',()=>{
 const pc=spotlightSteps(false),mobile=spotlightSteps(true);expect(pc).toHaveLength(6);expect(mobile).toHaveLength(6);
 expect(pc[0]!.body).toContain('WASD');expect(pc[2]!.body).toContain('Space');
 for(let i=0;i<4;i++){expect(mobile[i]!.body).toBe(pc[i]!.body);expect(pc[i]!.body).toContain('\n\n');}
 expect(mobile[3]!.target).toBe('.touch-stick');
 expect(mobile[0]!.target).toBe('.touch-stick');expect(mobile[2]!.target).toBe('.touch-jump');expect(mobile[4]!.target).toBe('.mini-memo');expect(pc[4]!.body).toBe(mobile[4]!.body);
 for(const step of [...pc,...mobile]){expect(step.title.length).toBeGreaterThan(0);expect(step.body.length).toBeGreaterThan(0);}
});
it.each([[1280,720],[768,1024],[390,844],[844,390],[320,480]])('bubble stays inside %ix%i safe viewport',(w,h)=>{
 const safe={x:20,y:30,width:w-40,height:h-60},width=Math.min(390,safe.width),height=Math.min(230,safe.height);
 for(const target of [{x:25,y:h-100,width:80,height:65},{x:w-110,y:100,width:90,height:100},{x:w*.4,y:h*.3,width:150,height:100}]){
 const p=placeTutorialBubble(target,width,height,safe);expect(p.x).toBeGreaterThanOrEqual(safe.x);expect(p.y).toBeGreaterThanOrEqual(safe.y);expect(p.x+width).toBeLessThanOrEqual(w-20);expect(p.y+height).toBeLessThanOrEqual(h-30);}
});
it('auto trigger follows stage rendering; HUD tutorial and How To remain separate',()=>{
 const source=readFileSync('src/game/Game.ts','utf8'),ui=readFileSync('src/ui/UIController.ts','utf8');
 expect(source).toContain('if(tutorialAfter)this.openTutorial();');expect(source).toContain('}else this.openTutorial();');expect(source.match(/setEnabled\(!this.tutorial.active/g)).toHaveLength(2);
 expect(ui).toContain("this.hud.querySelector('.hud-chip')!.append(tutorialButton)");expect(ui).not.toContain('showFirstPlayTutorial');expect(ui).toContain('showSpotlightTutorial');
});
