import {it,expect} from 'vitest';
import {ALL_STAGES,PROTOTYPE_ARCHIVE} from '../src/stages/catalog';
import {TEST_STAGES,TEST_STAGES_V2,LEGACY_TEST_STAGES} from '../src/test-mode/test-stages';
import {buildChoices} from '../src/stages/stage-utils';
import {testChoices} from '../src/test-mode/test-choices';
import {routeRotationKey} from '../src/stages/route-choices';
const stages=[...ALL_STAGES,...PROTOTYPE_ARCHIVE,...TEST_STAGES,...TEST_STAGES_V2,...LEGACY_TEST_STAGES];
it.each(stages)('audits $id answer set',stage=>{
  const choices=stage.section==='test'&&stage.stageType==='shape'?testChoices(stage):buildChoices(stage);
  const keys=choices.map(c=>routeRotationKey(c.voxels));
  const duplicates=keys.map((k,i)=>keys.indexOf(k)===i?null:[keys.indexOf(k)+1,i+1]).filter(Boolean);
  console.log(JSON.stringify({stage:stage.id,choices:choices.length,duplicates,keys}));
  expect(choices.length).toBe(10);
  expect(duplicates,stage.id).toEqual([]);
  expect(choices.filter(c=>c.correct)).toHaveLength(1);
  const correctKey=routeRotationKey(stage.memo!.canonicalCubes);
  expect(keys.filter(k=>k===correctKey)).toHaveLength(1);
  expect(routeRotationKey(choices.find(c=>c.correct)!.voxels)).toBe(correctKey);
});
