import {afterEach,expect,it,vi} from 'vitest';
import * as THREE from 'three';
import {HomeWorld} from '../src/ui/HomeWorld';
import {HOME_COPY,HOME_ICONS} from '../src/ui/HomeContent';
afterEach(()=>vi.unstubAllGlobals());
it('keeps approved brand copy and adds one test icon',()=>{
  expect(HOME_COPY.headline).toBe('探索して、記憶して、見抜け。');expect(HOME_COPY.supporting).toBe('君の空間把握能力が試される。');
  expect(Object.keys(HOME_ICONS)).toEqual(['test','continue','new','stages','how']);expect(HOME_COPY).not.toHaveProperty('shareTitle');
});
it('home set contains seven cubes, independent distant instances and a small Earth mask',()=>{
  const ctx={fillStyle:'',fillRect:vi.fn(),beginPath:vi.fn(),moveTo:vi.fn(),lineTo:vi.fn(),closePath:vi.fn(),fill:vi.fn()};
  vi.stubGlobal('document',{createElement:()=>({width:0,height:0,getContext:()=>ctx})});const w=new HomeWorld();
  expect(w.cross.children).toHaveLength(7);expect(w.cross.children.every(c=>c instanceof THREE.Mesh)).toBe(true);
  expect(w.scene.getObjectByName('home-galaxy-space')).toBeDefined();expect(w.scene.getObjectByName('home-stars')).toBeInstanceOf(THREE.Points);
  const far=w.scene.getObjectByName('home-distant-buildings') as THREE.InstancedMesh;expect(far).toBeInstanceOf(THREE.InstancedMesh);
  const m=new THREE.Matrix4();for(let i=0;i<far.count;i++){far.getMatrixAt(i,m);expect(m.elements[14]).toBeLessThanOrEqual(-65);}
  const map=(w.earth.material as THREE.ShaderMaterial).uniforms.land!.value as THREE.CanvasTexture;expect(map.image.width).toBe(512);expect(map.image.height).toBe(256);
  expect(w.scene.getObjectByName('home-white-planet')).toBeDefined();expect(w.scene.getObjectByName('celebration-space')).toBeUndefined();
});
