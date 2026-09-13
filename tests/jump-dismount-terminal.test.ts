import {beforeEach,it,expect,vi} from 'vitest';
import {Vector3} from 'three';
import {WorldBuilder} from '../src/game/WorldBuilder';
import {PlayerController} from '../src/game/PlayerController';
import {TEST_STAGES,TEST_STAGES_V2} from '../src/test-mode/test-stages';
import {STAGES} from '../src/stages/stage-data';
import {CubeMemoSystem} from '../src/game/CubeMemoSystem';
import {memoStageForRun} from '../src/game/MemoRun';
import {CONFIG} from '../src/config';
const idle={x:0,forward:0,turn:0,jump:false};
beforeEach(()=>{const data=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>data.set(k,v)});});
it('Q3 twenty repetitions: hold at top, stop attached, Jump once and land on that floor',()=>{
 const w=new WorldBuilder();w.build(TEST_STAGES[2]!);
 try{for(let cycle=0;cycle<20;cycle++){
  const l=TEST_STAGES[2]!.ladders[cycle%2]!,p=new PlayerController(),jump=vi.fn();p.onJump=jump;
  p.reset(new Vector3(l.from[0]*6,l.from[1]*6-2.939,l.from[2]*6-1.6));
  for(let n=0;n<300&&p.position.y<l.to[1]*6-2.8;n++)p.update(1/60,w,{...idle,forward:1},0);
  const heldY=p.position.y;expect(heldY).toBeGreaterThan(l.to[1]*6-2.94);
  for(let n=0;n<60;n++)p.update(1/60,w,idle,0);
  expect(p.position.y).toBeCloseTo(heldY,5);expect(p.ladder?.id).toBe(l.id);
  for(let n=0;n<20;n++)p.update(1/60,w,{...idle,forward:1},0);
  expect(p.position.y).toBeGreaterThan(heldY+.1);
  for(let n=0;n<300;n++)p.update(1/60,w,{...idle,forward:1},0);
  expect(p.ladder?.id).toBe(l.id);expect(p.exitingLadderTop).toBe(false);expect(p.position.y).toBeGreaterThan(l.to[1]*6-2.94);
  for(let n=0;n<120;n++)p.update(1/60,w,idle,0);
  expect(p.movementState).toBe('LADDER');expect(p.yaw).toBeCloseTo(l.facingYaw??0,5);expect(jump).not.toHaveBeenCalled();
  p.update(1/60,w,{...idle,jump:true},0);expect(p.ladder).toBeNull();expect(p.airborne).toBe(true);
  for(let n=0;n<180;n++)p.update(1/60,w,idle,0);
  expect(jump).toHaveBeenCalledTimes(1);expect(p.movementState).toBe('NORMAL');expect(p.position.y).toBeCloseTo(l.to[1]*6-2.94,2);expect(w.hasSafeFloor(p.position)).toBe(true);
 }}finally{w.clear();}
});
it.each([[-.5,0],[.5,0],[0,.35],[.35,.3]])('five repeated upper entries at %s,%s face the rail',(dx,dz)=>{
 const w=new WorldBuilder();w.build(TEST_STAGES[2]!);const l=TEST_STAGES[2]!.ladders[0]!;
 try{for(let n=0;n<5;n++){const p=new PlayerController();p.reset(new Vector3(l.from[0]*6+dx,l.to[1]*6-2.939,l.from[2]*6-1.65+dz),Math.PI);p.update(.01,w,idle,Math.PI);expect(p.ladder?.id).toBe(l.id);expect(p.yaw).toBeCloseTo(l.facingYaw??0,5);}}finally{w.clear();}
});
it.each([STAGES[0]!,STAGES[15]!,STAGES[30]!,TEST_STAGES[1]!])('$id terminal is solid but front interaction remains reachable',stage=>{
 const w=new WorldBuilder();w.build(stage);
 try{for(const a of w.world!.answerPositions){
  const front=a.clone().add(new Vector3(0,-.0798,-1.1));expect(w.isNavigable(front)).toBe(true);expect(front.distanceTo(a)).toBeLessThan(CONFIG.answer.pointRadius);
  expect(w.isNavigable(a.clone().setY(front.y))).toBe(false);
  expect(w.isNavigable(a.clone().add(new Vector3(0,1.15,.08)))).toBe(false);
  for(const side of [-1,1]){const p=a.clone().add(new Vector3(side*1.3,-.0798,0));for(let n=0;n<80;n++)w.moveAxis(p,'x',-side*.025);expect(Math.abs(p.x-a.x)).toBeGreaterThan(1.1);}
  const falling=a.clone().add(new Vector3(.65,2.1,0));let hit=false;for(let n=0;n<100&&!hit;n++)hit=w.moveAxis(falling,'y',-.025);expect(hit).toBe(true);expect(falling.y).toBeGreaterThan(a.y+.8);
 }}finally{w.clear();}
});
it('Q2 is exactly a front-facing nine-cube F; other revised questions unchanged',()=>{
 const f=TEST_STAGES[1]!;expect([3,2,1,0].map(y=>Array.from({length:4},(_,x)=>f.rooms.some(p=>p[0]===x&&p[1]===y&&p[2]===0)?'#':'.').join(''))).toEqual(['####','#...','###.','#...']);
 expect(f.memo!.canonicalCubes).toEqual(f.rooms);for(const i of [0,2,3,4])expect(TEST_STAGES[i]!.rooms).toEqual(TEST_STAGES_V2[i]!.rooms);
});
it.each(STAGES)('$id fresh memo is one START and saved memo remains untouched',stage=>{
 const system=new CubeMemoSystem(),old=system.get(stage);old.add(1,0,0,'navy');
 const fresh=memoStageForRun(stage,'new-gate-run');expect(system.get(fresh).cubes).toHaveLength(1);expect(system.get(fresh).cubes[0]!.id).toBe('origin');
 expect(new CubeMemoSystem().get(stage).cubes).toHaveLength(2);expect(new CubeMemoSystem().get(stage).cubes[1]!.color).toBe('navy');
});
