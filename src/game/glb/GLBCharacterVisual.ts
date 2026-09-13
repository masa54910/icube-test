import * as T from 'three';
import {GLTFLoader,type GLTF} from 'three/addons/loaders/GLTFLoader.js';
import type {CharacterVisualAdapter} from '../CharacterVisualAdapter';
import {AnimationState,VISUAL_STATES,type VisualState,type ClipMap} from './AnimationState';

export const REQUIRED_BONES=['Root','Hips','Spine','Chest','Head','UpperArm_L','LowerArm_L','Hand_L','UpperArm_R','LowerArm_R','Hand_R','UpperLeg_L','LowerLeg_L','Foot_L','UpperLeg_R','LowerLeg_R','Foot_R'] as const;
export interface CandidateConfig {clips:ClipMap;boneNames?:Record<string,string>;height?:number;forwardYaw?:number}
export interface CandidateReport {bytes:number;triangles:number;skinnedMeshes:number;bones:string[];clips:{name:string;duration:number}[];materials:string[];textures:{width:number;height:number}[];missingBones:string[];missingStates:VisualState[];warnings:string[]}

/** Candidate rendering only. This module is deliberately not imported by Game. */
export class GLBCharacterVisual implements CharacterVisualAdapter {
  readonly root=new T.Group();readonly mixer:T.AnimationMixer;readonly report:CandidateReport;
  readonly stateMachine=new AnimationState();
  private actions=new Map<string,T.AnimationAction>();private action:T.AnimationAction|null=null;
  private geometries=new Set<T.BufferGeometry>();private materials=new Set<T.Material>();private textures=new Set<T.Texture>();private skeletons=new Set<T.Skeleton>();
  private lastY:number|null=null;private disposed=false;private pending:VisualState|null=null;
  constructor(readonly gltf:GLTF,readonly config:CandidateConfig,bytes=0){
    const bones:string[]=[],materials:string[]=[];let triangles=0,skinnedMeshes=0;
    gltf.scene.traverse(o=>{
      if(o instanceof T.Bone)bones.push(o.name);
      if(!(o instanceof T.Mesh))return;
      triangles+=(o.geometry.index?.count??o.geometry.getAttribute('position').count)/3*(o instanceof T.InstancedMesh?o.count:1);
      this.geometries.add(o.geometry);o.castShadow=o.receiveShadow=true;
      if(o instanceof T.SkinnedMesh){skinnedMeshes++;this.skeletons.add(o.skeleton);}
      for(const m of Array.isArray(o.material)?o.material:[o.material]){this.materials.add(m);materials.push(m.name||m.type);for(const v of Object.values(m))if(v instanceof T.Texture)this.textures.add(v);}
    });
    const box=new T.Box3().setFromObject(gltf.scene),size=box.getSize(new T.Vector3());
    const warnings:string[]=[];
    if(!Number.isFinite(size.y)||size.y<=0)warnings.push('Empty or invalid model bounds');
    const normalized=new T.Group();normalized.rotation.y=config.forwardYaw??0;normalized.scale.setScalar((config.height??1.42)/(size.y>0?size.y:1));
    const origin=new T.Group();if(Number.isFinite(box.min.y))origin.position.set(-(box.min.x+box.max.x)/2,-box.min.y,-(box.min.z+box.max.z)/2);
    origin.add(gltf.scene);normalized.add(origin);this.root.add(normalized);
    this.mixer=new T.AnimationMixer(gltf.scene);
    for(const clip of gltf.animations)this.actions.set(clip.name,this.mixer.clipAction(clip));
    const textures=[...this.textures].map(t=>({width:Number(t.image?.width)||0,height:Number(t.image?.height)||0}));
    if(textures.some(t=>Math.max(t.width,t.height)>2048))warnings.push('Texture exceeds 2K review threshold');
    if(triangles>50000)warnings.push('Character exceeds 50k triangles');
    if(!skinnedMeshes)warnings.push('No skinned mesh: not a formal rig candidate');
    if(bytes>10*1024*1024)warnings.push('GLB exceeds initial 10 MiB transfer review threshold');
    if(gltf.animations.some(c=>c.tracks.some(t=>/^(Root|Hips|Armature)\.(position|quaternion)$/.test(t.name))))warnings.push('Root/hips transform tracks: verify in-place motion and ground contact in viewer');
    this.report={bytes,triangles,skinnedMeshes,bones,clips:gltf.animations.map(c=>({name:c.name,duration:c.duration})),materials:[...new Set(materials)],textures,missingBones:REQUIRED_BONES.filter(b=>!bones.includes(config.boneNames?.[b]??b)),missingStates:VISUAL_STATES.filter(s=>!this.actions.has(config.clips[s]??'')),warnings};
  }
  play(state:VisualState):boolean {
    const next=this.actions.get(this.config.clips[state]??'');
    // Missing clips are reported; never substitute procedural bone rotations.
    if(!next)return false;
    if(next===this.action)return true;
    // Give a non-looping takeoff clip time to play instead of cancelling after one frame.
    if(state==='AIRBORNE'&&this.pending==='JUMP'&&this.action?.isRunning())return true;
    const once=state==='JUMP'||state.startsWith('LAND_');
    next.reset().setLoop(once?T.LoopOnce:T.LoopRepeat,once?1:Infinity);next.clampWhenFinished=once;
    next.setEffectiveWeight(1).setEffectiveTimeScale(1).play();
    if(this.action)next.crossFadeFrom(this.action,.15,false);
    this.action=next;this.pending=state;return true;
  }
  tick(dt:number):void {if(!this.disposed)this.mixer.update(Math.max(0,Math.min(dt,.05)));}
  update(position:T.Vector3,yaw:number,speed:number,dt:number,climbing=false,turnRate=0,airborne=false):void {
    if(this.disposed)return;
    const vy=this.lastY===null||dt<=0?0:(position.y-this.lastY)/dt;this.lastY=position.y;
    this.root.position.copy(position);this.root.rotation.y=-yaw;
    this.play(this.stateMachine.update(dt,{speed,turnRate,climbing,airborne,verticalSpeed:vy}));this.tick(dt);
  }
  resetMotion():void {this.lastY=null;this.stateMachine.reset();this.mixer.stopAllAction();this.action=null;this.pending=null;}
  dispose():void {if(this.disposed)return;this.disposed=true;this.mixer.stopAllAction();this.mixer.uncacheRoot(this.gltf.scene);this.skeletons.forEach(s=>s.dispose());this.geometries.forEach(g=>g.dispose());this.materials.forEach(m=>m.dispose());this.textures.forEach(t=>t.dispose());this.root.removeFromParent();}
}

/** Self-contained local GLB only. Never fetch third-party texture / decoder URLs. */
export async function parseCandidate(bytes:ArrayBuffer,config:CandidateConfig):Promise<GLBCharacterVisual> {
  if(!config?.clips||typeof config.clips!=='object'||Object.values(config.clips).some(v=>typeof v!=='string')||!Number.isFinite(config.height??1.42)||(config.height??1.42)<=0||!Number.isFinite(config.forwardYaw??0))throw new Error('Invalid candidate mapping or normalization');
  if(bytes.byteLength<20||new DataView(bytes).getUint32(0,true)!==0x46546c67)throw new Error('A self-contained GLB file is required');
  const manager=new T.LoadingManager();manager.setURLModifier(url=>{if(/^(data:|blob:)/.test(url))return url;throw new Error('External resources are not allowed in the candidate GLB');});
  const gltf=await new GLTFLoader(manager).parseAsync(bytes,'');return new GLBCharacterVisual(gltf,config,bytes.byteLength);
}
