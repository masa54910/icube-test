import {describe,it,expect} from 'vitest';
import {deriveBoostPads,detectBoostCorridors,MIN_BOOST_CORRIDOR_LENGTH} from '../src/stages/boost-corridors';
import type {StageDefinition} from '../src/types';
import {Character} from '../src/game/Character';
import * as THREE from 'three';
import {ALL_STAGES} from '../src/stages/catalog';
import {PURE_ROUTE_STAGES,answerZoneAudit} from '../src/stages/pure-route';

const stage=(rooms:readonly (readonly [number,number,number])[]):StageDefinition=>({id:'corridor-test',numericId:999,group:1,level:1,displayName:'test',subtitle:'test',difficulty:1,rooms,start:rooms[0]!,ladders:[]});

describe('global horizontal corridor boost derivation',()=>{
 it('detects only same-floor horizontal runs of four or more',()=>{
  const s=stage([[0,0,0],[1,0,0],[2,0,0],[3,0,0],[4,0,0],[5,0,0],[0,1,0],[0,2,0]]);
  expect(MIN_BOOST_CORRIDOR_LENGTH).toBe(6);expect(detectBoostCorridors(s)).toHaveLength(1);
 });
 it('does not generate a pad for a five-cube run',()=>{expect(deriveBoostPads(stage([[0,0,0],[1,0,0],[2,0,0],[3,0,0],[4,0,0]]))).toEqual({pads:[],corridors:[]});});
 it('creates forward and reverse pads without changing rooms',()=>{
  const rooms=[[0,0,0],[1,0,0],[2,0,0],[3,0,0],[4,0,0],[5,0,0],[6,0,0]] as const;const s=stage(rooms);const out=deriveBoostPads(s);
  expect(out.pads).toHaveLength(2);expect(out.pads.map(p=>p.direction.join(','))).toEqual(['1,0,0','-1,0,0']);expect(s.rooms).toEqual(rooms);
 });
 it('audits every shipped stage for unique, obstacle-clear derived pads',()=>{
  for(const s of ALL_STAGES){const out=deriveBoostPads(s);const ids=out.pads.map(p=>`${p.position.join(',')}|${p.direction.join(',')}`);expect(new Set(ids).size).toBe(ids.length);
   for(const p of out.pads){for(const a of s.answerPoints??[])expect(Math.hypot(p.position[0]-a[0],p.position[1]-a[1],p.position[2]-a[2])).toBeGreaterThan(.8);}
  }
 });
 it('keeps ROUTE answer terminals distributed along route progress',()=>{
  for(const s of PURE_ROUTE_STAGES){const a=answerZoneAudit(s);expect(a.clustered, s.id).toBe(false);expect(a.progress.every(v=>v>0.08&&v<=1),s.id).toBe(true);}
 });
});

describe('jump upper-body pose',()=>{
 it('raises both arms during airborne and restores the locomotion pose on landing',()=>{
  const c=new Character();const pos=new THREE.Vector3();c.update(pos,0,0,.1,false,0,true);
  expect(c.arms.every(a=>Math.abs(a.upper.rotation.x)>2.5&&Math.abs(a.upper.rotation.z)<.01&&Math.abs(a.lower.rotation.z)<.01)).toBe(true);
  c.update(pos,0,0,.1,false,0,false);
  expect(c.arms.every(a=>Math.abs(a.upper.rotation.z)<.5)).toBe(true);
 });
});
