import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {MEMO_LIMIT,type CubeMemoStore,type MemoColor,type MemoCube} from '../game/CubeMemo';

export type MemoDisplay='normal'|'wire'|'hide';
type Point={x:number;y:number;z:number};
type Face={cube:MemoCube;axis:'x'|'y'|'z';sign:number};
const COLORS:Record<MemoColor,number>={white:0xf8fbff,navy:0x123653,blue:0x3166ec,cyan:0x20c1e9,lightblue:0x9cecff};
/** One isolated renderer, created lazily. No gameplay camera or scene references. */
export class MemoViewport {
 readonly renderer=new T.WebGLRenderer({antialias:true,alpha:false,preserveDrawingBuffer:true});
 readonly camera=new T.PerspectiveCamera(38,1,.1,180);
 private scene=new T.Scene();
 private geometry=new RoundedBoxGeometry(.97,.97,.97,2,.035);
 private material=new T.MeshStandardMaterial({color:0xffffff,roughness:.32,metalness:.08});
 private bodies=new T.InstancedMesh(this.geometry,this.material,MEMO_LIMIT);
 private edges=new T.Group();
 private edgeGeometry=new T.EdgesGeometry(new T.BoxGeometry(.978,.978,.978));
 private seam=new T.LineBasicMaterial({color:0x93bdcf,transparent:true,opacity:.44});
 private hintMat=new T.LineBasicMaterial({color:0x00cdec,transparent:true,opacity:1});
 private selectedLine=new T.LineSegments(this.edgeGeometry,new T.LineBasicMaterial({color:0x067bfc}));
 private facePlane=new T.Mesh(new T.PlaneGeometry(.90,.90),new T.MeshBasicMaterial({color:0x22ccef,transparent:true,opacity:.28,side:T.DoubleSide,depthWrite:false}));
 private ghosts=new T.InstancedMesh(this.geometry,new T.MeshBasicMaterial({color:0x20cfff,transparent:true,opacity:.34,depthWrite:false}),24);
 private invalid=new T.LineSegments(this.edgeGeometry,new T.LineBasicMaterial({color:0xd97979}));
 private shadowGeometry=new T.PlaneGeometry(1.9,1.9);
 private shadowMaterial:T.MeshBasicMaterial;
 private shadows=new T.Group();
 private ray=new T.Raycaster();
 private floor=new T.Plane(new T.Vector3(0,1,0),.5);
 private matrix=new T.Matrix4();
 private target=new T.Vector3(0,.3,0);
 private yaw=Math.PI/4;
 private pitch=.63;
 private radius=14;
 private dirty=true;
 private active=false;
 private floorObjects:T.Object3D[]=[];
 private floorY=-.5;
 private resizeObserver:ResizeObserver;
 private abort=new AbortController();
 private pointers=new Map<number,{x:number;y:number}>();
 private gesture:{kind:'orbit'|'stock'|'face';x:number;y:number;face?:Face;startX:number;startY:number}|null=null;
 private preview:Point[]=[];
 private pinchDistance=0;
 private axisScene=new T.Scene();
 private axisCamera=new T.OrthographicCamera(-1.8,1.8,1.8,-1.8,.1,20);
 private labels:T.Texture[]=[];
 selected='origin';
 selectedFace:Face|null=null;
 color:MemoColor='white';
 continuous=false;
 display:MemoDisplay='normal';
 constructor(private host:HTMLElement,private stock:HTMLButtonElement,private store:CubeMemoStore,private changed:()=>void){
  const canvas=this.renderer.domElement;canvas.className='memo-webgl';canvas.setAttribute('aria-label','CUBE MEMO 3D');this.host.prepend(canvas);
  this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.setClearColor(0xf5fbff);this.renderer.outputColorSpace=T.SRGBColorSpace;
  this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.2;
  this.scene.add(new T.HemisphereLight(0xffffff,0xa3c6df,1.5));const key=new T.DirectionalLight(0xffffff,3);key.position.set(-3,8,5);this.scene.add(key);const rim=new T.DirectionalLight(0x7addff,1.3);rim.position.set(5,3,-6);this.scene.add(rim);
  const ground=new T.Mesh(new T.PlaneGeometry(90,90),new T.MeshStandardMaterial({color:0xf0f8ff,roughness:.7}));ground.rotation.x=-Math.PI/2;ground.position.y=-.51;this.scene.add(ground);this.floorObjects.push(ground);
  const grid=new T.GridHelper(48,48,0x8596aa,0xd7dfe7);grid.position.y=-.499;this.scene.add(grid);this.floorObjects.push(grid);
  const major=new T.GridHelper(48,12,0x5e738e,0xb8c5d2);major.position.y=-.497;(major.material as T.LineBasicMaterial).transparent=true;(major.material as T.LineBasicMaterial).opacity=.45;this.scene.add(major);this.floorObjects.push(major);
  this.scene.fog=new T.Fog(0xf5fbff,24,65);
  const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d')!;const g=ctx.createRadialGradient(32,32,0,32,32,32);g.addColorStop(0,'rgba(26,69,101,.25)');g.addColorStop(1,'rgba(26,69,101,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);const texture=new T.CanvasTexture(c);this.labels.push(texture);this.shadowMaterial=new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false});
  this.bodies.instanceMatrix.setUsage(T.DynamicDrawUsage);this.scene.add(this.bodies,this.edges,this.shadows,this.ghosts,this.selectedLine,this.facePlane,this.invalid);this.ghosts.count=0;this.invalid.visible=false;this.facePlane.visible=false;
  const start=this.label('START','#0576ab',256,70);start.material.depthTest=true;start.position.set(0,.58,0);start.scale.set(.68,.19,1);this.scene.add(start);
  const axisBox=new T.Mesh(new T.BoxGeometry(.55,.55,.55),[0xb9d9eb,0xdbf4ff,0xffffff,0xa2c7dc,0xc3e1ed,0xe5f6ff].map(color=>new T.MeshBasicMaterial({color})));this.axisScene.add(axisBox);
  for(const [v,color,name] of [[new T.Vector3(1,0,0),0xff4949,'X'],[new T.Vector3(0,1,0),0x20ac54,'Y'],[new T.Vector3(0,0,1),0x2479fb,'Z']] as const){this.axisScene.add(new T.ArrowHelper(v,new T.Vector3(),1.08,color,.22,.12));const s=this.label(name,'#'+color.toString(16).padStart(6,'0'));s.position.copy(v).multiplyScalar(1.4);s.scale.set(.55,.55,1);this.axisScene.add(s);}
  const env=document.createElement('canvas');env.width=512;env.height=256;const ec=env.getContext('2d')!;const eg=ec.createLinearGradient(0,0,0,256);eg.addColorStop(0,'#d9f1ff');eg.addColorStop(.5,'#f8fcff');eg.addColorStop(1,'#658da8');ec.fillStyle=eg;ec.fillRect(0,0,512,256);ec.fillStyle='#ffffff';ec.fillRect(80,25,50,110);ec.fillRect(320,35,90,60);const environment=new T.CanvasTexture(env);environment.mapping=T.EquirectangularReflectionMapping;environment.colorSpace=T.SRGBColorSpace;this.scene.environment=environment;this.scene.environmentIntensity=.18;this.labels.push(environment);
  this.captureStock();this.sync();
  const options={signal:this.abort.signal};
  canvas.addEventListener('contextmenu',e=>e.preventDefault(),options);
  canvas.addEventListener('pointerdown',e=>this.down(e),options);
  canvas.addEventListener('pointermove',e=>this.move(e),options);
  canvas.addEventListener('pointerup',e=>this.up(e),options);
  canvas.addEventListener('pointercancel',()=>this.cancel(),options);
  canvas.addEventListener('wheel',e=>{e.preventDefault();this.radius=T.MathUtils.clamp(this.radius*Math.exp(e.deltaY*.001),4,55);this.dirty=true;},{...options,passive:false});
  const dock=document.createElement('button');dock.className='memo-stock-dock';dock.dataset.memoLabel='stock.drag';dock.setAttribute('aria-label',stock.getAttribute('aria-label')??'Cube');dock.append(stock.firstElementChild!.cloneNode(true));this.host.append(dock);
  for(const source of [stock,dock]){
  source.addEventListener('pointerdown',e=>{if(!this.active||e.button!==0)return;e.preventDefault();source.setPointerCapture(e.pointerId);this.gesture={kind:'stock',x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};},options);
  source.addEventListener('pointermove',e=>{if(this.gesture?.kind==='stock'){e.preventDefault();this.stockPreview(e.clientX,e.clientY);}},options);
  source.addEventListener('pointerup',e=>this.up(e),options);source.addEventListener('pointercancel',()=>this.cancel(),options);
  }
  this.resizeObserver=new ResizeObserver(()=>{this.resize();});this.resizeObserver.observe(host);
 }
 private label(text:string,color:string,width=64,height=64){const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d')!;x.font=`700 ${height*.64}px system-ui`;x.fillStyle=color;x.textAlign='center';x.textBaseline='middle';x.fillText(text,width/2,height/2);const map=new T.CanvasTexture(c);this.labels.push(map);return new T.Sprite(new T.SpriteMaterial({map,depthTest:false,transparent:true}));}
 private captureStock(){
  // Same beveled geometry/PBR light rig; rendered once, not a CSS square.
  const scene=new T.Scene();scene.environment=this.scene.environment;scene.environmentIntensity=.18;scene.background=new T.Color(0xf5fbff);scene.add(new T.HemisphereLight(0xffffff,0x96b9db,1.5));const light=new T.DirectionalLight(0xffffff,3);light.position.set(-3,5,4);scene.add(light);const cube=new T.Mesh(this.geometry,this.material);scene.add(cube);const shadow=new T.Mesh(this.shadowGeometry,this.shadowMaterial);shadow.rotation.x=-Math.PI/2;shadow.position.y=-.51;scene.add(shadow);const outline=new T.LineSegments(this.edgeGeometry,this.seam);scene.add(outline);
  const camera=new T.PerspectiveCamera(35,1,.1,10);camera.position.set(2,1.6,2.3);camera.lookAt(0,0,0);this.renderer.setSize(220,220,false);this.renderer.render(scene,camera);
  const img=document.createElement('img');img.src=this.renderer.domElement.toDataURL('image/png');img.alt='';img.draggable=false;this.stock.replaceChildren(img);
 }
 setActive(value:boolean){this.active=value;if(value){this.resize();this.dirty=true;}else this.cancel();}
 private resize(){const r=this.host.getBoundingClientRect();if(r.width<1||r.height<1)return;this.renderer.setSize(r.width,r.height,false);this.camera.aspect=r.width/r.height;this.camera.updateProjectionMatrix();this.dirty=true;}
 reset(){this.yaw=Math.PI/4;this.pitch=.63;const bounds=new T.Box3();this.store.cubes.forEach(c=>bounds.expandByPoint(new T.Vector3(c.x,c.y,c.z)));bounds.getCenter(this.target);this.target.y+=.3;this.radius=Math.max(14,bounds.getSize(new T.Vector3()).length()*2.6);this.dirty=true;}
 render(){if(!this.active||!this.dirty)return;this.camera.position.set(this.target.x+Math.sin(this.yaw)*Math.cos(this.pitch)*this.radius,this.target.y+Math.sin(this.pitch)*this.radius,this.target.z+Math.cos(this.yaw)*Math.cos(this.pitch)*this.radius);this.camera.lookAt(this.target);this.camera.updateMatrixWorld();this.renderer.setScissorTest(false);this.renderer.setViewport(0,0,this.host.clientWidth,this.host.clientHeight);this.renderer.render(this.scene,this.camera);
  const size=Math.min(130,this.host.clientWidth*.27);this.axisCamera.position.copy(this.camera.position).sub(this.target).normalize().multiplyScalar(5);this.axisCamera.lookAt(0,0,0);this.renderer.autoClear=false;this.renderer.clearDepth();this.renderer.setViewport(this.host.clientWidth-size-8,this.host.clientHeight-size-8,size,size);this.renderer.render(this.axisScene,this.axisCamera);this.renderer.autoClear=true;this.dirty=false;
 }
 sync(){
  this.floorY=Math.min(0,...this.store.cubes.map(c=>c.y))-.5;this.floor.constant=-this.floorY;this.floorObjects.forEach((o,i)=>o.position.y=this.floorY+[-.01,.001,.003][i]!);
  this.edges.clear();this.shadows.clear();this.bodies.count=this.store.cubes.length;this.bodies.visible=this.display!=='wire';
  const color=new T.Color();this.store.cubes.forEach((c,i)=>{this.matrix.makeTranslation(c.x,c.y,c.z);this.bodies.setMatrixAt(i,this.matrix);color.setHex(this.store.hintUsed?(c.hintState==='correct'||c.id==='origin'?0xb1f4ff:COLORS.white):c.id==='origin'?0xd9f8ff:this.display==='hide'?COLORS.white:COLORS[c.color]);this.bodies.setColorAt(i,color);
   const edge=new T.LineSegments(this.edgeGeometry,c.hintState==='correct'?this.hintMat:this.seam);edge.position.set(c.x,c.y,c.z);this.edges.add(edge);
   if(!this.store.has(c.x,c.y-1,c.z)){const s=new T.Mesh(this.shadowGeometry,this.shadowMaterial);s.rotation.x=-Math.PI/2;s.position.set(c.x,this.floorY+.007,c.z);this.shadows.add(s);}
  });this.bodies.instanceMatrix.needsUpdate=true;if(this.bodies.instanceColor)this.bodies.instanceColor.needsUpdate=true;this.bodies.computeBoundingSphere();
  const selected=this.store.cubes.find(c=>c.id===this.selected);this.selectedLine.visible=!!selected;if(selected)this.selectedLine.position.set(selected.x,selected.y,selected.z);
  if(this.selectedFace&&!this.store.cubes.some(c=>c.id===this.selectedFace!.cube.id))this.selectedFace=null;
  this.dirty=true;
 }
 private hit(x:number,y:number):Face|null{this.setRay(x,y);const h=this.ray.intersectObject(this.bodies)[0];if(!h||h.instanceId===undefined||!h.face)return null;const c=this.store.cubes[h.instanceId];if(!c)return null;const n=h.face.normal;const axis=Math.abs(n.x)>Math.abs(n.y)&&Math.abs(n.x)>Math.abs(n.z)?'x':Math.abs(n.y)>Math.abs(n.z)?'y':'z';return {cube:c,axis,sign:Math.sign(n[axis])};}
 private setRay(x:number,y:number){const r=this.host.getBoundingClientRect();this.ray.setFromCamera(new T.Vector2((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1),this.camera);}
 private inside(x:number,y:number){const r=this.host.getBoundingClientRect();return x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom;}
 private highlight(f:Face|null){this.facePlane.visible=!!f;if(f){const n=new T.Vector3();n[f.axis]=f.sign;this.facePlane.position.set(f.cube.x,f.cube.y,f.cube.z).addScaledVector(n,.496);this.facePlane.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),n);}this.dirty=true;}
 private stockPreview(x:number,y:number){this.preview=[];if(this.inside(x,y)){const h=this.hit(x,y);if(h){const p={x:h.cube.x,y:h.cube.y,z:h.cube.z};p[h.axis]+=h.sign;this.preview=[p];}else{this.setRay(x,y);const p=this.ray.ray.intersectPlane(this.floor,new T.Vector3());if(p)this.preview=[{x:Math.round(p.x),y:Math.round(this.floorY+.5),z:Math.round(p.z)}];}}this.drawPreview();}
 private drawPreview(){this.ghosts.count=0;this.invalid.visible=false;for(const p of this.preview){if(this.store.valid(p.x,p.y,p.z)&&!this.store.has(p.x,p.y,p.z)&&this.store.cubes.length+this.ghosts.count<MEMO_LIMIT){this.ghosts.setMatrixAt(this.ghosts.count++,this.matrix.makeTranslation(p.x,p.y,p.z));}else{this.invalid.position.set(p.x,p.y,p.z);this.invalid.visible=true;}}this.ghosts.instanceMatrix.needsUpdate=true;this.ghosts.computeBoundingSphere();this.dirty=true;}
 private down(e:PointerEvent){if(!this.active)return;e.preventDefault();this.renderer.domElement.setPointerCapture(e.pointerId);this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(this.pointers.size>1){this.gesture=null;this.preview=[];this.drawPreview();this.pinchDistance=this.distance();return;}const f=this.hit(e.clientX,e.clientY);if(e.button===0&&f){this.selected=f.cube.id;this.selectedFace=f;this.highlight(f);this.sync();this.changed();this.gesture={kind:'face',face:f,x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};}else this.gesture={kind:'orbit',x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY};}
 private distance(){const p=[...this.pointers.values()];return p.length>1?Math.hypot(p[0]!.x-p[1]!.x,p[0]!.y-p[1]!.y):0;}
 private move(e:PointerEvent){if(this.pointers.has(e.pointerId))this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});if(this.pointers.size>1){const d=this.distance();if(this.pinchDistance&&d)this.radius=T.MathUtils.clamp(this.radius*this.pinchDistance/d,4,55);this.pinchDistance=d;this.dirty=true;return;}const g=this.gesture;if(!g){this.highlight(this.hit(e.clientX,e.clientY));return;}if(g.kind==='orbit'){this.yaw-=(e.clientX-g.x)*.009;this.pitch=T.MathUtils.clamp(this.pitch+(e.clientY-g.y)*.008,.08,1.48);g.x=e.clientX;g.y=e.clientY;this.dirty=true;}else if(g.kind==='face'&&g.face&&Math.hypot(e.clientX-g.startX,e.clientY-g.startY)>7){const f=g.face,a=new T.Vector3(f.cube.x,f.cube.y,f.cube.z),b=a.clone();b[f.axis]+=f.sign;const pa=this.project(a),pb=this.project(b),dx=pb.x-pa.x,dy=pb.y-pa.y;const distance=((e.clientX-g.startX)*dx+(e.clientY-g.startY)*dy)/Math.max(100,dx*dx+dy*dy);const count=this.continuous?T.MathUtils.clamp(Math.round(distance),1,24):1;this.preview=Array.from({length:count},(_,i)=>{const p={x:f.cube.x,y:f.cube.y,z:f.cube.z};p[f.axis]+=(i+1)*f.sign;return p;});this.drawPreview();}}
 private up(e:PointerEvent){if(this.gesture&&this.inside(e.clientX,e.clientY)&&this.preview.length){this.store.addBatch(this.preview,this.color);this.sync();this.changed();}this.pointers.delete(e.pointerId);this.gesture=null;this.preview=[];this.drawPreview();}
 cancel(){this.gesture=null;this.pointers.clear();this.preview=[];this.drawPreview();}
 project(v:T.Vector3){const p=v.clone().project(this.camera),r=this.host.getBoundingClientRect();return {x:r.x+(p.x+1)*r.width/2,y:r.y+(1-p.y)*r.height/2};}
 addLine(n:number){const f=this.selectedFace??{cube:this.store.cubes[0]!,axis:'x' as const,sign:1};this.store.addLine(f.cube.x,f.cube.y,f.cube.z,f.axis,n,this.color,f.sign);this.sync();this.changed();}
 dispose(){this.abort.abort();this.resizeObserver.disconnect();const geometries=new Set<T.BufferGeometry>(),materials=new Set<T.Material>();for(const scene of [this.scene,this.axisScene])scene.traverse(o=>{if(o instanceof T.Mesh||o instanceof T.Line||o instanceof T.Sprite){if('geometry' in o)geometries.add(o.geometry);(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>materials.add(m));}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.labels.forEach(t=>t.dispose());this.renderer.dispose();this.renderer.forceContextLoss();this.renderer.domElement.remove();}
}
