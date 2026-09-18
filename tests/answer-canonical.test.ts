import {it,expect} from 'vitest';
import {bindCorrectChoice,getStageCanonicalShape} from '../src/stages/answer-canonical';
import {SPECIAL_STAGES} from '../src/stages/special';
import {ALL_STAGES,PROTOTYPE_ARCHIVE} from '../src/stages/catalog';
import {TEST_STAGES,TEST_STAGES_V2,LEGACY_TEST_STAGES} from '../src/test-mode/test-stages';
import {buildChoices,shuffle} from '../src/stages/stage-utils';
import {testChoices} from '../src/test-mode/test-choices';
import {areShapesRotationEquivalent,areColoredShapesEquivalent,getAllRotations} from '../src/game/ShapeEquivalence';

const sets=[['catalog',ALL_STAGES],['archive',PROTOTYPE_ARCHIVE],['test',TEST_STAGES],['test-v2',TEST_STAGES_V2],['test-legacy',LEGACY_TEST_STAGES]] as const;
for(const [set,stages] of sets)for(const stage of stages)it(`${set}/${stage.id}: world source matches the marked displayed answer`,()=>{
 const actual=getStageCanonicalShape(stage);
 const choices=shuffle(stage.section==='test'&&stage.stageType==='shape'?testChoices(stage):buildChoices(stage),stage.numericId);
 const matches=choices.filter(c=>stage.section==='special'?areColoredShapesEquivalent(stage.rooms,stage.colors!,c.voxels,c.colors!):areShapesRotationEquivalent(stage.rooms,c.voxels));
 expect(matches).toHaveLength(1);
 expect(matches[0]!.correct).toBe(true);
 expect(choices.filter(c=>c.correct)).toEqual(matches);
 expect(actual.voxels).toHaveLength(stage.rooms.length);
 for(const rotated of getAllRotations(actual.voxels))expect(stage.section==='special'?areColoredShapesEquivalent(rotated,actual.colors!,matches[0]!.voxels,matches[0]!.colors!):areShapesRotationEquivalent(rotated,matches[0]!.voxels)).toBe(true);
 console.log('ANSWER_AUDIT '+JSON.stringify({set,stage:stage.id,correctId:matches[0]!.id,displayNumber:choices.indexOf(matches[0]!)+1,cubes:actual.voxels.length,match:true,color:stage.section==='special'}));
});
it('replaces stale answer geometry while preserving the correct slot and ID',()=>{
 const stage=SPECIAL_STAGES[3]!;
 const choices=[{id:'wrong',correct:false,voxels:[[0,0,0] as const]},{id:'saved-correct-id',correct:true,voxels:[[9,9,9] as const]}];
 const result=bindCorrectChoice(stage,choices);
 expect(result[0]).toBe(choices[0]);expect(result[1]!.id).toBe('saved-correct-id');
 expect(result[1]!.voxels).toEqual(getStageCanonicalShape(stage).voxels);
 expect(choices[1]!.voxels).toEqual([[9,9,9]]);
});
it('keeps SPECIAL 3/4 colors attached to coordinates, not independently sorted',()=>{
 for(const stage of SPECIAL_STAGES.slice(2,4)){
 const actual=getStageCanonicalShape(stage);
 expect(actual.colors).toEqual(stage.colors);
 expect(areColoredShapesEquivalent(stage.rooms,stage.colors!,actual.voxels,actual.colors!)).toBe(true);
 }
});
it('ignores stale memo cache when generating a route correct answer',()=>{
 const stage=ALL_STAGES.find(s=>s.stageType==='route')!;
 const stale={...stage,memo:{...stage.memo!,canonicalCubes:[[0,0,0] as const]}};
 expect(areShapesRotationEquivalent(buildChoices(stale).find(c=>c.correct)!.voxels,stage.rooms)).toBe(true);
});
