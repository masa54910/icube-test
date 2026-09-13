export const VISUAL_STATES=['IDLE','JOG','TURN_LEFT','TURN_RIGHT','JUMP','AIRBORNE','LAND_LIGHT','LAND_NORMAL','LAND_STRONG','LADDER_IDLE','LADDER_CLIMB'] as const;
export type VisualState=typeof VISUAL_STATES[number];
export type ClipMap=Partial<Record<VisualState,string>>;
export interface VisualFrame {speed:number;turnRate:number;airborne:boolean;climbing:boolean;verticalSpeed?:number}
/** Animation-only event history; never owns a collider or a physics velocity. */
export class AnimationState {
  private airborne=false;private fallSpeed=0;private landing=0;private landingState:VisualState='LAND_NORMAL';
  reset():void {this.airborne=false;this.fallSpeed=0;this.landing=0;}
  update(dt:number,f:VisualFrame):VisualState {
    this.landing=Math.max(0,this.landing-dt);
    if(this.airborne)this.fallSpeed=Math.max(this.fallSpeed,-(f.verticalSpeed??0));
    const takeoff=f.airborne&&!this.airborne,land=this.airborne&&!f.airborne&&!f.climbing;
    this.airborne=f.airborne;
    if(land){this.landing=.58;this.landingState=this.fallSpeed<4?'LAND_LIGHT':this.fallSpeed<8?'LAND_NORMAL':'LAND_STRONG';this.fallSpeed=0;}
    if(f.climbing){this.landing=0;this.fallSpeed=0;return f.speed>.04?'LADDER_CLIMB':'LADDER_IDLE';}
    if(f.airborne){this.landing=0;return takeoff?'JUMP':'AIRBORNE';}
    if(this.landing>0&&!(f.speed>.04&&this.landing<.30))return this.landingState;
    if(f.speed>.04)return 'JOG';
    return Math.abs(f.turnRate)>.04?(f.turnRate<0?'TURN_LEFT':'TURN_RIGHT'):'IDLE';
  }
}
