import type {Vec3Tuple} from '../types';
import {areShapesRotationEquivalent} from './ShapeEquivalence';
export type MemoPoint={x:number;y:number;z:number};
export const memoCoordinateKey=(p:MemoPoint)=>`${p.x},${p.y},${p.z}`;
/** Answer matching ignores orientation/color; coordinate diagnostics remain START-relative for hints. */
export function compareMemoToCanonical(points:readonly MemoPoint[],canonical:readonly Vec3Tuple[]){
 const expected=new Set(canonical.map(p=>p.join(','))),actual=new Set(points.map(memoCoordinateKey));
 const correctCoordinates=points.filter(p=>expected.has(memoCoordinateKey(p)));
 const incorrectCoordinates=points.filter(p=>!expected.has(memoCoordinateKey(p)));
 const missingCoordinates=canonical.filter(p=>!actual.has(p.join(',')));
 return {isExactMatch:areShapesRotationEquivalent(points.map(p=>[p.x,p.y,p.z]),canonical),correctCoordinates,incorrectCoordinates,missingCoordinates};
}
