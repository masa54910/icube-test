import {describe,it,expect} from 'vitest';
import * as THREE from 'three';
import {WorldBuilder} from '../src/game/WorldBuilder';
import {PlayerController} from '../src/game/PlayerController';
import {CameraController} from '../src/game/CameraController';
import {STAGES} from '../src/stages/stage-data';
import {buildChoices,shapeKey} from '../src/stages/stage-utils';
import type {StageDefinition} from '../src/types';
const corridor:StageDefinition={...STAGES[0]!,start:[0,0,0],rooms:Array.from({length:8},(_,i)=>[i,0,0] as const),ladders:[],answerPoints:[[7,0,0]]};
const run=(p:PlayerController,w:WorldBuilder,seconds:number,x=0,forward=1,yaw=Math.PI/2)=>{
 for(let i=0;i<seconds*60;i++)p.update(1/60,w,{x,forward,jump:false,turn:0},yaw);
};
describe('Player controller root causes',()=>{
 it('holds forward for 10s across shared room boundaries without a collision gap',()=>{
  const w=new WorldBuilder();w.build(corridor);const p=new PlayerController();p.reset(new THREE.Vector3(0,-2.939,0));run(p,w,10);expect(p.position.x).toBeCloseTo(37.5,1);
 });
 it('backs up and moves along walls, then reverses direction',()=>{
  const w=new WorldBuilder();w.build(corridor);const p=new PlayerController();p.reset(new THREE.Vector3(0,-2.939,2.59));
  run(p,w,2,1/Math.sqrt(2),1/Math.sqrt(2));expect(p.position.x).toBeGreaterThan(4);expect(p.position.z).toBeLessThan(2.61);
  const x=p.position.x;run(p,w,1,0,-1);expect(p.position.x).toBeLessThan(x-2.9);
  run(p,w,1,0,1,-Math.PI/2);expect(p.position.x).toBeLessThan(x-5.8);
 });
 it('blocks exterior walls at high delta time',()=>{
  const w=new WorldBuilder();w.build({...corridor,rooms:[[0,0,0]]});const p=new PlayerController();p.reset(new THREE.Vector3(0,-2.939,0));run(p,w,10);expect(p.position.x).toBeLessThan(2.61);expect(p.position.x).toBeGreaterThan(2.5);
 });
 it('removes disposed stage geometry and collision bodies',()=>{
  const w=new WorldBuilder();const scene=new THREE.Scene();scene.add(w.build(corridor).root);w.build({...corridor,rooms:[[0,0,0]]});expect(scene.children.length).toBe(0);expect(w.colliders.length).toBe(14);
 });
 it('climbs both directions and exits at the destination floor',()=>{
  const w=new WorldBuilder();w.build({...corridor,rooms:[[0,0,0],[0,1,0]],ladders:[{id:'test',from:[0,0,0],to:[0,1,0]}]});
  const p=new PlayerController();p.reset(new THREE.Vector3(0,-2.939,-1.6));run(p,w,2.5,0,1,0);expect(p.position.y).toBeGreaterThan(2);
  run(p,w,.1,0,-1,0);expect(p.position.y).toBeLessThan(3.1);
 });
});
describe('Camera modes',()=>{
 it.each(['third-person','pov'] as const)('restores exact %s camera after LOOK UP, repeatedly',mode=>{
  const w=new WorldBuilder();w.build(corridor);const camera=new THREE.PerspectiveCamera(70,1,.05,100);const c=new CameraController(camera);c.mode=mode;c.yaw=1.2;c.pitch=-.35;
  const p=new THREE.Vector3(0,-2.939,0);c.update(p,w);const before=camera.matrixWorld.toArray();
  for(let i=0;i<20;i++){c.setLookUp(true);c.update(p,w);c.setLookUp(false);c.update(p,w);}
  expect(c.mode).toBe(mode);expect(c.pitch).toBe(-.35);expect(camera.matrixWorld.toArray()).toEqual(before);
 });
 it('keeps the third-person camera inside the closed room',()=>{
  const w=new WorldBuilder();w.build({...corridor,rooms:[[0,0,0]]});const c=new CameraController(new THREE.PerspectiveCamera());c.yaw=-Math.PI/2;c.update(new THREE.Vector3(2.5,-2.939,0),w);expect(c.camera.position.x).toBeLessThan(2.9);
 });
});
describe('canonical stages',()=>{
 it.each(STAGES)('$id still has ten unique choices and a matching correct shape',stage=>{
  const choices=buildChoices(stage);expect(choices).toHaveLength(10);expect(new Set(choices.map(c=>shapeKey(c.voxels))).size).toBe(10);expect(shapeKey(choices.find(c=>c.correct)!.voxels)).toBe(shapeKey(stage.rooms));
 });
});
