import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import type {MemoCube} from '../game/CubeMemo';
import {fitMini,miniColor} from './MiniMemoView';
import {t} from '../i18n';
import './memo-confirmation.css';
/** Read-only snapshot renderer. Shares the Mini Memo fitting/color helpers, not editor input. */
export class MemoConfirmation {
 readonly root=document.createElement('section');
 private host:HTMLElement;private renderer:T.WebGLRenderer|null=null;
 private scene=new T.Scene();private camera=new T.OrthographicCamera();
 private geometry=new RoundedBoxGeometry(.96,.96,.96,1,.035);
 private material=new T.MeshStandardMaterial({roughness:.38,metalness:.04});
 private mesh=new T.InstancedMesh(this.geometry,this.material,256);
 private observer:ResizeObserver;private cubes:readonly MemoCube[]=[];private active=false;private busy=false;private dirty=true;
 constructor(private yes:()=>void,private back:()=>void){
  this.root.className='memo-confirmation hidden';this.root.setAttribute('role','dialog');this.root.setAttribute('aria-modal','true');this.root.setAttribute('aria-labelledby','memo-confirm-title');
  this.root.innerHTML='<div class="memo-confirm-panel"><h2 id="memo-confirm-title" data-confirm="title"></h2><div class="memo-confirm-preview"></div><p class="memo-confirm-message" role="status" data-confirm="message"></p><div class="memo-confirm-actions"><button class="memo-confirm-yes" data-confirm="yes"></button><button class="memo-confirm-back" data-confirm="back"></button></div></div>';
  this.host=this.root.querySelector('.memo-confirm-preview')!;
  this.root.querySelector('.memo-confirm-yes')!.addEventListener('click',()=>{if(this.active&&!this.busy)this.yes();});
  this.root.querySelector('.memo-confirm-back')!.addEventListener('click',()=>{if(this.active&&!this.busy)this.back();});
  this.root.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(!this.busy)this.back();}if(e.key==='Tab'){e.preventDefault();const buttons=[...this.root.querySelectorAll<HTMLButtonElement>('button:not(:disabled)')];buttons.find(b=>b!==document.activeElement)?.focus();}});
  this.scene.background=new T.Color(0xf5f8fc);this.scene.add(this.mesh,new T.HemisphereLight(0xffffff,0x697f99,2));const light=new T.DirectionalLight(0xffffff,3);light.position.set(-3,6,5);this.scene.add(light);
  this.observer=new ResizeObserver(()=>{this.dirty=true;this.render();});this.observer.observe(this.host);
 }
 show(cubes:readonly MemoCube[]){this.cubes=cubes;this.active=true;this.busy=false;this.root.classList.remove('hidden','incorrect');this.root.querySelectorAll('button').forEach(b=>b.disabled=false);const matrix=new T.Matrix4();cubes.forEach((c,i)=>{this.mesh.setMatrixAt(i,matrix.makeTranslation(c.x,c.y,c.z));this.mesh.setColorAt(i,new T.Color(miniColor(c,false)));});this.mesh.count=cubes.length;this.mesh.instanceMatrix.needsUpdate=true;if(this.mesh.instanceColor)this.mesh.instanceColor.needsUpdate=true;this.mesh.computeBoundingSphere();this.refreshTexts();this.dirty=true;this.render();this.root.querySelector<HTMLButtonElement>('.memo-confirm-back')!.focus();}
 lock(){this.busy=true;this.root.querySelectorAll('button').forEach(b=>b.disabled=true);}
 incorrect(){this.lock();this.root.classList.add('incorrect');this.refreshTexts();}
 refreshTexts(){this.root.querySelectorAll<HTMLElement>('[data-confirm]').forEach(e=>e.textContent=t('memo.confirm.'+e.dataset.confirm));if(this.root.classList.contains('incorrect'))this.root.querySelector('.memo-confirm-message')!.textContent=t('memo.answer.incorrect');}
 hide(){this.active=false;this.root.classList.add('hidden');}
 render(){if(!this.active||!this.dirty||document.hidden)return;const w=this.host.clientWidth,h=this.host.clientHeight;if(!w||!h)return;
  try{this.renderer??=new T.WebGLRenderer({antialias:true});}catch{this.host.textContent=t('memo.error');return;}
  if(!this.renderer.domElement.parentElement)this.host.append(this.renderer.domElement);this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.setSize(w,h,false);const fit=fitMini(this.cubes,w/h);this.camera.left=-fit.halfHeight*w/h;this.camera.right=-this.camera.left;this.camera.top=fit.halfHeight;this.camera.bottom=-fit.halfHeight;this.camera.near=.1;this.camera.far=fit.distance*3;this.camera.position.copy(fit.center).addScaledVector(fit.direction,fit.distance);this.camera.lookAt(fit.center);this.camera.updateProjectionMatrix();this.renderer.render(this.scene,this.camera);this.dirty=false;
 }
 dispose(){this.observer.disconnect();this.geometry.dispose();this.material.dispose();this.mesh.dispose();this.renderer?.dispose();this.renderer?.forceContextLoss();this.root.remove();}
}
