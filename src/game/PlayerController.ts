import * as THREE from 'three';
import { CONFIG } from '../config';
import type { LadderDefinition } from '../types';
import type { WorldBuilder } from './WorldBuilder';
import type { MovementInput } from './InputController';
import type { CameraMode } from './CameraController';
export class PlayerController {
 onJump:(()=>void)|null=null;
  readonly position=new THREE.Vector3();
  yaw=0;
  speed=0;
  boostMotion:THREE.Vector3|null=null;
  turnRate=0;
  ladderEdgeTurn=false;
  ladderCameraDelta=0;
  private reverseTarget:number|null=null;
  private backwardHeld=false;
  private velocityY=0;
  private grounded=false;
  private jumpHeld=false;
  private jumpActive=false;
  private readonly airVelocity=new THREE.Vector3();
  get airborne():boolean {return !this.grounded&&!this.activeLadder;}
  get movementState():'NORMAL'|'AIRBORNE'|'LADDER' {return this.activeLadder?'LADDER':this.airborne?'AIRBORNE':'NORMAL';}
  private activeLadder:LadderDefinition|null=null;
  private topExit:{from:THREE.Vector3;target:THREE.Vector3;time:number;ladder:LadderDefinition}|null=null;
  justCompletedTopExit=false;
  get exitingLadderTop():boolean {return this.topExit!==null;}
  private ladderCooldown=0;
  // A safe exit is already outside the volume. Re-entry requires a new command,
  // not merely an expired timer or a contact-volume boundary crossing.
  private releasedLadder:LadderDefinition|null=null;
  private exitInputReleased=false;
  private catchBlend:{target:THREE.Vector3;time:number}|null=null;
  private transfer:{target:LadderDefinition;from:THREE.Vector3;to:THREE.Vector3;progress:number;side:number;fromYaw:number}|null=null;
  get ladder():LadderDefinition|null { return this.activeLadder; }
  reset(position:THREE.Vector3,yaw=0):void {this.releasedLadder=null;this.topExit=null;this.justCompletedTopExit=false;this.position.copy(position);this.yaw=yaw;this.velocityY=0;this.grounded=false;this.activeLadder=null;this.transfer=null;this.ladderCooldown=0;this.reverseTarget=null;this.backwardHeld=false;this.speed=0;this.turnRate=0;this.jumpHeld=false;this.jumpActive=false;this.airVelocity.set(0,0,0);this.ladderEdgeTurn=false;}
  alignYaw(yaw:number):void {this.yaw=yaw;this.reverseTarget=null;this.backwardHeld=false;}
  rotate(delta:number):void {this.yaw+=delta;if(this.reverseTarget!==null)this.reverseTarget+=delta;}
  get turningAround():boolean {return this.reverseTarget!==null;}
  update(dt:number,world:WorldBuilder,input:MovementInput,heading:number,mode:CameraMode='pov'):void {
    if(dt<=0)return;
    this.justCompletedTopExit=false;
    if(this.releasedLadder){
      const movementIntent=Math.abs(input.forward)>.15||Math.abs(input.x)>.15||input.jump;
      if(!movementIntent)this.exitInputReleased=true;
      else if(this.exitInputReleased||(input.jump&&!this.jumpHeld)||(input.forward<-.15&&!this.backwardHeld)){this.releasedLadder=null;this.exitInputReleased=false;}
    }
    if(!this.activeLadder)this.catchBlend=null;
    this.ladderEdgeTurn=false;
    this.ladderCameraDelta=0;
    const before=this.position.clone(),oldYaw=this.yaw;
    const jumpPressed=!this.boostMotion&&input.jump&&!this.jumpHeld;this.jumpHeld=input.jump;
    const backwards=input.forward<-.1;
    // S is a turn-around command on the press edge, never a per-frame inversion.
    if(mode==='third-person'&&!this.activeLadder&&backwards&&!this.backwardHeld)this.reverseTarget=this.yaw+Math.PI;
    this.backwardHeld=backwards;
    const steps=Math.max(1,Math.ceil(dt/.012));for(let i=0;i<steps;i++)this.step(dt/steps,world,{...input,jump:jumpPressed&&i===0},heading,mode);
    this.speed=this.activeLadder?Math.min(1,Math.hypot(this.position.x-before.x,this.position.y-before.y,this.position.z-before.z)/(CONFIG.player.ladderSpeed*dt)):Math.min(1,Math.hypot(this.position.x-before.x,this.position.z-before.z)/(CONFIG.player.walkSpeed*CONFIG.player.jogMultiplier*dt));
    this.turnRate=mode==='third-person'?(this.yaw-oldYaw)/dt:0;
  }
  private step(dt:number,world:WorldBuilder,input:MovementInput,heading:number,mode:CameraMode):void {
    if(this.topExit){
      const e=this.topExit;e.time=Math.min(.36,e.time+dt);const t=e.time/.36,s=t*t*(3-2*t),next=e.from.clone().lerp(e.target,s);next.y+=Math.sin(Math.PI*t)*Math.max(0,.65-(e.from.y-e.target.y));
      if(!world.isNavigable(next))return; // Stay attached if a runtime obstruction appears.
      this.position.copy(next);this.velocityY=0;this.jumpActive=false;this.airVelocity.set(0,0,0);
      const yaw=Math.atan2(e.target.x-e.from.x,-(e.target.z-e.from.z));this.yaw+=Math.atan2(Math.sin(yaw-this.yaw),Math.cos(yaw-this.yaw))*Math.min(1,dt/Math.max(dt,.36-e.time));
      if(t===1&&world.hasSafeFloor(this.position)){this.yaw=yaw;this.releasedLadder=e.ladder;this.exitInputReleased=false;this.activeLadder=null;this.topExit=null;this.grounded=true;this.ladderCooldown=.5;this.reverseTarget=null;this.justCompletedTopExit=true;}
      return;
    }
    this.ladderCooldown=Math.max(0,this.ladderCooldown-dt);
    const direction=new THREE.Vector3();
    if(mode==='third-person'&&!this.activeLadder) {
      this.rotate(THREE.MathUtils.clamp(input.x+input.turn,-1,1)*CONFIG.player.turnSpeed*dt);
      if(this.reverseTarget!==null) {
        const error=this.reverseTarget-this.yaw;
        this.yaw+=THREE.MathUtils.clamp(error,-CONFIG.player.turnAroundSpeed*dt,CONFIG.player.turnAroundSpeed*dt);
        if(Math.abs(this.reverseTarget-this.yaw)<.00001)this.reverseTarget=null;
      }
      if(this.reverseTarget===null)direction.set(Math.sin(this.yaw),0,-Math.cos(this.yaw)).multiplyScalar(Math.abs(input.forward));
    } else {
      direction.set(Math.sin(heading)*input.forward+Math.cos(heading)*input.x,0,-Math.cos(heading)*input.forward+Math.sin(heading)*input.x);
      if(direction.lengthSq()>1)direction.normalize();
      if(direction.lengthSq()>.001&&mode==='pov'&&!this.activeLadder)this.yaw=Math.atan2(direction.x,-direction.z);
    }
    if(this.activeLadder) {
      const ladder=this.activeLadder;const bottom=ladder.from[1]*6-2.94;const top=ladder.to[1]*6-2.94;
      if(input.jump) {
        const target=this.position.y>=top-.025?world.ladderTopExitTarget(ladder,this.position):null;
        if(target){
          this.topExit={from:this.position.clone(),target,time:0,ladder};this.activeLadder=null;this.transfer=null;this.catchBlend=null;this.grounded=false;this.velocityY=0;this.airVelocity.set(0,0,0);this.onJump?.();return;
        }
        this.activeLadder=null;this.transfer=null;this.catchBlend=null;this.ladderCooldown=.5;this.launchJump(new THREE.Vector3(Math.sin(this.yaw),0,-Math.cos(this.yaw)),CONFIG.jump.ladderForwardSpeed);
      }
      else {
        if(this.catchBlend){
          const blend=this.catchBlend,portion=Math.min(1,dt/Math.max(dt,blend.time));
          this.position.lerp(blend.target,portion);
          const facing=ladder.facingYaw??0;this.yaw+=Math.atan2(Math.sin(facing-this.yaw),Math.cos(facing-this.yaw))*portion;
          blend.time-=dt;if(blend.time<=0)this.catchBlend=null;
          return;
        }
        if(this.transfer){
          const t=this.transfer;
          t.progress=THREE.MathUtils.clamp(t.progress+input.x*t.side*CONFIG.player.ladderTraverseSpeed*dt/Math.max(.1,t.from.distanceTo(t.to)),0,1);
          this.position.lerpVectors(t.from,t.to,t.progress);this.yaw=t.fromYaw+Math.atan2(Math.sin((t.target.facingYaw??0)-t.fromYaw),Math.cos((t.target.facingYaw??0)-t.fromYaw))*t.progress;
          this.velocityY=0;
          if(t.progress===1){this.activeLadder=t.target;this.transfer=null;}else if(t.progress===0)this.transfer=null;
          return;
        }
        // Rung-relative traverse. Keep attachment and height at the rail ends.
        const centerX=ladder.from[0]*6,centerZ=ladder.from[2]*6-1.35;
        const facing=ladder.facingYaw??0,c=Math.cos(facing),s=Math.sin(facing);
        const previousRung=(this.position.x-centerX)*c+(this.position.z-centerZ)*s;
        const nextX=previousRung+input.x*CONFIG.player.ladderTraverseSpeed*dt;
        const rung=THREE.MathUtils.clamp(nextX,-.62,.62);
        this.position.x=centerX+rung*c;
        this.position.z=centerZ+rung*s;this.reverseTarget=null;
        if(Math.abs(rung-previousRung)>.00001||Math.abs(input.forward)>.1)this.yaw+=Math.atan2(Math.sin(facing-this.yaw),Math.cos(facing-this.yaw))*(1-Math.exp(-12*dt));
        if(Math.abs(nextX)>.62&&Math.abs(input.x)>.1){
          const neighbor=world.adjacentLadder(ladder,Math.sign(input.x),this.position.y);
          if(neighbor){const side=Math.sign(input.x),angle=neighbor.facingYaw??0;this.transfer={target:neighbor,from:this.position.clone(),to:new THREE.Vector3(neighbor.from[0]*6-side*.62*Math.cos(angle),this.position.y,neighbor.from[2]*6-1.35-side*.62*Math.sin(angle)),progress:0,side,fromYaw:facing};}
          else {this.yaw=facing;this.ladderCameraDelta+=input.x*CONFIG.player.turnSpeed*dt;this.ladderEdgeTurn=true;}
        }
        const climbY=THREE.MathUtils.clamp(this.position.y+input.forward*CONFIG.player.ladderSpeed*dt,bottom,world.ladderClimbTop(ladder));
        const nextPosition=this.position.clone().setY(climbY);
        if(world.isNavigable(nextPosition))this.position.y=climbY;
        this.velocityY=0;
        // At the top, W/idle keeps the rail attached. Only Jump dismounts.
        if(this.position.y<=bottom+.001&&input.forward<0) {
          this.position.x+=.9*Math.sin(facing);this.position.z-=.9*Math.cos(facing);this.activeLadder=null;this.transfer=null;this.ladderCooldown=.7;this.grounded=true;
        }
        return;
      }
    }
    if(input.jump&&this.grounded)this.launchJump(direction);
    const movement=this.boostMotion&&!this.activeLadder&&!this.jumpActive?this.boostMotion.clone().multiplyScalar(dt):this.jumpActive?this.airVelocity.clone().multiplyScalar(dt):direction.multiplyScalar(CONFIG.player.walkSpeed*CONFIG.player.jogMultiplier*dt);
    world.moveAxis(this.position,'x',movement.x);
    world.moveAxis(this.position,'z',movement.z);
    const grabbed=this.airborne&&(this.jumpActive||this.velocityY<-.1)&&this.ladderCooldown===0?world.ladderGrabAt(this.position,movement.clone().divideScalar(dt)):null;
    if(grabbed&&grabbed.id!==this.releasedLadder?.id){
      this.activeLadder=grabbed;this.grounded=false;this.jumpActive=false;this.velocityY=0;this.airVelocity.set(0,0,0);this.reverseTarget=null;
      const facing=grabbed.facingYaw??0,c=Math.cos(facing),s=Math.sin(facing),x=grabbed.from[0]*6,z=grabbed.from[2]*6-1.35;
      this.yaw=facing;
      const rung=THREE.MathUtils.clamp((this.position.x-x)*c+(this.position.z-z)*s,-.62,.62);
      this.catchBlend={target:new THREE.Vector3(x+rung*c,this.position.y,z+rung*s),time:.12};return;
    }
    const ladder=world.ladderAt(this.position);
    const upperContact=ladder&&this.position.y>=ladder.to[1]*6-3.19;
    if(ladder&&ladder.id!==this.releasedLadder?.id&&!this.jumpActive&&this.ladderCooldown===0&&(upperContact||Math.abs(input.forward)>.15)) {
      const facing=ladder.facingYaw??0,x=ladder.from[0]*6,z=ladder.from[2]*6-1.35,c=Math.cos(facing),s=Math.sin(facing),rung=THREE.MathUtils.clamp((this.position.x-x)*c+(this.position.z-z)*s,-.62,.62);
      const target=new THREE.Vector3(x+rung*c,this.position.y,z+rung*s);
      // Near contact is necessary, but never permits a snap through solid geometry.
      const clear=[.25,.5,.75,1].every(t=>world.isNavigable(this.position.clone().lerp(target,t)));
      if(clear){this.activeLadder=ladder;this.grounded=false;this.velocityY=0;this.airVelocity.set(0,0,0);this.reverseTarget=null;this.yaw=facing;this.position.copy(target);return;}
    }
    this.velocityY-=CONFIG.jump.gravity*dt;
    const hit=world.moveAxis(this.position,'y',this.velocityY*dt);
    this.grounded=hit&&this.velocityY<0;
    if(this.grounded){this.jumpActive=false;this.airVelocity.set(0,0,0);}
    if(hit)this.velocityY=0;
  }
  private launchJump(direction:THREE.Vector3,forwardSpeed:number=CONFIG.jump.forwardSpeed):void {
    this.onJump?.();
    this.jumpActive=true;this.grounded=false;this.velocityY=CONFIG.jump.verticalSpeed;
    this.airVelocity.copy(direction);if(this.airVelocity.lengthSq()>.001)this.airVelocity.normalize().multiplyScalar(forwardSpeed);
  }
}
