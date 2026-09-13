import {it,expect} from 'vitest';
import {ADVANCED_STAGES} from '../src/stages/advanced-route';
import {buildRouteChoices,routeRotationKey} from '../src/stages/route-choices';
import {shapeKey,isConnected,shuffle} from '../src/stages/stage-utils';
import {routeViewLayout} from '../src/ui/RouteAnswerPreview';
import * as T from 'three';
it.each(ADVANCED_STAGES)('$displayName: exact canonical x1, tiers, topology, rotation duplicates, shared camera fit',s=>{
 const choices=buildRouteChoices(s),canonical=shapeKey(s.memo!.canonicalCubes);expect(choices.filter(c=>shapeKey(c.voxels)===canonical)).toHaveLength(1);expect(choices.filter(c=>!c.correct).every(c=>shapeKey(c.voxels)!==canonical)).toBe(true);expect(new Set(choices.map(c=>routeRotationKey(c.voxels))).size).toBe(10);
 for(const [tier,count]of [['easy',3],['medium',4],['hard',2],['correct',1]] as const)expect(choices.filter(c=>c.routeDifficulty===tier)).toHaveLength(count);
 const layout=routeViewLayout(choices);choices.forEach((c,i)=>{expect(isConnected(c.voxels)).toBe(true);expect(c.voxels.every(p=>p.every(Number.isInteger))).toBe(true);expect(c.voxels.length).toBeGreaterThanOrEqual(s.rooms.length-3);expect(c.voxels.length).toBeLessThanOrEqual(s.rooms.length+3);
 const spans=[0,1,2].map(a=>Math.max(...c.voxels.map(p=>p[a]!))-Math.min(...c.voxels.map(p=>p[a]!))+1);const original=[0,1,2].map(a=>Math.max(...s.rooms.map(p=>p[a]!))-Math.min(...s.rooms.map(p=>p[a]!))+1);expect(Math.max(...spans)).toBeGreaterThanOrEqual(Math.max(...original)*.65);
 for(const [x,y,z]of c.voxels)for(const dx of [-.5,.5])for(const dy of [-.5,.5])for(const dz of [-.5,.5]){const p=new T.Vector3(x+dx,y+dy,z+dz).sub(layout.centers[i]!);expect(Math.abs(p.dot(layout.right))).toBeLessThan(layout.halfHeight*1.5);expect(Math.abs(p.dot(layout.up))).toBeLessThan(layout.halfHeight);}
 });expect(shuffle(choices,42)).toEqual(shuffle(choices,42));
});
