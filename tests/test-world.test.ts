import {atLadderTop} from './ladder-test-input';
import {it,expect} from 'vitest';
import {WorldBuilder} from '../src/game/WorldBuilder';
import {TEST_STAGES} from '../src/test-mode/test-stages';
import {validateLadderTopExits} from '../src/stages/ladder-exit-validator';
import * as T from 'three';
import {PlayerController} from '../src/game/PlayerController';
import {BoostPads} from '../src/game/BoostPads';
it('builds all five questions with safe ladder exits and reachable canonical goals',()=>{
 const world=new WorldBuilder();
 try{for(const stage of TEST_STAGES){world.build(stage);expect(validateLadderTopExits(stage,world)).toHaveLength(stage.ladders.length);expect(world.world!.answerPositions.length).toBe(stage.answerPoints!.length);expect(stage.rooms.some(v=>v.join()===stage.goal!.join())).toBe(true);world.clear();}}finally{world.clear();}
});
it.each(TEST_STAGES)('$id climbs from the bottom of every ladder onto a supported upper floor',stage=>{
 const world=new WorldBuilder();world.build(stage);
 try{for(const ladder of stage.ladders){const p=new PlayerController();p.reset(new T.Vector3(ladder.from[0]*6,ladder.from[1]*6-2.939,ladder.from[2]*6-1.6),Math.PI);let exited=false;
  for(let frame=0;frame<900;frame++){p.update(1/60,world,{forward:1,x:0,turn:0,jump:atLadderTop(p)},Math.PI,'third-person');if(p.justCompletedTopExit){exited=true;break;}}
  expect(exited,ladder.id).toBe(true);expect(world.hasSafeFloor(p.position)).toBe(true);expect(p.airborne).toBe(false);
 }}finally{world.clear();}
});
it('Q5 boost travels its configured distance and stops before the ladder',()=>{
 const stage=TEST_STAGES[4]!,world=new WorldBuilder();world.build(stage);const pads=new BoostPads();pads.build(stage);const b=stage.boostPads![0]!,p=new PlayerController(),start=new T.Vector3(...b.position).multiplyScalar(6);start.y-=2.939;const input={forward:0,x:0,turn:0,jump:false};p.reset(start,Math.PI/2);p.update(.03,world,input,p.yaw);let seen=false;
 try{for(let i=0;i<600;i++){pads.update(.01,p,i===0?1:0);seen||=pads.boosting;p.update(.01,world,input,p.yaw);expect(world.isNavigable(p.position)).toBe(true);if(seen&&!pads.boosting)break;}
  expect(seen).toBe(true);expect(pads.boosting).toBe(false);expect(p.position.x-start.x).toBeCloseTo(b.distance*6,1);expect(p.position.x).toBeLessThan(stage.ladders[0]!.from[0]*6-3);
 }finally{pads.clear();world.clear();}
});
