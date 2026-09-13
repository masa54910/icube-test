import {Group,type Vector3} from 'three';
import type {CharacterVisualAdapter} from '../CharacterVisualAdapter';
import {GLBCharacterVisual,parseCandidate,type CandidateConfig} from './GLBCharacterVisual';

/** Stable render boundary. Preloading does not adopt a candidate or delay fallback. */
export class CharacterVisualSlot implements CharacterVisualAdapter {
  readonly root=new Group();private candidate:GLBCharacterVisual|null=null;private active:CharacterVisualAdapter;
  private pending:Promise<boolean>|null=null;private generation=0;lastError:string|null=null;
  constructor(readonly fallback:CharacterVisualAdapter){this.active=fallback;this.root.add(fallback.root);}
  preload(source:()=>Promise<ArrayBuffer>,config:CandidateConfig,timeoutMs=12000):Promise<boolean>{
    if(this.candidate)return Promise.resolve(true);if(this.pending)return this.pending;
    const generation=this.generation;
    this.pending=(async()=>{let timer:ReturnType<typeof setTimeout>|undefined;try{const bytes=await Promise.race([source(),new Promise<never>((_,reject)=>{timer=setTimeout(()=>reject(new Error('GLB preload timed out')),timeoutMs);})]);const visual=await parseCandidate(bytes,config);if(generation!==this.generation){visual.dispose();return false;}this.candidate=visual;visual.root.visible=false;this.root.add(visual.root);this.lastError=null;return true;}catch(error){if(generation===this.generation)this.lastError=error instanceof Error?error.message:String(error);return false;}finally{clearTimeout(timer);if(generation===this.generation)this.pending=null;}})();
    return this.pending;
  }
  get report(){return this.candidate?.report??null;}
  /** Viewer preview only; never wired to Gameplay defaults or save data. */
  previewCandidate():boolean {if(!this.candidate)return false;this.active.root.visible=false;this.active=this.candidate;this.active.root.visible=true;this.candidate.resetMotion();return true;}
  useFallback():void {this.active.root.visible=false;this.active=this.fallback;this.active.root.visible=true;}
  update(p:Vector3,yaw:number,speed:number,dt:number,climbing=false,turn=0,airborne=false):void {this.active.update(p,yaw,speed,dt,climbing,turn,airborne);}
  disposeCandidate():void {this.generation++;this.pending=null;this.useFallback();this.candidate?.dispose();this.candidate=null;}
}
