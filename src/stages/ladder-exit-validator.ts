import * as T from 'three';
import type {StageDefinition} from '../types';
import type {WorldBuilder} from '../game/WorldBuilder';
import {CONFIG} from '../config';
/** Checks real built collision geometry. Does not alter voxels or enlarge catch volumes. */
export function validateLadderTopExits(stage:StageDefinition,world:WorldBuilder){
 return stage.ladders.map(l=>{
  const from=new T.Vector3(l.to[0]*6,l.to[1]*6-2.94,l.to[2]*6-1.35),target=world.ladderTopExitTarget(l,from);
  if(!target||!world.hasSafeFloor(target))throw Error(`${stage.id}/${l.id}: no safe top floor`);
  for(let i=1;i<=10;i++){const t=i/10,p=from.clone().lerp(target,t);p.y+=Math.sin(Math.PI*t)*.65;if(!world.isNavigable(p))throw Error(`${stage.id}/${l.id}: obstructed exit`);}
  for(const a of world.world!.answerPositions)if(Math.abs(a.y-target.y)<1&&Math.hypot(a.x-target.x,a.z-target.z)<1.5)throw Error(`${stage.id}/${l.id}: terminal interference`);
  for(const b of stage.boostPads??[]){const start=new T.Vector3(...b.position).multiplyScalar(6),end=start.clone().addScaledVector(new T.Vector3(...b.direction),b.distance*6);start.y-=2.94;end.y-=2.94;const segment=end.clone().sub(start),t=T.MathUtils.clamp(target.clone().sub(start).dot(segment)/Math.max(.001,segment.lengthSq()),0,1);if(start.addScaledVector(segment,t).distanceTo(target)<2)throw Error(`${stage.id}/${l.id}: boost interference`);}
  return {stage:stage.id,ladder:l.id,top:from.y,exit:target.toArray(),radius:CONFIG.player.radius,margin:.08,floorThickness:CONFIG.wallThickness,horizontalAssist:Math.hypot(target.x-from.x,target.z-from.z)};
 });
}
