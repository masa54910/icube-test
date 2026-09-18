import {it,expect} from 'vitest';
import * as T from 'three';
import {SPECIAL_STAGES,buildSpecialChoices} from '../src/stages/special';
import {routeViewLayout,SPECIAL_VIEW_DIRECTION,specialViewDirection,THREE_FLOOR_VIEW_DIRECTION} from '../src/ui/RouteAnswerPreview';
it('SPECIAL 5 keeps three floors with 3/4/2 cubes in every similar choice',()=>{
 const stage=SPECIAL_STAGES[4]!,choices=buildSpecialChoices(stage);
 expect(choices).toHaveLength(10);
 for(const choice of choices)expect([0,1,2].map(y=>choice.voxels.filter(p=>p[1]===y).length)).toEqual([3,4,2]);
 const correct=choices.find(c=>c.correct)!;
 expect(correct.voxels).toEqual(stage.rooms);expect(correct.colors).toEqual(stage.colors);
 expect(specialViewDirection(choices)).toBe(THREE_FLOOR_VIEW_DIRECTION);
 // Even the rearmost third-floor center remains visibly above every second-floor center.
 const {up}=routeViewLayout(choices,THREE_FLOOR_VIEW_DIRECTION);
 const heights=(y:number)=>correct.voxels.filter(p=>p[1]===y).map(p=>new T.Vector3(...p).dot(up));
 expect(Math.min(...heights(2))-Math.max(...heights(1))).toBeGreaterThan(.5);
 expect(Math.min(...heights(1))-Math.max(...heights(0))).toBeGreaterThan(.4);
});
it('reproduces the old SPECIAL 3 red/blue projected overlap and separates them in the new view',()=>{
 const s=SPECIAL_STAGES[2]!,red=new T.Vector3(...s.rooms[1]!),blue=new T.Vector3(...s.rooms[4]!);
 const old=(p:T.Vector3)=>[(p.x-p.z)*.866,-p.y+(p.x+p.z)*.5];expect(old(red)).toEqual(old(blue));
 const layout=routeViewLayout(buildSpecialChoices(s),SPECIAL_VIEW_DIRECTION);
 expect(Math.hypot(red.clone().sub(blue).dot(layout.right),red.clone().sub(blue).dot(layout.up))).toBeGreaterThan(1);
 expect(s.rooms.filter(p=>p[1]===0)).toHaveLength(3);expect(s.colors!.slice(0,3)).toEqual(['white','red','yellow']);
 expect(s.rooms.filter(p=>p[1]===1)).toHaveLength(3);expect(s.colors!.slice(3)).toEqual(['green','blue','orange']);
});
for(const stage of SPECIAL_STAGES)it(stage.id+' fits every actual cube vertex at all four answer views without mutating positions/colors',()=>{
 const choices=buildSpecialChoices(stage),before=JSON.stringify(choices);
 for(let turn=0;turn<4;turn++){
 const direction=specialViewDirection(choices).clone().applyAxisAngle(new T.Vector3(0,1,0),turn*Math.PI/2),layout=routeViewLayout(choices,direction);
 choices.forEach((choice,i)=>{for(const p of choice.voxels)for(const x of [-.5,.5])for(const y of [-.5,.5])for(const z of [-.5,.5]){
 const v=new T.Vector3(p[0]+x,p[1]+y,p[2]+z).sub(layout.centers[i]!);
 expect(Math.abs(v.dot(layout.right))).toBeLessThan(layout.halfHeight*1.5);expect(Math.abs(v.dot(layout.up))).toBeLessThan(layout.halfHeight);
 }});
 }expect(JSON.stringify(choices)).toBe(before);
});
