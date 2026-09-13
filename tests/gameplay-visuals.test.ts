import {describe,it,expect} from 'vitest';
import * as THREE from 'three';
import {WorldBuilder} from '../src/game/WorldBuilder';
import {Character} from '../src/game/Character';
import {STAGES} from '../src/stages/stage-data';
import {upgradeExplorerMaterials,upgradeStageMaterials} from '../src/game/GameplayMaterials';
describe('Gameplay visual-only upgrade',()=>{
  it('preserves every stage collider, room, ladder and answer position',()=>{
    for(const stage of STAGES){const w=new WorldBuilder(),built=w.build(stage);const before=JSON.stringify({boxes:w.colliders.map(b=>[b.min.toArray(),b.max.toArray()]),rooms:built.rooms,ladders:built.ladders,answer:built.answerPosition.toArray()});upgradeStageMaterials(built.root);expect(JSON.stringify({boxes:w.colliders.map(b=>[b.min.toArray(),b.max.toArray()]),rooms:built.rooms,ladders:built.ladders,answer:built.answerPosition.toArray()})).toBe(before);w.clear();}
  });
  it('shares beveled props and does not let shared wall mutation enable ceiling shadows',()=>{
    const w=new WorldBuilder(),root=w.build(STAGES[0]!).root;upgradeStageMaterials(root);let walls=0,bevels=0;const shapes=new Map<string,THREE.BufferGeometry>();root.traverse(o=>{if(!(o instanceof THREE.Mesh)||!(o.material instanceof THREE.MeshStandardMaterial))return;if(o.material.name==='sci-fi-composite'){walls++;expect(o.castShadow).toBe(false);expect(o.receiveShadow).toBe(true);}if(o.geometry.type==='RoundedBoxGeometry'){bevels++;const size=JSON.stringify((o.geometry as THREE.BoxGeometry).parameters);if(shapes.has(size))expect(o.geometry).toBe(shapes.get(size));else shapes.set(size,o.geometry);}});expect(walls).toBeGreaterThan(10);expect(bevels).toBeGreaterThan(shapes.size);w.clear();
  });
  it('separates explorer material groups without changing geometry or joints',()=>{
    const c=new Character(),meshes:THREE.Mesh[]=[];c.root.traverse(o=>{if(o instanceof THREE.Mesh)meshes.push(o);});const geometry=meshes.map(m=>m.geometry);const transform=meshes.map(m=>[m.position.toArray(),m.scale.toArray()]);upgradeExplorerMaterials(c.root);expect(meshes.map(m=>m.geometry)).toEqual(geometry);expect(meshes.map(m=>[m.position.toArray(),m.scale.toArray()])).toEqual(transform);const names=new Set(meshes.map(m=>(m.material as THREE.Material).name));for(const name of ['suit-fabric','hard-shell-backpack','helmet-shell','visor-fresnel-reflection','gloves-boots','cyan-accent','flexible-joint-trim'])expect(names.has(name)).toBe(true);const visor=meshes.find(m=>(m.material as THREE.Material).name==='visor-fresnel-reflection')!.material as THREE.MeshPhysicalMaterial;expect(visor.clearcoat).toBe(1);expect(visor.roughness).toBeLessThan(.15);
  });
});
