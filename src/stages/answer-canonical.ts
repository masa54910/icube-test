import type {ShapeChoice,StageDefinition,Vec3Tuple} from '../types';

/** The same occupied room coordinates consumed by WorldBuilder, translated only.
 * Do not sort independently of colors, rotate, or read a cached answer/memo shape.
 */
export function getStageCanonicalShape(stage:StageDefinition){
 const minimum=[0,1,2].map(axis=>Math.min(...stage.rooms.map(p=>p[axis]!)));
 const voxels=stage.rooms.map(p=>p.map((v,axis)=>v-minimum[axis]!) as unknown as Vec3Tuple);
 if(!voxels.length||voxels.some(p=>p.some(v=>!Number.isInteger(v)))||new Set(voxels.map(p=>p.join(','))).size!==voxels.length)throw Error('Invalid stage geometry: '+stage.id);
 const colors=stage.section==='special'?stage.colors:undefined;
 if(stage.section==='special'&&colors?.length!==voxels.length)throw Error('Invalid stage colors: '+stage.id);
 return {voxels,colors:colors?[...colors]:undefined};
}

/** Keep the existing correct ID, slot and metadata; replace its contents from the world. */
export function bindCorrectChoice<T extends ShapeChoice>(stage:StageDefinition,choices:T[]):T[]{
 if(choices.filter(choice=>choice.correct).length!==1)throw Error('Expected one correct slot: '+stage.id);
 const actual=getStageCanonicalShape(stage);
 return choices.map(choice=>choice.correct?{...choice,...actual}:choice);
}
