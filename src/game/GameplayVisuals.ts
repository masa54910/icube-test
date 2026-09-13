import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import type {BuiltWorld} from './WorldBuilder';
import {upgradeExplorerMaterials,upgradeStageMaterials} from './GameplayMaterials';

export const GAMEPLAY_QUALITY={high:{pixelRatio:1.5,shadow:1024},low:{pixelRatio:1.25,shadow:512}} as const;
/** Gameplay-only render rig. Restores renderer and legacy lights for Home/Correct. */
export class GameplayVisuals {
  readonly root=new THREE.Group();
  readonly key=new THREE.DirectionalLight(0xfff8ef,2.5);
  readonly quality:typeof GAMEPLAY_QUALITY.high|typeof GAMEPLAY_QUALITY.low;
  private environment:THREE.WebGLRenderTarget|null=null;
  private decorated:THREE.Group|null=null;
  private active=false;
  private legacy:{light:THREE.Light;visible:boolean}[];
  private original:{tone:THREE.ToneMapping;exposure:number;ratio:number;shadow:boolean;environment:THREE.Texture|null};
  private playerContact:THREE.Mesh;
  private contacts:THREE.Group=new THREE.Group();
  constructor(private renderer:THREE.WebGLRenderer,private scene:THREE.Scene,private character:THREE.Group){
    this.quality=matchMedia('(pointer:coarse)').matches?GAMEPLAY_QUALITY.low:GAMEPLAY_QUALITY.high;
    this.original={tone:renderer.toneMapping,exposure:renderer.toneMappingExposure,ratio:renderer.getPixelRatio(),shadow:renderer.shadowMap.enabled,environment:scene.environment};
    this.legacy=scene.children.filter((o):o is THREE.Light=>o instanceof THREE.Light).map(light=>({light,visible:light.visible}));
    this.root.name='gameplay-visual-rig';this.root.visible=false;
    this.root.add(new THREE.HemisphereLight(0xe2f2ff,0x536878,.65));
    const fill=new THREE.DirectionalLight(0xb4ddff,.4);fill.position.set(5,3,-5);
    const rim=new THREE.DirectionalLight(0x65d4ef,.8);rim.position.set(-3,2,5);
    this.key.castShadow=true;this.key.shadow.mapSize.setScalar(this.quality.shadow);
    Object.assign(this.key.shadow.camera,{left:-5,right:5,top:5,bottom:-5,near:.1,far:24});
    this.key.shadow.camera.updateProjectionMatrix();
    this.key.shadow.normalBias=.025;this.key.shadow.bias=-.00015;this.key.shadow.radius=2;
    this.root.add(this.key,this.key.target,fill,rim,this.contacts);
    this.playerContact=this.contact(.46,.32,.2);this.root.add(this.playerContact);
    this.scene.add(this.root);upgradeExplorerMaterials(character);
  }
  private contact(x:number,z:number,opacity:number):THREE.Mesh {
    const mat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,uniforms:{strength:{value:opacity}},vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:'varying vec2 vUv;uniform float strength;void main(){float d=length((vUv-.5)*2.0);float a=(1.0-smoothstep(.12,1.0,d))*strength;gl_FragColor=vec4(.12,.19,.25,a);}' });
    const mesh=new THREE.Mesh(new THREE.PlaneGeometry(x*2,z*2),mat);mesh.rotation.x=-Math.PI/2;mesh.renderOrder=1;return mesh;
  }
  private prepare(world:BuiltWorld):void {
    if(this.decorated===world.root)return;
    this.decorated=world.root;upgradeStageMaterials(world.root);this.applyEnvironment(world.root);
    for(const item of [...this.contacts.children]){const mesh=item as THREE.Mesh;mesh.geometry.dispose();(mesh.material as THREE.Material).dispose();this.contacts.remove(item);}
    for(const position of world.answerPositions){const terminal=this.contact(1.13,.73,.19);terminal.position.copy(position);terminal.position.y-=.069;this.contacts.add(terminal);}
    for(const ladder of world.ladders){
      const bottom=Math.min(ladder.from[1],ladder.to[1])*6-2.934;
      const shadow=this.contact(.95,.42,.15);shadow.position.set(ladder.from[0]*6,bottom,ladder.from[2]*6-1.7);this.contacts.add(shadow);
      // A faint broad projection onto the wall behind the real ladder, not a new seam.
      const wall=this.contact(1.02,Math.abs(ladder.to[1]-ladder.from[1])*3+2.6,.09);
      wall.rotation.set(0,0,0);wall.position.set(ladder.from[0]*6,(ladder.from[1]+ladder.to[1])*3,ladder.from[2]*6-2.934);this.contacts.add(wall);
    }
  }
  private applyEnvironment(root:THREE.Group):void {
    root.traverse(object=>{if(object instanceof THREE.Mesh&&object.material instanceof THREE.MeshStandardMaterial){object.material.envMap=this.environment!.texture;object.material.needsUpdate=true;}});
  }
  update(enabled:boolean,position:THREE.Vector3,world:BuiltWorld|null,colliders:readonly THREE.Box3[]):void {
    enabled=enabled&&!!world;
    if(enabled&&!this.environment){
      const room=new RoomEnvironment();const generator=new THREE.PMREMGenerator(this.renderer);
      this.environment=generator.fromScene(room,.04,.1,100,{size:64});room.dispose();generator.dispose();
      this.applyEnvironment(this.character);
    }
    if(enabled!==this.active){
      this.active=enabled;this.root.visible=enabled;
      this.legacy.forEach(({light,visible})=>light.visible=enabled?false:visible);
      this.renderer.toneMapping=enabled?THREE.ACESFilmicToneMapping:this.original.tone;
      this.renderer.toneMappingExposure=enabled?1.04:this.original.exposure;
      this.renderer.shadowMap.enabled=enabled||this.original.shadow;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
      this.renderer.setPixelRatio(enabled?Math.min(devicePixelRatio,this.quality.pixelRatio):this.original.ratio);
      this.scene.environment=enabled?this.environment!.texture:this.original.environment;
    }
    if(!enabled||!world)return;
    this.prepare(world);
    this.key.position.copy(position).add(new THREE.Vector3(-3,6,4));this.key.target.position.copy(position).add(new THREE.Vector3(0,.7,0));
    let floor=-Infinity;
    for(const box of colliders)if(position.x>=box.min.x&&position.x<=box.max.x&&position.z>=box.min.z&&position.z<=box.max.z&&box.max.y<=position.y+.08)floor=Math.max(floor,box.max.y);
    const height=position.y-floor;this.playerContact.visible=height<2.8;
    if(this.playerContact.visible){this.playerContact.position.set(position.x,floor+.006,position.z);this.playerContact.scale.setScalar(1+height*.25);const compression=Number(this.character.userData.landingCompression)||0;(this.playerContact.material as THREE.ShaderMaterial).uniforms.strength!.value=(.23+.06*compression)*Math.max(0,1-height/2.8);}
  }
}
