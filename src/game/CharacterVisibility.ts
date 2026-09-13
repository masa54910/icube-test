import * as THREE from 'three';

/** Render-only safety volume, enclosing helmet, backpack and articulated limbs. */
export class CharacterVisibility {
  private readonly bounds=new THREE.Box3();
  private readonly previous=new THREE.Vector3();
  private readonly delta=new THREE.Vector3();
  private readonly hit=new THREE.Vector3();
  private readonly ray=new THREE.Ray();
  private initialized=false;
  private safeTime=0;
  reset():void {this.initialized=false;this.safeTime=0;}
  update(dt:number,camera:THREE.Vector3,player:THREE.Vector3,thirdPerson:boolean,blocked:boolean):boolean {
    // Includes near-plane margin and the widest normal / ladder animation poses.
    this.bounds.min.set(player.x-.72,player.y-.18,player.z-.72);
    this.bounds.max.set(player.x+.72,player.y+1.85,player.z+.72);
    let crossing=false;
    if(this.initialized){
      this.delta.subVectors(camera,this.previous);const length=this.delta.length();
      if(length>.0001){this.ray.set(this.previous,this.delta.multiplyScalar(1/length));crossing=this.ray.intersectBox(this.bounds,this.hit)!==null&&this.hit.distanceTo(this.previous)<=length;}
    }
    const unsafe=blocked||!thirdPerson||this.bounds.containsPoint(camera)||crossing;
    this.safeTime=unsafe?0:this.safeTime+dt;this.previous.copy(camera);this.initialized=true;
    return !unsafe&&this.safeTime>=.08;
  }
}
