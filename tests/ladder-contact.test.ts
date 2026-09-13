import {atLadderTop} from './ladder-test-input';
import {it,expect} from 'vitest';
import {Vector3} from 'three';
import {WorldBuilder} from '../src/game/WorldBuilder';
import {PlayerController} from '../src/game/PlayerController';
import {TEST_STAGES} from '../src/test-mode/test-stages';
import {ALL_STAGES} from '../src/stages/catalog';
const idle={x:0,forward:0,jump:false,turn:0};
it('Q3 twenty simulated climbs stay NORMAL on the upper supported floor',()=>{
 const w=new WorldBuilder();w.build(TEST_STAGES[2]!);
 try{for(let repeat=0;repeat<20;repeat++){
  const l=TEST_STAGES[2]!.ladders[repeat%TEST_STAGES[2]!.ladders.length]!,p=new PlayerController();
  p.reset(new Vector3(l.from[0]*6,l.from[1]*6-2.939,l.from[2]*6-1.6),Math.PI);
  for(let i=0;i<900&&!p.justCompletedTopExit;i++)p.update(1/60,w,{...idle,forward:1,jump:atLadderTop(p)},p.yaw,'third-person');
  expect(p.justCompletedTopExit).toBe(true);const y=p.position.y;
  for(let i=0;i<300;i++)p.update(1/60,w,idle,p.yaw,'third-person');
  expect(p.movementState).toBe('NORMAL');expect(p.position.y).toBeCloseTo(y,2);expect(w.hasSafeFloor(p.position)).toBe(true);
 }}finally{w.clear();}
});
it('retains the exit latch outside the rail until a fresh intentional movement',()=>{
 const w=new WorldBuilder();w.build(TEST_STAGES[2]!);const l=TEST_STAGES[2]!.ladders[0]!,p=new PlayerController();
 try{
  p.reset(new Vector3(l.from[0]*6,l.from[1]*6-2.939,l.from[2]*6-1.6),Math.PI);
  for(let i=0;i<900&&!p.justCompletedTopExit;i++)p.update(1/60,w,{...idle,forward:1,jump:atLadderTop(p)},p.yaw,'third-person');
  expect(p.justCompletedTopExit).toBe(true);
  for(let i=0;i<60;i++)p.update(1/60,w,idle,p.yaw,'third-person');
  // Simulate a contact-volume re-entry, not a new input command.
  p.position.set(l.from[0]*6,l.to[1]*6-2.939,l.from[2]*6-1.35);
  p.update(.005,w,idle,p.yaw,'third-person');
  expect(p.ladder).toBeNull();
 }finally{w.clear();}
});
it('jumps from safe upper strip through hatch and lands on the lower floor',()=>{const w=new WorldBuilder();w.build(TEST_STAGES[2]!);const l=TEST_STAGES[2]!.ladders[0]!,p=new PlayerController();try{const exit=w.ladderTopExitTarget(l,new Vector3(l.from[0]*6,l.to[1]*6-2.94,l.from[2]*6-1.35))!;p.reset(exit,Math.PI);p.update(.02,w,idle,Math.PI,'third-person');p.update(1/60,w,{...idle,forward:1,jump:true},Math.PI,'third-person');for(let i=0;i<240;i++)p.update(1/60,w,idle,Math.PI,'third-person');expect(p.position.y).toBeCloseTo(l.from[1]*6-2.94,2);expect(p.airborne).toBe(false);}finally{w.clear();}});
const representatives=[...ALL_STAGES.filter(s=>(!s.section||s.section==='standard')&&s.ladders.length).slice(0,3),...ALL_STAGES.filter(s=>s.section==='advanced'&&['advanced-route1-1','advanced-route1-5','advanced-route1-10'].includes(s.id)),TEST_STAGES[2]!,TEST_STAGES[4]!];
it.each(representatives)('$id every ladder exits then remains idle without recapture',stage=>{const w=new WorldBuilder();w.build(stage);try{for(const l of stage.ladders){const p=new PlayerController();p.reset(new Vector3(l.from[0]*6,l.from[1]*6-2.939,l.from[2]*6-1.6),Math.PI);let exited=false;for(let i=0;i<1000;i++){p.update(1/60,w,{...idle,forward:1,jump:atLadderTop(p)},p.yaw,'third-person');if(p.justCompletedTopExit){exited=true;break;}}expect(exited,l.id).toBe(true);const y=p.position.y;for(let i=0;i<180;i++){p.update(1/60,w,idle,p.yaw,'third-person');expect(p.ladder).toBeNull();expect(p.position.y).toBeCloseTo(y,2);}}}finally{w.clear();}});
it.each([0,Math.PI/2,-Math.PI/2,Math.PI,Math.PI/4])('upper contact faces ladder immediately without downward input, yaw %s',yaw=>{
 const w=new WorldBuilder();w.build(TEST_STAGES[2]!);const l=TEST_STAGES[2]!.ladders[0]!,p=new PlayerController();
 try{p.reset(new Vector3(l.from[0]*6,l.to[1]*6-2.939,l.from[2]*6-1.35),yaw);p.update(.005,w,idle,yaw,'third-person');expect(p.ladder?.id).toBe(l.id);expect(p.yaw).toBeCloseTo(l.facingYaw??0,6);const y=p.position.y;for(let n=0;n<120;n++)p.update(1/60,w,idle,yaw,'third-person');expect(p.position.y).toBeCloseTo(y,2);}finally{w.clear();}
});
it('Q3 ten climbs and five-second upper-floor idle never recapture or descend',()=>{
 const w=new WorldBuilder();w.build(TEST_STAGES[2]!);const l=TEST_STAGES[2]!.ladders[0]!;
 try{for(let repeat=0;repeat<10;repeat++){const p=new PlayerController();p.reset(new Vector3(l.from[0]*6,l.from[1]*6-2.939,l.from[2]*6-1.6),Math.PI);let exited=false;for(let i=0;i<900;i++){p.update(1/60,w,{...idle,forward:1,jump:atLadderTop(p)},p.yaw,'third-person');if(p.justCompletedTopExit){exited=true;break;}}expect(exited).toBe(true);const y=p.position.y;for(let i=0;i<300;i++){p.update(1/60,w,idle,p.yaw,'third-person');expect(p.ladder).toBeNull();expect(p.position.y).toBeCloseTo(y,2);}expect(w.hasSafeFloor(p.position)).toBe(true);}}finally{w.clear();}
});
it('upper rail only descends with Down, and Jump releases it',()=>{
 const w=new WorldBuilder();w.build(TEST_STAGES[2]!);const l=TEST_STAGES[2]!.ladders[0]!,p=new PlayerController();try{p.reset(new Vector3(l.from[0]*6,l.to[1]*6-2.94,l.from[2]*6-1.35));p.update(.01,w,idle,0);const y=p.position.y;for(let i=0;i<30;i++)p.update(1/60,w,{...idle,forward:-1},0);expect(p.position.y).toBeLessThan(y-.5);p.update(.01,w,{...idle,jump:true},0);expect(p.ladder).toBeNull();expect(p.airborne).toBe(true);}finally{w.clear();}
});
it('does not attract a player outside the existing interaction volume',()=>{const w=new WorldBuilder();w.build(TEST_STAGES[2]!);const l=TEST_STAGES[2]!.ladders[0]!,p=new PlayerController();try{p.reset(new Vector3(l.from[0]*6+1.5,l.to[1]*6-2.939,l.from[2]*6-1.35));for(let i=0;i<30;i++)p.update(1/60,w,idle,0);expect(p.ladder).toBeNull();}finally{w.clear();}});
it.each([[-.5,0],[.5,0],[0,-.4],[.4,.4]])('upper side/back contact at offset %s,%s snaps to ladder front',(x,z)=>{const w=new WorldBuilder();w.build(TEST_STAGES[2]!);const l=TEST_STAGES[2]!.ladders[0]!,p=new PlayerController();try{p.reset(new Vector3(l.from[0]*6+x,l.to[1]*6-2.939,l.from[2]*6-1.65+z),Math.PI);p.update(.005,w,idle,Math.PI,'third-person');expect(p.ladder?.id).toBe(l.id);expect(p.yaw).toBeCloseTo(l.facingYaw??0,6);}finally{w.clear();}});
it('covers three Standard, three ROUTE and two TEST representatives',()=>expect(representatives).toHaveLength(8));
