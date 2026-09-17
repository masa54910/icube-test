import {describe,it,expect} from 'vitest';
import * as THREE from 'three';
import {MEMO_COLOR_HEX} from '../src/game/CubeMemo';
import {SPECIAL_STAGES,buildSpecialChoices} from '../src/stages/special';
import {ALL_STAGES} from '../src/stages/catalog';
import {getAllRotations,getCanonicalShapeKey,getColoredShapeKey,areColoredShapesEquivalent} from '../src/game/ShapeEquivalence';
import {isConnected,buildChoices,shuffle} from '../src/stages/stage-utils';
import {CubeMemoSystem} from '../src/game/CubeMemoSystem';
import {MEMO_COLORS} from '../src/game/CubeMemo';
import {WorldBuilder} from '../src/game/WorldBuilder';
import {swipeStep} from '../src/ui/HomeShowcase';
describe('SPECIAL color cubes',()=>{
 it('does not require stages themselves to share geometry',()=>{expect(new Set(SPECIAL_STAGES.map(s=>getCanonicalShapeKey(s.rooms))).size).toBe(5);});
 it('has five stages after Advanced and unique IDs',()=>{expect(SPECIAL_STAGES).toHaveLength(5);expect(ALL_STAGES.slice(-5)).toEqual(SPECIAL_STAGES);expect(new Set(ALL_STAGES.map(s=>s.numericId)).size).toBe(ALL_STAGES.length);});
 for(const stage of SPECIAL_STAGES){
  it(stage.id+' every displayed correct flag matches shape AND color through all rotations',()=>{
   const choices=shuffle(buildChoices(stage),stage.numericId);
   for(const c of choices)for(const rotation of getAllRotations(c.voxels)){
    expect(areColoredShapesEquivalent(rotation.map(([x,y,z])=>[x+5,y-2,z+7]),c.colors!,stage.memo!.canonicalCubes,stage.colors!)).toBe(c.correct);
   }
   expect(choices.filter(c=>c.correct)).toHaveLength(1);
   console.log(JSON.stringify({stage:stage.id,choices:choices.length,correctDisplayNumber:choices.findIndex(c=>c.correct)+1,uniqueColoredShapes:new Set(choices.map(c=>getColoredShapeKey(c.voxels,c.colors!))).size}));
  });
  it(stage.id+' colors structural interiors without changing collision boxes',()=>{
   const world=new WorldBuilder(),plain=new WorldBuilder();const built=world.build(stage);plain.build({...stage,section:'standard',colors:undefined});
   expect(world.colliders.map(b=>[b.min.toArray(),b.max.toArray()])).toEqual(plain.colliders.map(b=>[b.min.toArray(),b.max.toArray()]));
   const surfaces=built.root.children.filter(o=>o.userData.roomSurface) as THREE.Mesh<THREE.BoxGeometry,THREE.MeshStandardMaterial|THREE.MeshStandardMaterial[]>[];
   expect(surfaces.length).toBeGreaterThan(stage.rooms.length*2);
   for(const color of new Set(stage.colors)){const meshes=surfaces.filter(m=>m.userData.roomColor===color);expect(meshes.length).toBeGreaterThan(0);for(const mesh of meshes){const mats=Array.isArray(mesh.material)?mesh.material:[mesh.material];expect(mats.some(m=>m.color.getHex()===MEMO_COLOR_HEX[color!])).toBe(true);}}
   world.clear();plain.clear();
  });
  it(stage.id+' includes five same-shape/different-color choice pairs and similar shapes',()=>{
   const choices=buildSpecialChoices(stage),groups=new Map<string,typeof choices>();
   for(const choice of choices){const key=getCanonicalShapeKey(choice.voxels);groups.set(key,[...(groups.get(key)??[]),choice]);expect(isConnected(choice.voxels)).toBe(true);expect(choice.voxels).toHaveLength(stage.rooms.length);expect([...choice.colors!].sort()).toEqual([...stage.colors!].sort());}
   expect(groups.size).toBe(5);
   for(const pair of groups.values()){expect(pair).toHaveLength(2);expect(areColoredShapesEquivalent(pair[0]!.voxels,pair[0]!.colors!,pair[1]!.voxels,pair[1]!.colors!)).toBe(false);}
   for(const choice of choices.filter(c=>getCanonicalShapeKey(c.voxels)!==getCanonicalShapeKey(stage.rooms)))expect(choice.voxels.filter(p=>stage.rooms.some(q=>p.every((v,i)=>v===q[i])))).toHaveLength(stage.rooms.length-1);
  });
  it(stage.id+' is connected with ten unique colored choices',()=>{expect(isConnected(stage.rooms)).toBe(true);expect(stage.colors).toHaveLength(stage.rooms.length);const c=buildChoices(stage);expect(c).toHaveLength(10);expect(c.filter(v=>v.correct)).toHaveLength(1);expect(new Set(c.map(v=>getColoredShapeKey(v.voxels,v.colors!))).size).toBe(10);});
  it(stage.id+' preserves color through all 24 rotations and translations',()=>{for(const rotated of getAllRotations(stage.rooms))expect(areColoredShapesEquivalent(rotated.map(([x,y,z])=>[x+7,y-3,z+2]),stage.colors!,stage.rooms,stage.colors!)).toBe(true);expect(areColoredShapesEquivalent(stage.rooms,stage.colors!,stage.rooms,buildSpecialChoices(stage)[1]!.colors!)).toBe(false);});
  it(stage.id+' has no side LED boards and keeps usable white memo origin',()=>{const world=new WorldBuilder();expect(world.build(stage).root.children.filter(c=>c.name.startsWith('special-led-'))).toHaveLength(0);world.clear();const store=new CubeMemoSystem().get(stage);expect(store.cubes[0]!.color).toBe('white');store.add(1,0,0,'red');store.clear();expect(store.cubes[0]!.color).toBe('white');});
 }
 it('rejects reflection of a colored chiral shape',()=>{const p=SPECIAL_STAGES[2]!;expect(areColoredShapesEquivalent(p.rooms,p.colors!,p.rooms.map(([x,y,z])=>[-x,y,z]),p.colors!)).toBe(false);});
 it('preserves palette order',()=>expect(MEMO_COLORS).toEqual(['white','red','yellow','green','blue','orange']));
});
describe('Home touch swipe',()=>{
 it('supports touch both ways and ignores mouse/vertical/small motion',()=>{expect(swipeStep(-80,4,'touch')).toBe(1);expect(swipeStep(80,4,'touch')).toBe(-1);expect(swipeStep(80,4,'mouse')).toBe(0);expect(swipeStep(80,100,'touch')).toBe(0);expect(swipeStep(12,0,'touch')).toBe(0);});
});
