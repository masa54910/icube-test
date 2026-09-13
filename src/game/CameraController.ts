import * as THREE from 'three';
import { CONFIG } from '../config';
import type { WorldBuilder } from './WorldBuilder';
export type CameraMode='third-person'|'pov';
export class CameraController {
  mode:CameraMode='third-person';
  yaw=Math.PI/2;
  pitch=-.18;
  distance=2.8;
  private saved:{mode:CameraMode;yaw:number;pitch:number;distance:number;fov:number;position:THREE.Vector3;quaternion:THREE.Quaternion}|null=null;
  private restoreFrame=false;
  private transitionTime=0;
  private exitFollowTime=0;
  beginTopExitFollow():void {this.exitFollowTime=.3;}
  followTopExitYaw(target:number,dt:number):boolean {if(this.exitFollowTime<=0)return false;if(this.saved||this.restoreFrame)return true;const delta=Math.atan2(Math.sin(target-this.yaw),Math.cos(target-this.yaw));this.yaw+=delta*Math.min(1,dt/this.exitFollowTime);this.exitFollowTime=Math.max(0,this.exitFollowTime-dt);return true;}
  private readonly transitionFrom=new THREE.Vector3();
  get transitioning():boolean {return this.transitionTime>0;}
  constructor(readonly camera:THREE.PerspectiveCamera) {}
  get lookingUp():boolean { return this.saved!==null; }
  reset(yaw:number):void { this.exitFollowTime=0;this.saved=null;this.restoreFrame=false;this.transitionTime=0; this.mode='third-person';this.yaw=yaw;this.pitch=-.18;this.distance=2.8; }
  rotate(dx:number,dy:number):void { if(this.saved)return;this.yaw+=dx;this.pitch=THREE.MathUtils.clamp(this.pitch-dy,-1.35,1.35); }
  toggle():void { if(this.saved)return;this.transitionFrom.copy(this.camera.position);this.transitionTime=.24;this.mode=this.mode==='pov'?'third-person':'pov'; }
  followYaw(target:number,dt:number):void {
    if(this.saved||this.restoreFrame||this.mode!=='third-person')return;
    const delta=Math.atan2(Math.sin(target-this.yaw),Math.cos(target-this.yaw));
    this.yaw+=delta*(1-Math.exp(-24*dt));
  }
  setLookUp(active:boolean):void {
    if(active&&!this.saved) { this.restoreFrame=false;this.saved={mode:this.mode,yaw:this.yaw,pitch:this.pitch,distance:this.distance,fov:this.camera.fov,position:this.camera.position.clone(),quaternion:this.camera.quaternion.clone()};this.pitch=CONFIG.camera.lookUpPitch; }
    else if(!active&&this.saved) { const saved=this.saved;this.saved=null;this.mode=saved.mode;this.yaw=saved.yaw;this.pitch=saved.pitch;this.distance=saved.distance;this.camera.fov=saved.fov;this.camera.position.copy(saved.position);this.camera.quaternion.copy(saved.quaternion);this.camera.updateProjectionMatrix();this.camera.updateMatrixWorld();this.restoreFrame=true; }
  }
  update(position:THREE.Vector3,world:WorldBuilder,dt=1/60):void {
    if(this.restoreFrame){this.restoreFrame=false;return;}
    const target=position.clone().add(new THREE.Vector3(0,CONFIG.player.eyeHeight,0));
    const direction=new THREE.Vector3(Math.sin(this.yaw)*Math.cos(this.pitch),Math.sin(this.pitch),-Math.cos(this.yaw)*Math.cos(this.pitch));
    if(this.saved) this.camera.position.copy(target).addScaledVector(new THREE.Vector3(0,1,0),world.cameraDistance(target,new THREE.Vector3(0,1,0),CONFIG.player.height+.12-CONFIG.player.eyeHeight));
    else if(this.mode==='pov') this.camera.position.copy(target);
    else {
      const back=direction.clone().negate(); const length=world.cameraDistance(target,back,this.distance);
      this.camera.position.copy(target).addScaledVector(back,length);
    }
    if(this.transitionTime>0&&!this.saved){
      this.transitionTime=Math.max(0,this.transitionTime-dt);
      const t=1-this.transitionTime/.24,smooth=t*t*(3-2*t);
      this.camera.position.lerpVectors(this.transitionFrom,this.camera.position,smooth);
      // Keep interpolation collision-safe if the player moves next to a wall.
      const offset=this.camera.position.clone().sub(target),distance=offset.length();
      if(distance>.0001)this.camera.position.copy(target).addScaledVector(offset.normalize(),world.cameraDistance(target,offset,distance));
    }
    this.camera.lookAt(this.camera.position.clone().add(direction)); this.camera.updateMatrixWorld();
  }
}
