import * as T from 'three';
import type {StageDefinition} from '../types';
import type {PlayerController} from './PlayerController';
import {CONFIG} from '../config';
/** Distance-limited ground dash. Physics and collision remain owned by PlayerController. */
export class BoostPads{
 onStart:(()=>void)|null=null;
 onEnd:(()=>void)|null=null;
 readonly root=new T.Group();
 private pads:{position:T.Vector3;direction:T.Vector3;distance:number;material:T.MeshStandardMaterial;blocked:boolean;glow:number}[]=[];
 private active:{pad:BoostPads['pads'][number];start:T.Vector3;elapsed:number;last:T.Vector3;stuck:number}|null=null;
 private trail:T.Mesh|null=null;
 get boosting(){return this.active!==null;}
 build(stage:StageDefinition){this.clear();this.root.name='boost-pads';for(const b of stage.boostPads??[]){const position=new T.Vector3(...b.position).multiplyScalar(CONFIG.roomSize);position.y-=2.91;const direction=new T.Vector3(...b.direction),mat=new T.MeshStandardMaterial({color:0x65e7f4,emissive:0x10b9ed,emissiveIntensity:.35,roughness:.35});const group=new T.Group();group.position.copy(position);group.rotation.y=Math.atan2(direction.x,-direction.z);for(let i=0;i<3;i++)for(const sign of [-1,1]){const bar=new T.Mesh(new T.BoxGeometry(.65,.025,.10),mat);bar.position.set(sign*.22,.024-i*.02,.7-i*.65);bar.rotation.y=sign*.65;group.add(bar);}this.root.add(group);this.pads.push({position,direction,distance:b.distance*CONFIG.roomSize,material:mat,blocked:false,glow:0});}}
 update(dt:number,player:PlayerController,forward:number){
 player.boostMotion=null;
 if(this.trail)this.trail.visible=false;
 for(const p of this.pads){if(player.position.distanceTo(p.position)>2.3)p.blocked=false;p.glow=Math.max(0,p.glow-dt*2);p.material.emissiveIntensity=.25+p.glow;}
 if(!this.active&&!player.airborne&&!player.ladder&&forward>.2){const heading=new T.Vector3(Math.sin(player.yaw),0,-Math.cos(player.yaw));const p=this.pads.find(p=>!p.blocked&&Math.abs(player.position.y-p.position.y)<.3&&Math.hypot(player.position.x-p.position.x,player.position.z-p.position.z)<.9&&heading.dot(p.direction)>.8);if(p){p.blocked=true;this.active={pad:p,start:player.position.clone(),last:player.position.clone(),elapsed:0,stuck:0};}}
 const a=this.active;if(!a)return;const travelled=player.position.clone().sub(a.start).dot(a.pad.direction),remaining=a.pad.distance-travelled;
 a.elapsed+=dt;a.stuck=player.position.distanceTo(a.last)<.001?a.stuck+dt:0;a.last.copy(player.position);
 if(remaining<=.02||player.airborne||player.ladder||a.stuck>.25){this.active=null;this.onEnd?.();return;}
 const base=CONFIG.player.walkSpeed*CONFIG.player.jogMultiplier,blend=Math.min(1,a.elapsed/.25,Math.max(0,remaining/6));const speed=Math.min(base*(1+1.4*blend),remaining/dt);
 player.boostMotion=a.pad.direction.clone().multiplyScalar(speed);a.pad.glow=.65;if(a.elapsed===dt)this.onStart?.();
 if(!this.trail){this.trail=new T.Mesh(new T.BoxGeometry(.16,.012,1.5),new T.MeshBasicMaterial({color:0x62dff4,transparent:true,opacity:.22,depthWrite:false}));this.root.add(this.trail);}
 this.trail.visible=true;this.trail.position.copy(player.position).addScaledVector(a.pad.direction,-.8);this.trail.position.y=a.pad.position.y+.035;this.trail.rotation.y=Math.atan2(a.pad.direction.x,-a.pad.direction.z);
 }
 clear(){this.active=null;this.trail=null;this.root.removeFromParent();this.root.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});this.root.clear();this.pads=[];}
}
