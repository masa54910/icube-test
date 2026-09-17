import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {MEMO_COLOR_HEX,type MemoCube} from '../game/CubeMemo';
import {t} from '../i18n';
import './mini-memo.css';

export function miniColor(c:MemoCube,_hintUsed:boolean):number {
 if(c.hintState==='origin'&&c.color==='cyan')return 0x69dcf3;
 return MEMO_COLOR_HEX[c.color];
}
export function fitMini(cubes:readonly Pick<MemoCube,'x'|'y'|'z'>[],aspect:number,yaw=Math.PI/4,pitch=Math.atan(1.05/Math.sqrt(2))){
 const bounds=new THREE.Box3();for(const c of cubes){bounds.expandByPoint(new THREE.Vector3(c.x-.52,c.y-.52,c.z-.52));bounds.expandByPoint(new THREE.Vector3(c.x+.52,c.y+.52,c.z+.52));}
 if(bounds.isEmpty())bounds.set(new THREE.Vector3(-.5,-.5,-.5),new THREE.Vector3(.5,.5,.5));
 const center=bounds.getCenter(new THREE.Vector3()),direction=new THREE.Vector3(Math.sin(yaw)*Math.cos(pitch),Math.sin(pitch),Math.cos(yaw)*Math.cos(pitch)),right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw)),up=new THREE.Vector3().crossVectors(direction,right);
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
 private quiz=false;
 private yaw=Math.PI/4;
 private pitch=Math.atan(1.05/Math.sqrt(2));
 constructor(open:()=>void){
  this.root.className='mini-memo hidden';this.root.type='button';this.host.className='mini-memo-viewport';this.root.append(this.label,this.host,this.caption);this.root.onclick=()=>{if(!this.root.classList.contains('mini-quiz'))open();};
  let pointer:number|null=null,x=0,y=0;
  this.root.addEventListener('pointerdown',e=>{if(!this.root.classList.contains('mini-quiz')||pointer!==null)return;pointer=e.pointerId;x=e.clientX;y=e.clientY;this.root.setPointerCapture(pointer);e.preventDefault();});
  this.root.addEventListener('pointermove',e=>{if(e.pointerId!==pointer)return;this.yaw-=(e.clientX-x)*.012;this.pitch=Math.max(-1.5,Math.min(1.5,this.pitch+(e.clientY-y)*.012));x=e.clientX;y=e.clientY;this.dirty=true;this.render();});
  const end=()=>{pointer=null;};this.root.addEventListener('pointerup',end);this.root.addEventListener('pointercancel',end);this.root.addEventListener('lostpointercapture',end);
  this.root.addEventListener('keydown',e=>{if(!this.root.classList.contains('mini-quiz'))return;if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();e.stopPropagation();if(e.key==='Home'){this.yaw=Math.PI/4;this.pitch=Math.atan(1.05/Math.sqrt(2));}else{this.yaw+=e.key==='ArrowLeft'?.15:e.key==='ArrowRight'?-.15:0;this.pitch=Math.max(-1.5,Math.min(1.5,this.pitch+(e.key==='ArrowUp'?.15:e.key==='ArrowDown'?-.15:0)));}this.dirty=true;this.render();});
  this.scene.background=new THREE.Color(0xf5f8fc);this.scene.add(this.mesh,new THREE.HemisphereLight(0xffffff,0x60718a,2));const light=new THREE.DirectionalLight(0xffffff,2.1);light.position.set(-3,6,5);this.scene.add(light);
  this.observer=new ResizeObserver(()=>{this.dirty=true;this.render();});this.observer.observe(this.host);this.refreshTexts();
 }
 sync(cubes:readonly MemoCube[],hintUsed:boolean){
  const signature=JSON.stringify([cubes,hintUsed]);if(signature===this.signature)return;this.signature=signature;this.cubes=cubes;const m=new THREE.Matrix4();
  cubes.forEach((c,i)=>{this.mesh.setMatrixAt(i,m.makeTranslation(c.x,c.y,c.z));this.mesh.setColorAt(i,new THREE.Color(miniColor(c,hintUsed)));});this.mesh.count=cubes.length;this.mesh.instanceMatrix.needsUpdate=true;if(this.mesh.instanceColor)this.mesh.instanceColor.needsUpdate=true;this.mesh.computeBoundingSphere();this.dirty=true;this.refreshTexts();
 }
 refreshTexts(){this.label.textContent=t('memo.mini.title');this.caption.textContent=t(this.quiz?'memo.previewRotate':this.cubes.length<=1?'memo.mini.empty':'memo.mini.open');const label=t(this.quiz?'memo.previewRotate':'memo.mini.open');this.root.setAttribute('aria-label',label);this.root.title=label;}
 show(visible:boolean){const quiz=this.root.classList.contains('mini-quiz');if(this.quiz!==quiz){this.quiz=quiz;this.refreshTexts();this.dirty=true;}if(this.visible!==visible){this.visible=visible;this.dirty=true;}this.root.classList.toggle('hidden',!visible);if(visible)this.render();}
 render(){
  if(!this.visible||!this.dirty||document.hidden||this.unavailable)return;const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;
  try{if(!this.renderer){this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:false});this.renderer.setPixelRatio(1);this.host.append(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-hidden','true');}}catch(error){this.unavailable=true;console.warn('Mini memo preview unavailable',error);return;}
  this.renderer.setSize(w,h,false);const fit=fitMini(this.cubes,w/h,this.yaw,this.pitch);this.camera.left=-fit.halfHeight*w/h;this.camera.right=-this.camera.left;this.camera.top=fit.halfHeight;this.camera.bottom=-fit.halfHeight;this.camera.near=.1;this.camera.far=fit.distance*3;this.camera.position.copy(fit.center).addScaledVector(fit.direction,fit.distance);this.camera.lookAt(fit.center);this.camera.updateProjectionMatrix();this.renderer.render(this.scene,this.camera);this.dirty=false;
 }
 dispose(){this.observer.disconnect();this.mesh.dispose();this.geometry.dispose();this.material.dispose();this.renderer?.dispose();this.renderer?.forceContextLoss();this.root.remove();}
}
