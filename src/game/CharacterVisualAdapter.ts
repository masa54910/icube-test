import type {Group,Vector3} from 'three';
/** Rendering/animation port. Implement with AnimationMixer clips in Phase B;
 * no collision, movement integration, quiz or save ownership belongs here. */
export interface CharacterVisualAdapter {
  readonly root:Group;
  update(position:Vector3,yaw:number,speed:number,dt:number,climbing?:boolean,turnRate?:number,airborne?:boolean):void;
}
