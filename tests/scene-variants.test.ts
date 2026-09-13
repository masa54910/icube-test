import {it,expect} from 'vitest';
import * as THREE from 'three';
import {CharacterVisibility} from '../src/game/CharacterVisibility';
import {CameraController} from '../src/game/CameraController';
import {WorldBuilder} from '../src/game/WorldBuilder';
import {CelebrationScene} from '../src/game/CelebrationScene';
import {CorrectSceneVariantService,BACKGROUND_PRESETS,CUBIE_POSES} from '../src/game/CorrectSceneVariants';
import {STAGES} from '../src/stages/stage-data';
import {fitCelestialToSky} from '../src/game/CelestialLayout';

it('session randomizer excludes both recent entries independently for 200 results',()=>{
  let seed=19;const s=new CorrectSceneVariantService(()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;});
  const b:string[]=[],p:string[]=[];
  for(let i=0;i<200;i++){const next=s.selectBackground().id,pose=s.selectCubiePose().id;expect(b.slice(-2)).not.toContain(next);expect(p.slice(-2)).not.toContain(pose);b.push(next);p.push(pose);}
  expect(new Set(b).size).toBe(8);expect(new Set(p).size).toBe(8);expect(CUBIE_POSES).toHaveLength(8);
});
it.each(BACKGROUND_PRESETS)('preset $id uses the same correct stage shape and distant buildings',preset=>{
  const w=new WorldBuilder(),stage=STAGES[0]!;const c=new CelebrationScene(w,stage,STAGES,preset);
  expect(c.root.userData.preset).toBe(preset.id);expect(c.root.getObjectByName('correct-overview')).toBeDefined();expect(c.root.getObjectByName('distant-buildings')).toBeInstanceOf(THREE.InstancedMesh);
  expect(c.root.getObjectByName('planet-ring')!==undefined).toBe(preset.ring);expect(c.root.getObjectByName('asteroid-belt')!==undefined).toBe(preset.asteroids);
});
it.each(BACKGROUND_PRESETS)('preset $id keeps the complete planet and rings above the horizon',preset=>{
  for(const aspect of [1.5,390/844,844/390]){
    const scene=new CelebrationScene(new WorldBuilder(),STAGES[0]!,STAGES,preset),camera=new THREE.PerspectiveCamera(42,aspect,.05,250);
    camera.position.set(0,4,aspect<.8?17:14);camera.lookAt(0,aspect<.8?3:2.6,0);camera.updateMatrixWorld();fitCelestialToSky(scene.root,camera);
    const horizon=new THREE.Vector3(0,4,-10000).project(camera).y;
    const box=new THREE.Box3().setFromObject(scene.root.getObjectByName('earth')!).union(new THREE.Box3().setFromObject(scene.root.getObjectByName('atmosphere')!));
    for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z]){
      const point=new THREE.Vector3(x,y,z).project(camera);expect(point.y).toBeGreaterThan(horizon+.06);expect(point.y).toBeLessThan(.96);
    }
    expect((scene.root.getObjectByName('celebration-ground') as THREE.Mesh).material).toMatchObject({transparent:false,depthWrite:true});
  }
});
it('hides the complete render root in POV, transitions, near walls and swept crossings',()=>{
  const v=new CharacterVisibility(),p=new THREE.Vector3(),rear=new THREE.Vector3(0,1.25,2.8),front=new THREE.Vector3(0,1.25,-2.8);
  expect(v.update(.1,rear,p,true,false)).toBe(true);
  expect(v.update(.1,front,p,true,false)).toBe(false); // segment crosses the character
  expect(v.update(.1,front,p,true,false)).toBe(true);
  expect(v.update(.1,new THREE.Vector3(0,1.25,.3),p,true,false)).toBe(false);
  expect(v.update(.1,rear,p,true,true)).toBe(false);
  expect(v.update(.1,rear,p,false,false)).toBe(false);
  expect(v.update(.1,rear,p,true,false)).toBe(true);expect(p.toArray()).toEqual([0,0,0]);
});
it('mode changes interpolate continuously and rapid reversals start from the current camera',()=>{
  const w=new WorldBuilder();w.build(STAGES[0]!);const p=new THREE.Vector3(...STAGES[0]!.start).multiplyScalar(6);p.y-=2.939;
  const c=new CameraController(new THREE.PerspectiveCamera());c.update(p,w);const initial=c.camera.position.clone();c.toggle();c.update(p,w,.016);
  expect(c.transitioning).toBe(true);expect(c.camera.position.distanceTo(initial)).toBeLessThan(.1);
  const current=c.camera.position.clone();c.toggle();c.update(p,w,.016);expect(c.camera.position.distanceTo(current)).toBeLessThan(.1);
  const during=c.camera.position.clone();c.setLookUp(true);for(let i=0;i<20;i++)c.update(p,w,.016);c.setLookUp(false);c.update(p,w,.016);expect(c.camera.position.equals(during)).toBe(true);
  for(let i=0;i<30;i++)c.update(p,w,.016);expect(c.transitioning).toBe(false);expect(c.mode).toBe('third-person');
});
