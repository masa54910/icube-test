import type {Vec3Tuple} from '../types';
export type MemoPoint={x:number;y:number;z:number};
export const memoCoordinateKey=(p:MemoPoint)=>`${p.x},${p.y},${p.z}`;
/** START-relative, fixed XYZ axes. No rotation, translation or color normalization. */
export function compareMemoToCanonical(points:readonly MemoPoint[],canonical:readonly Vec3Tuple[]){
 const expected=new Set(canonical.map(p=>p.join(','))),actual=new Set(points.map(memoCoordinateKey));
 const correctCoordinates=points.filter(p=>expected.has(memoCoordinateKey(p)));
 const incorrectCoordinates=points.filter(p=>!expected.has(memoCoordinateKey(p)));
 const missingCoordinates=canonical.filter(p=>!actual.has(p.join(',')));
 return {isExactMatch:points.every(p=>[p.x,p.y,p.z].every(Number.isInteger))&&actual.size===points.length&&points.length===canonical.length&&incorrectCoordinates.length===0&&missingCoordinates.length===0,correctCoordinates,incorrectCoordinates,missingCoordinates};
}
