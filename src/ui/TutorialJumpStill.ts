import * as THREE from 'three';
import {WorldBuilder} from '../game/WorldBuilder';
import {Character} from '../game/Character';
import {STAGES} from '../stages/stage-data';
import {CONFIG} from '../config';

const cache:Partial<Record<'jump'|'look-up',string>>={};
/** One still from the shipped stage geometry and actual airborne animation.
 * Never touches the running game, physics, audio or save; releases its GPU context. */
export function jumpStill(kind:'jump'|'look-up'='jump'):string|undefined {
 if(cache[kind])return cache[kind];
 const world=new WorldBuilder(),character=new Character(),scene=new THREE.Scene();
 let renderer:THREE.WebGLRenderer|undefined;
 try {
  const stage=STAGES[0]!,room=stage.start;
  scene.background=new THREE.Color(0x15283c);scene.add(world.build(stage).root,character.root);
  scene.add(new THREE.HemisphereLight(0xffffff,0xa9b9cb,2.5));
  const light=new THREE.DirectionalLight(0xffffff,2);light.position.set(4,9,6);scene.add(light);
  const center=new THREE.Vector3(...room).multiplyScalar(CONFIG.roomSize);
  const position=center.clone().add(new THREE.Vector3(0,-1.8,0));
  character.update(position,Math.PI/2,0,.2,false,0,true);
  const camera=new THREE.PerspectiveCamera(58,4/3,.05,150);
  camera.position.copy(center).add(new THREE.Vector3(-2.5,-.3,2.2));camera.lookAt(position.clone().add(new THREE.Vector3(0,.7,0)));
  if(kind==='look-up'){
   character.root.visible=false;
   const shaft=new THREE.Vector3(...(stage.ladders[0]?.from??room)).multiplyScalar(CONFIG.roomSize);
   camera.position.copy(shaft).add(new THREE.Vector3(.8,-1.5,.8));
   camera.lookAt(shaft.clone().add(new THREE.Vector3(-.6,6,0)));
  }
  renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(960,720);renderer.render(scene,camera);
  cache[kind]=renderer.domElement.toDataURL('image/webp',.85);return cache[kind];
 }catch{return undefined;}finally{
  world.clear();
  const geometries=new Set<THREE.BufferGeometry>(),materials=new Set<THREE.Material>();
  character.root.traverse(o=>{if(o instanceof THREE.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);}});
  geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());renderer?.dispose();renderer?.forceContextLoss();
 }
}
