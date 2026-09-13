import {it,expect} from 'vitest';
import * as THREE from 'three';
import {Character} from '../src/game/Character';
import {landingCompression,landingStrength,LANDING_DURATION} from '../src/game/LandingPose';
import {controls} from '../src/i18n/controls';
it('landing has a compression hold and fall-speed-dependent strength',()=>{
  expect(LANDING_DURATION).toBe(.58);
  expect(landingCompression(.35)).toBe(1);expect(landingCompression(.31)).toBe(1);
  expect(landingStrength(3)).toBe(0);expect(landingStrength(10)).toBe(1);
  const pose=(speed:number)=>{const c=new Character();c.update(new THREE.Vector3(0,1,0),0,0,.1,false,0,true);c.update(new THREE.Vector3(0,1-speed*.1,0),0,0,.1,false,0,true);const p=c.root.position.clone();for(let i=0;i<15;i++)c.update(p,0,0,1/60);return c;};
  const normal=pose(6),strong=pose(10);
  expect(-normal.legs[0]!.lower.rotation.x*180/Math.PI).toBeGreaterThan(45);
  expect(-strong.legs[0]!.lower.rotation.x*180/Math.PI).toBeGreaterThan(60);
  expect(strong.pelvis.position.y).toBeLessThan(normal.pelvis.position.y);
  const leg=strong.legs[0]!;expect(leg.upper.rotation.x+leg.lower.rotation.x+leg.end.rotation.x).toBeCloseTo(0,2);
  strong.root.updateMatrixWorld(true);const sole=leg.end.localToWorld(new THREE.Vector3(0,-.1135,-.06));expect(Math.abs(sole.y-strong.root.position.y)).toBeLessThan(.025);
});
it('Shift help exists in all nine locales without assigning LOOK UP to movement arrows',()=>{
  expect(Object.keys(controls)).toHaveLength(9);for(const values of Object.values(controls)){expect(values[10]).toContain('Shift');expect(values[10]).toContain('LOOK UP');expect(values[10]).not.toContain('↑');}
});
it('v2 outfit keeps equipment articulated and visor surface outside the helmet',()=>{
  const c=new Character();for(const name of ['tailored-white-torso','chest-shell','backpack-shell','knee-shell','shoulder-shell','curved-visor'])expect(c.root.getObjectByName(name)).toBeTruthy();
  const visor=c.root.getObjectByName('curved-visor') as THREE.Mesh;
  const pos=visor.geometry.getAttribute('position'),norm=visor.geometry.getAttribute('normal');
  const i=Math.floor(pos.count/2);expect(new THREE.Vector3().fromBufferAttribute(pos,i).dot(new THREE.Vector3().fromBufferAttribute(norm,i))).toBeGreaterThan(0);
  expect(c.legs.every(l=>l.end.getObjectByName('boot-tread') instanceof THREE.InstancedMesh)).toBe(true);
});
