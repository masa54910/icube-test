import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {CONFIG} from '../config';

/** UV edge shading is confined to existing box faces, never adds interior grids. */
export function compositeAO(material:THREE.MeshStandardMaterial):void {
  material.onBeforeCompile=shader=>{
    shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vCompositeUv;').replace('#include <uv_vertex>','#include <uv_vertex>\nvCompositeUv=uv;');
    shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vCompositeUv;').replace('#include <color_fragment>',`#include <color_fragment>
      vec2 edge=min(vCompositeUv,1.0-vCompositeUv);
      float contact=smoothstep(0.0,0.045,min(edge.x,edge.y));
      diffuseColor.rgb*=mix(0.80,1.0,contact);`);
  };
  material.customProgramCacheKey=()=> 'composite-contact-v1';material.needsUpdate=true;
}

export function upgradeStageMaterials(root:THREE.Group):void {
  const geometries=new Map<string,THREE.BufferGeometry>(),seen=new Set<THREE.Material>();
  root.traverse(object=>{
    if(object instanceof THREE.PointLight){object.intensity=.38;return;}
    if(!(object instanceof THREE.Mesh))return;
    const mat=object.material;if(!(mat instanceof THREE.MeshStandardMaterial))return;
    const color=mat.color.getHex(),room=color===CONFIG.colors.room||mat.name==='sci-fi-composite';
    if(!seen.has(mat)){
      seen.add(mat);
      if(room){mat.name='sci-fi-composite';mat.color.setHex(0xe0e7eb);mat.roughness=.64;mat.metalness=.015;mat.envMapIntensity=.12;compositeAO(mat);}
      else if(color===0xaeb9c7){mat.name='brushed-ladder-alloy';mat.color.setHex(0x879cae);mat.roughness=.4;mat.metalness=.72;mat.envMapIntensity=.7;}
      else if(color===0xf0f5fa){mat.name='terminal-ceramic';mat.color.setHex(0xe8eff2);mat.roughness=.3;mat.metalness=.12;mat.envMapIntensity=.55;}
      else if(color===0x071a30){mat.name='terminal-emissive-display';mat.roughness=.19;mat.metalness=.15;mat.envMapIntensity=.2;}
      else if(color===0xbbe6ff){mat.name='answer-zone-glass';mat.opacity=.24;mat.roughness=.32;mat.envMapIntensity=.4;}
      else {mat.envMapIntensity=.25;}
    }
    object.receiveShadow=!mat.transparent;
    // Only props cast the local key shadow: ceilings must not extinguish the rig.
    object.castShadow=!room&&!mat.transparent&&color!==CONFIG.colors.grid;
    const source=object.geometry;
    if(!(source instanceof THREE.BoxGeometry))return;
    const {width,height,depth}=source.parameters;
    if(Math.min(width,height,depth)<.07)return;
    const radius=Math.min(.018,Math.min(width,height,depth)*.15);
    const key=[width,height,depth,radius].join(':');
    let geometry=geometries.get(key);
    if(!geometry){geometry=new RoundedBoxGeometry(width,height,depth,1,radius);geometries.set(key,geometry);}
    object.geometry=geometry;
    // Existing colliders were already calculated from the exact original boxes.
    source.dispose();
  });
}

export function upgradeExplorerMaterials(root:THREE.Group):void {
  const materials=new Map<string,THREE.MeshStandardMaterial>();
  root.traverse(object=>{
    if(!(object instanceof THREE.Mesh)||!(object.material instanceof THREE.MeshStandardMaterial))return;
    const color=object.material.color.getHex();
    const key=color.toString(16);
    let mat=materials.get(key);
    if(!mat){
      const visor=color===0x061725;
      mat=visor?new THREE.MeshPhysicalMaterial({color:0x030b14,roughness:.09,metalness:.4,clearcoat:1,clearcoatRoughness:.07,envMapIntensity:1.5}):new THREE.MeshStandardMaterial({color,roughness:.65,metalness:.015,envMapIntensity:.25});
      if(visor){
        mat.name='visor-fresnel-reflection';
        mat.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec2 vVisorUv;').replace('#include <uv_vertex>','#include <uv_vertex>\nvVisorUv=uv;');shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec2 vVisorUv;').replace('#include <color_fragment>',`#include <color_fragment>
          float top=1.0-smoothstep(0.0,0.75,vVisorUv.y);
          diffuseColor.rgb+=vec3(0.008,0.022,0.041)*top;
          float highlight=exp(-pow((vVisorUv.y-0.12)*30.0,2.0));
          diffuseColor.rgb+=vec3(0.025,0.042,0.058)*highlight;`);};
        mat.customProgramCacheKey=()=> 'visor-gradient-v2';
      }
      else if([0xf2f7ff,0xe6f0fa].includes(color)){mat.name='suit-fabric';mat.color.setHex(0xf4f7f8);mat.roughness=.86;mat.envMapIntensity=.4;}
      else if(color===0xa4b3c1||color===0xb2bdc7){mat.name='boot-sole-heel';mat.roughness=.88;mat.color.setHex(0x8e9eaa);mat.envMapIntensity=.12;}
      else if(color===0xc6d0d9){mat.name='boot-flex-cuff';mat.roughness=.9;mat.envMapIntensity=.12;}
      else if([0xffffff,0xf7fbff,0xf6fdff].includes(color)){mat.name=color===0xffffff?'hard-shell-backpack':'helmet-shell';mat.color.setHex(0xeff4f5);mat.roughness=.27;mat.metalness=.08;mat.envMapIntensity=.7;}
      else if(color===0xf8fcff){mat.name='gloves-boots';mat.color.setHex(0xcdd9e1);mat.roughness=.77;}
      else if(color===0x69d7ed){mat.name='cyan-accent';mat.color.setHex(0x43bdd4);mat.roughness=.36;mat.metalness=.16;mat.envMapIntensity=.6;}
      else {mat.name='flexible-joint-trim';mat.roughness=.74;mat.color.multiplyScalar(.85);}
      materials.set(key,mat);
    }
    object.material=mat;object.receiveShadow=true;
  });
}
