import * as THREE from 'three';
import {CONFIG} from '../config';
import type {WorldBuilder} from './WorldBuilder';
import type {PlayerController} from './PlayerController';
import {LANDING_COMPRESSION_START,landingStrength} from './LandingPose';

/** Reusable local effects. No geometry is allocated when an event fires. */
export class WorldFeedback {
  readonly root=new THREE.Group();
  readonly counters={voxel:0,land:0,catch:0};
  onEvent:((event:'voxel'|'land'|'catch')=>void)|null=null;
  private readonly glow=new THREE.MeshStandardMaterial({color:0xa5edfa,emissive:0x36bed6,emissiveIntensity:.5,roughness:.8});
  private seams:{mesh:THREE.Mesh;material:THREE.Material|THREE.Material[];box:THREE.Box3}[]=[];
  private active:typeof this.seams=[];
  private previous=new THREE.Vector3();
  private initialized=false;
  private airborneTime=0;
  private wasAirborne=false;
  private cooldown=0;
  private seamTime=0;
  private landTime=0;
  private landDelay=0;
  private fallSpeed=0;
  private landScale=1;
  private catchTime=0;
  private readonly ring=new THREE.Mesh(new THREE.RingGeometry(.24,.28,32),new THREE.MeshBasicMaterial({color:0x94e6f4,transparent:true,opacity:0,depthWrite:false,side:THREE.DoubleSide}));
  private readonly catchLight=new THREE.Mesh(new THREE.BoxGeometry(.9,.045,.045),new THREE.MeshBasicMaterial({color:0x80e1ee,transparent:true,opacity:0,depthWrite:false}));
  constructor(){this.root.name='local-feedback';this.ring.material.forceSinglePass=true;this.ring.rotation.x=-Math.PI/2;this.root.add(this.ring,this.catchLight);this.ring.visible=this.catchLight.visible=false;}
  reset(world:WorldBuilder):void {
    this.restore();this.seams=[];this.initialized=false;this.airborneTime=0;this.wasAirborne=false;this.cooldown=0;this.seamTime=this.landTime=this.catchTime=0;
    this.ring.visible=this.catchLight.visible=false;
    this.landDelay=this.fallSpeed=0;this.landScale=1;
    world.world?.root.traverse(o=>{if(o instanceof THREE.Mesh&&o.material instanceof THREE.MeshStandardMaterial&&o.material.color.getHex()===CONFIG.colors.grid)this.seams.push({mesh:o,material:o.material,box:new THREE.Box3().setFromObject(o)});});
  }
  private restore():void {for(const s of this.active)s.mesh.material=s.material;this.active=[];}
  update(dt:number,world:WorldBuilder,player:PlayerController,reduced=false):void {
    this.cooldown=Math.max(0,this.cooldown-dt);
    if(this.seamTime>0){this.seamTime-=dt;this.glow.emissiveIntensity=(reduced?.18:.5)*Math.max(0,this.seamTime/.24);if(this.seamTime<=0)this.restore();}
    if(this.initialized){
      if(player.airborne)this.airborneTime+=dt;
      if(this.wasAirborne&&dt>0)this.fallSpeed=Math.max(this.fallSpeed,(this.previous.y-player.position.y)/dt);
      if(this.wasAirborne&&!player.airborne){
        if(player.ladder){
          this.catchTime=.28;const l=player.ladder,a=l.facingYaw??0,y0=Math.min(l.from[1],l.to[1])*6-2.45;
          const y=y0+Math.round((player.position.y+.85-y0)/.45)*.45;
          this.catchLight.position.set(l.from[0]*6+.085*Math.sin(a),y,l.from[2]*6-1.7-.085*Math.cos(a));this.catchLight.rotation.y=-a;this.counters.catch++;this.onEvent?.('catch');
        }else if(this.airborneTime>=.22){this.landDelay=LANDING_COMPRESSION_START;this.landScale=1+.18*landingStrength(this.fallSpeed);this.ring.position.copy(player.position);this.ring.position.y+=.025;this.counters.land++;this.onEvent?.('land');}
        this.airborneTime=0;
        this.fallSpeed=0;
      }
      if(this.cooldown===0){
        const old=world.roomAt(this.previous),now=world.roomAt(player.position);
        if(old&&now){const axis=old.findIndex((v,i)=>v!==now[i]);if(axis>=0&&old.reduce((sum,v,i)=>sum+Math.abs(v-now[i]!),0)===1){
          const a=(['x','y','z'] as const)[axis]!,plane=(old[axis]!+now[axis]!)*3;
          this.restore();for(const s of this.seams){const center=s.box.getCenter(new THREE.Vector3());if(Math.abs(center[a]-plane)<.13&&s.box.max[a]-s.box.min[a]<.15&&center.distanceTo(player.position)<7.8){s.mesh.material=this.glow;this.active.push(s);}}
          this.seamTime=.24;this.glow.emissiveIntensity=reduced?.18:.5;this.cooldown=.8;if(this.active.length){this.counters.voxel++;this.onEvent?.('voxel');}
        }}
      }
    }
    if(this.landDelay>0){this.landDelay=Math.max(0,this.landDelay-dt);if(this.landDelay===0)this.landTime=.34;}
    this.landTime=Math.max(0,this.landTime-dt);this.ring.visible=this.landTime>0;this.ring.scale.setScalar((reduced?1.2:1+(1-this.landTime/.34)*2)*this.landScale);this.ring.material.opacity=(reduced?.12:.24)*this.landTime/.34;
    this.catchTime=Math.max(0,this.catchTime-dt);this.catchLight.visible=this.catchTime>0;this.catchLight.material.opacity=(reduced?.18:.42)*this.catchTime/.28;
    this.previous.copy(player.position);this.wasAirborne=player.airborne;this.initialized=true;
  }
}
