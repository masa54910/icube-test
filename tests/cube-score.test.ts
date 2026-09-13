import {it,expect} from 'vitest';
import {TEST_STAGES,LEGACY_TEST_STAGES} from '../src/test-mode/test-stages';
import {ALL_STAGES} from '../src/stages/catalog';
import {shapeKey,isConnected} from '../src/stages/stage-utils';
import {baselineFor,geometryMetrics,syntheticCalibration,scoreQuestion,scoreTest,calibrationEligibility} from '../src/test-mode/CubeScoreEngine';
it('defines five unique new connected integer shapes with canonical origin',()=>{
 expect(TEST_STAGES).toHaveLength(5);
 for(const s of TEST_STAGES){expect(isConnected(s.rooms),s.id).toBe(true);expect(new Set(s.rooms.map(p=>p.join())).size).toBe(s.rooms.length);expect(s.rooms.every(p=>p.every(Number.isInteger))).toBe(true);expect(s.memo!.canonicalCubes.length).toBe(s.rooms.length);expect(s.memo!.canonicalCubes.some(p=>p.every(v=>v===0))).toBe(true);expect(ALL_STAGES.some(old=>shapeKey(old.rooms)===shapeKey(s.rooms))).toBe(false);}
});
it('has increasing geometry-derived difficulty and reports synthetic profiles',()=>{
 const b=TEST_STAGES.map(baselineFor);console.log('TEST BASELINES',b.map(v=>({difficulty:v.difficultyIndex,seconds:v.baselineTime/1000,...v.metrics})));
 for(let i=1;i<b.length;i++)expect(b[i]!.difficultyIndex).toBeGreaterThan(b[i-1]!.difficultyIndex);
 const profiles=syntheticCalibration(TEST_STAGES);console.log('SYNTHETIC ONLY',profiles.map(p=>({name:p.name,score:p.total,rank:p.rank})));
 expect(profiles.length).toBeGreaterThanOrEqual(10);expect(new Set(profiles.map(p=>p.rank)).size).toBeGreaterThanOrEqual(4);
 expect(profiles.find(p=>p.name==='Expert')!.rank).not.toBe('S');expect(profiles.find(p=>p.name==='Fast + Accurate')!.total).toBeGreaterThanOrEqual(725);
});
it('is deterministic, bounded and does not penalize memo/direct method or order',()=>{
 const raw=syntheticCalibration(TEST_STAGES)[9]!.raw;
 expect(scoreTest(raw)).toEqual(scoreTest(raw));expect(scoreTest(raw.map(r=>({...r,memoUsed:true,directSubmissionUsed:true})))).toEqual(scoreTest(raw));
 const q=raw[0]!;expect(scoreQuestion({...q,effectiveSolveTime:0}).score).toBeLessThanOrEqual(1000);expect(scoreQuestion({...q,answerAttempts:2,hintUsed:true}).score).toBeLessThan(scoreQuestion(q).score);
 expect(scoreQuestion({...q,completed:false}).score).toBeGreaterThan(0);
});
it('measures geometry independently of voxel serialization order',()=>{for(const s of TEST_STAGES)expect(geometryMetrics({...s,rooms:[...s.rooms].reverse()})).toEqual(geometryMetrics(s));});
it('preserves score formula: simpler geometry slightly reduces the near-perfect ceiling',()=>{const q=syntheticCalibration(TEST_STAGES)[9]!.raw[0]!;expect(scoreQuestion({...q,difficulty:90}).score).toBeGreaterThan(scoreQuestion({...q,difficulty:10}).score);expect(syntheticCalibration(LEGACY_TEST_STAGES).find(p=>p.name==='Near-perfect')!.total).toBeGreaterThanOrEqual(950);expect(syntheticCalibration(TEST_STAGES).find(p=>p.name==='Near-perfect')!.total).toBe(949);});
it('freezes the Set A v1 synthetic baseline contract',()=>{expect(LEGACY_TEST_STAGES.map(s=>{const b=baselineFor(s);return [b.difficultyIndex,b.baselineTime];})).toEqual([[35,111000],[43,139000],[61,180000],[78,228000],[83,249000]]);});
it('keeps fixtures, interruptions and time outliers out of future human calibration',()=>{const q=syntheticCalibration(TEST_STAGES)[9]!.raw[0]!;expect(calibrationEligibility(q,'syntheticBaseline').eligible).toBe(false);expect(calibrationEligibility({...q,interrupted:true}).eligible).toBe(false);expect(calibrationEligibility({...q,effectiveSolveTime:1}).eligible).toBe(false);expect(calibrationEligibility({...q,effectiveSolveTime:q.baselineTime*10}).eligible).toBe(false);expect(calibrationEligibility(q).eligible).toBe(true);});
