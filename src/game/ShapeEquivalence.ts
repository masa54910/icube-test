import type {Vec3Tuple} from '../types';
const axes:readonly Vec3Tuple[]=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const dot=(a:Vec3Tuple,b:Vec3Tuple)=>a.reduce((sum,v,i)=>sum+v*b[i]!,0);
export function normalizeShape(points:readonly Vec3Tuple[]):Vec3Tuple[]{
 if(!points.length)return [];
 const min=[0,1,2].map(i=>Math.min(...points.map(p=>p[i]!)));
 return points.map(p=>p.map((v,i)=>v-min[i]!) as unknown as Vec3Tuple).sort((a,b)=>a[0]-b[0]||a[1]-b[1]||a[2]-b[2]);
}
/** Right-handed orthonormal bases: determinant +1, never reflections. */
export function getAllRotations(points:readonly Vec3Tuple[]):Vec3Tuple[][]{
 const result:Vec3Tuple[][]=[];
 for(const a of axes)for(const b of axes){
  if(dot(a,b)!==0)continue;
  const c:Vec3Tuple=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  result.push(points.map(p=>[dot(p,a),dot(p,b),dot(p,c)]));
 }
 return result;
}
export const getCanonicalShapeKey=(points:readonly Vec3Tuple[])=>getAllRotations(points).map(p=>normalizeShape(p).map(v=>v.join(':')).join('|')).sort()[0]!;
export function areShapesRotationEquivalent(a:readonly Vec3Tuple[],b:readonly Vec3Tuple[]):boolean{
 const valid=(p:readonly Vec3Tuple[])=>p.length>0&&p.every(v=>v.every(Number.isInteger))&&new Set(p.map(v=>v.join(','))).size===p.length;
 return a.length===b.length&&valid(a)&&valid(b)&&getCanonicalShapeKey(a)===getCanonicalShapeKey(b);
}
