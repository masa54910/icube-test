import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import type {MemoCube} from '../game/CubeMemo';
import {t} from '../i18n';
import './mini-memo.css';

export function miniColor(c:MemoCube,hintUsed:boolean):number {
 if(c.hintState==='correct'||c.hintState==='origin')return 0x69dcf3;
 return hintUsed?0xf7f9fc:({white:0xf7f9fc,navy:0x17314f,blue:0x2868cc,cyan:0x18bde4,lightblue:0xb9e9f4}[c.color]);
}
export function fitMini(cubes:readonly Pick<MemoCube,'x'|'y'|'z'>[],aspect:number){
 const bounds=new THREE.Box3();for(const c of cubes){bounds.expandByPoint(new THREE.Vector3(c.x-.52,c.y-.52,c.z-.52));bounds.expandByPoint(new THREE.Vector3(c.x+.52,c.y+.52,c.z+.52));}
 if(bounds.isEmpty())bounds.set(new THREE.Vector3(-.5,-.5,-.5),new THREE.Vector3(.5,.5,.5));
 const center=bounds.getCenter(new THREE.Vector3()),direction=new THREE.Vector3(1,1.05,1).normalize(),right=new THREE.Vector3(1,0,-1).normalize(),up=new THREE.Vector3().crossVectors(direction,right);
 let w=0,h=0;for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){const p=new THREE.Vector3(x,y,z).sub(center);w=Math.max(w,Math.abs(p.dot(right)));h=Math.max(h,Math.abs(p.dot(up)));}
 return {center,direction,halfHeight:Math.max(h,w/Math.max(.1,aspect)) *1.2,distance:bounds.getSize(new THREE.Vector3()).length()+4};
}
/** One extra context, reused for the session. Rendering only on dirty data/resize/show. */
export class MiniMemoView {
 readonly root=document.createElement('button');
 private host=document.createElement('span');
 private label=document.createElement('strong');
 private caption=document.createElement('small');
 private renderer:THREE.WebGLRenderer|null=null;
 private unavailable=false;
 private scene=new THREE.Scene();
 private camera=new THREE.OrthographicCamera();
 private geometry=new RoundedBoxGeometry(.96,.96,.96,1,.035);
 private material=new THREE.MeshLambertMaterial();
 private mesh=new THREE.InstancedMesh(this.geometry,this.material,256);
 private observer:ResizeObserver;
 private cubes:readonly MemoCube[]=[];
 private signature='';
 private dirty=true;
 private visible=false;
 constructor(open:()=>void){
  this.root.className='mini-memo hidden';this.root.type='button';this.host.className='mini-memo-viewport';this.root.append(this.label,this.host,this.caption);this.root.onclick=open;
  this.scene.background=new THREE.Color(0xf5f8fc);this.scene.add(this.mesh,new THREE.HemisphereLight(0xffffff,0x60718a,2));const light=new THREE.DirectionalLight(0xffffff,2.1);light.position.set(-3,6,5);this.scene.add(light);
  this.observer=new ResizeObserver(()=>{this.dirty=true;this.render();});this.observer.observe(this.host);this.refreshTexts();
 }
 sync(cubes:readonly MemoCube[],hintUsed:boolean){
  const signature=JSON.stringify([cubes,hintUsed]);if(signature===this.signature)return;this.signature=signature;this.cubes=cubes;const m=new THREE.Matrix4();
  cubes.forEach((c,i)=>{this.mesh.setMatrixAt(i,m.makeTranslation(c.x,c.y,c.z));this.mesh.setColorAt(i,new THREE.Color(miniColor(c,hintUsed)));});this.mesh.count=cubes.length;this.mesh.instanceMatrix.needsUpdate=true;if(this.mesh.instanceColor)this.mesh.instanceColor.needsUpdate=true;this.mesh.computeBoundingSphere();this.dirty=true;this.refreshTexts();
 }
 refreshTexts(){this.label.textContent=t('memo.mini.title');this.caption.textContent=t(this.cubes.length<=1?'memo.mini.empty':'memo.mini.open');this.root.setAttribute('aria-label',t('memo.mini.open'));this.root.title=t('memo.mini.open');}
 show(visible:boolean){if(this.visible!==visible){this.visible=visible;this.dirty=true;}this.root.classList.toggle('hidden',!visible);if(visible)this.render();}
 render(){
  if(!this.visible||!this.dirty||document.hidden||this.unavailable)return;const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;
  try{if(!this.renderer){this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});this.renderer.setPixelRatio(1);this.host.append(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-hidden','true');}}catch(error){this.unavailable=true;console.warn('Mini memo preview unavailable',error);return;}
  this.renderer.setSize(w,h,false);const fit=fitMini(this.cubes,w/h);this.camera.left=-fit.halfHeight*w/h;this.camera.right=-this.camera.left;this.camera.top=fit.halfHeight;this.camera.bottom=-fit.halfHeight;this.camera.near=.1;this.camera.far=fit.distance*3;this.camera.position.copy(fit.center).addScaledVector(fit.direction,fit.distance);this.camera.lookAt(fit.center);this.camera.updateProjectionMatrix();this.renderer.render(this.scene,this.camera);this.dirty=false;
 }
 dispose(){this.observer.disconnect();this.mesh.dispose();this.geometry.dispose();this.material.dispose();this.renderer?.dispose();this.renderer?.forceContextLoss();this.root.remove();}
}
