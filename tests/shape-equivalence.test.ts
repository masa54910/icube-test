import {describe,it,expect} from 'vitest';
import {getAllRotations,normalizeShape,getCanonicalShapeKey,areShapesRotationEquivalent} from '../src/game/ShapeEquivalence';
import {compareMemoToCanonical} from '../src/game/MemoComparator';
import type {Vec3Tuple} from '../src/types';
const a:Vec3Tuple[]=[[0,0,0],[1,0,0],[2,0,0],[2,1,0],[2,1,1],[2,1,2],[2,1,3]];
describe('proper rotation occupancy equivalence',()=>{
 it('generates exactly 24 distinct proper orientations',()=>{expect(getAllRotations([[1,2,3]])).toHaveLength(24);expect(new Set(getAllRotations([[1,2,3]]).map(p=>JSON.stringify(p))).size).toBe(24);});
 it('normalizes translations and input ordering',()=>{expect(normalizeShape([[4,2,1],[3,2,1]])).toEqual([[0,0,0],[1,0,0]]);expect(getCanonicalShapeKey([...a].reverse())).toBe(getCanonicalShapeKey(a));});
 it.each(getAllRotations(a))('accepts every proper rotation plus translation',(...points)=>{const p=points as unknown as Vec3Tuple[];expect(areShapesRotationEquivalent(a,p.map(([x,y,z])=>[x+8,y-4,z+6]))).toBe(true);});
 it('rejects a chiral mirror, added, removed and misplaced cubes',()=>{expect(areShapesRotationEquivalent(a,a.map(([x,y,z])=>[-x,y,z]))).toBe(false);expect(areShapesRotationEquivalent(a,[...a,[9,9,9]])).toBe(false);expect(areShapesRotationEquivalent(a,a.slice(1))).toBe(false);expect(areShapesRotationEquivalent(a,[[9,9,9],...a.slice(1)])).toBe(false);});
 it('ignores color in direct submissions',()=>{const p=a.map(([x,y,z])=>({x:z+5,y:x-2,z:y+3,color:'orange'}));expect(compareMemoToCanonical(p,a).isExactMatch).toBe(true);});
});
