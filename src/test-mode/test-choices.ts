import type {StageDefinition,Vec3Tuple,ShapeChoice} from '../types';
import {isConnected,normalizeVoxels} from '../stages/stage-utils';
import {routeRotationKey} from '../stages/route-choices';
/** Dedicated new shapes, using bounded connected edits; never changes Standard choice rules. */
export function testChoices(s:StageDefinition):ShapeChoice[]{
 const canonical=normalizeVoxels(s.rooms),seen=new Set([routeRotationKey(canonical)]),choices:ShapeChoice[]=[{id:'correct',correct:true,voxels:canonical}];
 const add=(p:readonly Vec3Tuple[])=>{if(new Set(p.map(v=>v.join())).size!==p.length||!isConnected(p))return;const k=routeRotationKey(p);if(seen.has(k))return;seen.add(k);choices.push({id:`test-wrong-${choices.length}`,correct:false,voxels:normalizeVoxels(p)});};
 for(let i=canonical.length-1;i>=0&&choices.length<10;i--)add(canonical.filter((_,j)=>j!==i));
 const directions:Vec3Tuple[]=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
 outer:for(const p of canonical)for(const d of directions){if(choices.length===10)break outer;add([...canonical,p.map((v,i)=>v+d[i]!) as unknown as Vec3Tuple]);}
 if(choices.length!==10)throw Error('Insufficient test choices '+s.id);return choices;
}
