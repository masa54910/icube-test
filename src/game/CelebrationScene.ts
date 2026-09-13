import * as THREE from 'three';
import {WorldBuilder} from './WorldBuilder';
import type {StageDefinition} from '../types';
import {BACKGROUND_PRESETS,type BackgroundPreset} from './CorrectSceneVariants';
import {buildCelebrationBackdrop} from './CelebrationBackdrop';

/** Self-contained, texture-free result set. No impact on stage physics or scoring. */
export class CelebrationScene {
  readonly root=new THREE.Group();
  constructor(world:WorldBuilder,stage:StageDefinition,others:readonly StageDefinition[],preset:BackgroundPreset=BACKGROUND_PRESETS[0]) {
    this.root.name='celebration-space';this.root.userData.preset=preset.id;
    this.root.add(buildCelebrationBackdrop(preset));
    const floor=new THREE.Mesh(new THREE.PlaneGeometry(600,600),new THREE.ShaderMaterial({
      vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
      fragmentShader:`varying vec3 p;void main(){vec2 q=p.xy;float glow=exp(-length(q-vec2(9.,-20.))*.013);vec3 base=mix(vec3(.83,.89,.95),vec3(.98,.99,1.),glow);gl_FragColor=vec4(base,1.);}`
    }));floor.rotation.x=-Math.PI/2;floor.position.y=-.02;this.root.add(floor);
    const shape=world.buildOverview(stage);const box=new THREE.Box3().setFromObject(shape),size=box.getSize(new THREE.Vector3());
    const scale=6/Math.max(size.x,size.y,size.z);shape.scale.setScalar(scale);shape.rotation.y=-.28;shape.position.set(2,size.y*scale/2+.1,-2);this.root.add(shape);
    const reflection=shape.clone(true);reflection.name='correct-reflection';reflection.position.y=-shape.position.y;reflection.scale.y=-scale;
    reflection.traverse(o=>{if(o instanceof THREE.Mesh||o instanceof THREE.LineSegments){const m=(o.material as THREE.Material).clone();m.transparent=true;m.opacity=.16;m.depthWrite=false;o.material=m;}});this.root.add(reflection);
    // Opaque foreground: distant space objects never bleed through the ground.
    floor.name='celebration-ground';floor.renderOrder=2;
    const farStages=others.filter(s=>s.id!==stage.id).slice(0,8);
    const buildings=new THREE.InstancedMesh(new THREE.BoxGeometry(.43,.43,.43),new THREE.MeshBasicMaterial({color:0x9baab9,transparent:true,opacity:.42}),farStages.reduce((sum,s)=>sum+s.rooms.length,0));
    buildings.name='distant-buildings';let index=0;const matrix=new THREE.Matrix4();
    farStages.forEach((s,i)=>{const minY=Math.min(...s.rooms.map(r=>r[1]));s.rooms.forEach(([x,y,z])=>{matrix.makeTranslation((i-3.5)*9+x*.46,(y-minY)*.46+.23,-75-(i%3)*10+z*.46);buildings.setMatrixAt(index++,matrix);});});this.root.add(buildings);
    const rimLight=new THREE.DirectionalLight(0x7edfff,2);rimLight.position.set(-5,7,-4);this.root.add(rimLight);
    const fill=new THREE.DirectionalLight(preset.light,1);fill.position.set(1,5,8);this.root.add(fill);
  }
}
