import * as THREE from 'three';
import {HomeWorld} from './HomeWorld';
export class HomePreview {
  private renderer:THREE.WebGLRenderer;
  private world=new HomeWorld();
  private camera=new THREE.PerspectiveCamera(40,1,.1,500);
  private reduced=matchMedia('(prefers-reduced-motion: reduce)');
  private time=0;
  private pending=0;
  private dirty=true;
  constructor(private canvas:HTMLCanvasElement) {
    this.renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:false});
    this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
    this.camera.position.set(0,3.4,18);this.camera.lookAt(0,4.5,0);
    this.reduced.addEventListener('change',()=>{this.dirty=true;});
    canvas.addEventListener('webglcontextrestored',()=>{this.dirty=true;});
  }
  render(dt:number):void {
    if(document.hidden)return;
    const {width,height,top,bottom}=this.canvas.getBoundingClientRect();if(width<1||height<1||bottom<0||top>innerHeight)return;
    const ratio=this.renderer.getPixelRatio();
    if(this.canvas.width!==Math.floor(width*ratio)||this.canvas.height!==Math.floor(height*ratio)) {
      this.renderer.setSize(width,height,false);this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.dirty=true;
      const halfWidth=Math.tan(THREE.MathUtils.degToRad(20))*18*this.camera.aspect;
      this.world.cross.position.x=halfWidth*.25;
      this.world.floor.material.uniforms.crossX!.value=this.world.cross.position.x;
      this.world.earth.position.set(halfWidth*2.65,28,-68);
      this.world.atmosphere.position.copy(this.world.earth.position);
    }
    this.pending+=dt;
    if(!this.dirty&&(this.reduced.matches||this.pending<1/30))return;
    if(!this.reduced.matches)this.time+=this.pending;this.pending=0;this.dirty=false;
    this.world.cross.rotation.y=.5+this.time*.07;
    this.world.cross.position.y=6.05+Math.sin(this.time*.7)*.045;
    this.world.reflection.position.copy(this.world.cross.position);this.world.reflection.position.y*=-1;
    this.world.reflection.rotation.set(-this.world.cross.rotation.x,this.world.cross.rotation.y,-this.world.cross.rotation.z);this.world.reflection.scale.y=-1;
    this.renderer.render(this.world.scene,this.camera);
  }
}
