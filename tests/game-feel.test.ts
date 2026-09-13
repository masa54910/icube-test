import {it,expect} from 'vitest';
import * as THREE from 'three';
import {WorldFeedback} from '../src/game/WorldFeedback';
import {WorldBuilder} from '../src/game/WorldBuilder';
import {PlayerController} from '../src/game/PlayerController';
import {Character} from '../src/game/Character';
import {STAGES} from '../src/stages/stage-data';
import {CONFIG} from '../src/config';
const idle={x:0,forward:0,turn:0,jump:false};
it('normal horizontal travel is half the baseline, with unchanged height and ladder assist',()=>{
  const w=new WorldBuilder();w.build({...STAGES[0]!,rooms:[[-1,0,0],[0,0,0],[1,0,0]],ladders:[]});
  const measure=(speed:number)=>{const p=new PlayerController();p.reset(new THREE.Vector3(0,-2.939,0),Math.PI/2);p.update(.03,w,idle,Math.PI/2,'third-person');
    // Same integration and vertical trajectory, varying only launch speed.
    (p as unknown as {launchJump(d:THREE.Vector3,s:number):void}).launchJump(new THREE.Vector3(1,0,0),speed);
    let peak=p.position.y;for(let i=0;i<120;i++){p.update(1/120,w,idle,Math.PI/2,'third-person');peak=Math.max(peak,p.position.y);}return {distance:p.position.x,peak};};
  const before=measure(4.8),after=measure(CONFIG.jump.forwardSpeed);console.log('JUMP MEASURE',before,after);
  expect(after.distance/before.distance).toBeCloseTo(.5,3);expect(after.peak).toBeCloseTo(before.peak,6);expect(CONFIG.jump.ladderForwardSpeed).toBe(4.8);
});
it('seams pulse once with cooldown, restore original materials and reuse effect meshes',()=>{
  const w=new WorldBuilder();w.build({...STAGES[0]!,rooms:[[0,0,0],[1,0,0]],ladders:[]});const p=new PlayerController(),f=new WorldFeedback();f.reset(w);const count=f.root.children.length;
  p.position.set(2.99,-2.94,0);f.update(.016,w,p);p.position.x=3.01;f.update(.016,w,p);expect(f.counters.voxel).toBe(1);
  for(let i=0;i<30;i++){p.position.x=i%2?2.99:3.01;f.update(.016,w,p);}expect(f.counters.voxel).toBe(1);expect(f.root.children).toHaveLength(count);
});
it('terminal wakes close by, holds during answer, then softly sleeps',()=>{
  const w=new WorldBuilder();w.build(STAGES[0]!);let wakes=0;w.onTerminalWake=()=>wakes++;
  for(let i=0;i<120;i++)w.update(1/60,w.world!.answerPosition);expect(w.terminalWake).toBeGreaterThan(.99);expect(wakes).toBe(1);
  for(let i=0;i<120;i++)w.update(1/60,new THREE.Vector3(100,100,100),true);expect(w.terminalWake).toBeGreaterThan(.99);
  w.update(.2,new THREE.Vector3(100,100,100));expect(w.terminalWake).toBeGreaterThan(.99);
  for(let i=0;i<240;i++)w.update(1/60,new THREE.Vector3(100,100,100));expect(w.terminalWake).toBeLessThan(.01);
});
it('landing feedback triggers once after a jump, never from standing',()=>{
  const w=new WorldBuilder();w.build({...STAGES[0]!,rooms:[[0,0,0]],ladders:[]});const p=new PlayerController(),f=new WorldFeedback();p.reset(new THREE.Vector3(0,-2.939,0));f.reset(w);
  for(let i=0;i<60;i++){p.update(1/60,w,idle,0,'third-person');f.update(1/60,w,p);}expect(f.counters.land).toBe(0);
  for(let i=0;i<100;i++){p.update(1/60,w,{...idle,jump:i===0},0,'third-person');f.update(1/60,w,p);}expect(f.counters.land).toBe(1);
});
it('jog bends elbows and knees, idle cancels with input and reduced motion',()=>{
  const c=new Character(),pos=new THREE.Vector3();for(let i=0;i<60;i++)c.update(pos,0,1,1/60,false,1);
  expect(c.arms.every(a=>a.lower.rotation.x>1.2&&a.lower.rotation.x<2.1)).toBe(true);expect(c.legs.some(l=>l.lower.rotation.x<-.5)).toBe(true);
  c.idleSeconds=5;c.update(pos,0,0,.2);expect(c.idleGesture).toBe('scan');c.idleSeconds=0;c.update(pos,0,1,.016);expect(c.idleGesture).toBe('none');
  c.idleSeconds=5;c.reducedMotion=true;c.update(pos,0,0,.2);expect(c.idleGesture).toBe('none');expect(c.root.position.toArray()).toEqual([0,0,0]);
});
