import {describe,it,expect} from 'vitest';
import {compareMemoToCanonical} from '../src/game/MemoComparator';
import {ALL_STAGES} from '../src/stages/catalog';
import {memoDirectCopy,memoDirectTranslation} from '../src/i18n/memoDirect';
describe('direct geometry answer',()=>{
 it.each(ALL_STAGES.map(s=>[s.id,s] as const))('%s exact/missing/extra/wrong-position',(_,s)=>{
  const canonical=s.memo!.canonicalCubes;const points=canonical.map(([x,y,z])=>({x,y,z,color:'navy',hintState:'correct'}));
  expect(compareMemoToCanonical([...points].reverse(),canonical).isExactMatch).toBe(true);
  expect(compareMemoToCanonical(points.slice(1),canonical).isExactMatch).toBe(false);
  expect(compareMemoToCanonical([...points,{x:100,y:100,z:100}],canonical).isExactMatch).toBe(false);
  expect(compareMemoToCanonical([{x:100,y:100,z:100},...points.slice(1)],canonical).isExactMatch).toBe(false);
 });
 it('rejects duplicates, translations and non-integers',()=>{
  expect(compareMemoToCanonical([{x:0,y:0,z:0},{x:0,y:0,z:0}],[[0,0,0],[1,0,0]]).isExactMatch).toBe(false);
  expect(compareMemoToCanonical([{x:1,y:0,z:0}],[[0,0,0]]).isExactMatch).toBe(false);
  expect(compareMemoToCanonical([{x:.5,y:0,z:0}],[[0,0,0]]).isExactMatch).toBe(false);
 });
 it.each(Object.keys(memoDirectCopy) as (keyof typeof memoDirectCopy)[])('%s confirmation complete',l=>{
  expect(memoDirectCopy[l]).toHaveLength(7);for(const key of ['memo.submitShape','memo.confirm.title','memo.confirm.message','memo.confirm.yes','memo.confirm.back','memo.answer.incorrect'])expect(memoDirectTranslation(l,key)?.length).toBeGreaterThan(0);
 });
});
