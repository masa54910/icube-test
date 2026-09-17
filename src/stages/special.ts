import type {CubeColor,ShapeChoice,StageDefinition,Vec3Tuple} from '../types';
import {extractMemoConfig} from './memo-config';
import {getCanonicalShapeKey,getColoredShapeKey} from '../game/ShapeEquivalence';

const designs:readonly (readonly Vec3Tuple[])[]=[
 [[0,0,0],[1,0,0],[2,0,0],[2,0,1]],
 [[0,0,0],[1,0,0],[1,0,1],[1,0,2],[2,0,2]],
 [[0,0,0],[1,0,0],[2,0,0],[2,1,0],[2,1,1],[3,1,1]],
 [[0,0,0],[0,0,1],[1,0,1],[2,0,1],[2,1,1],[2,1,2],[1,1,2]],
 [[0,0,0],[1,0,0],[1,0,1],[1,1,1],[2,1,1],[3,1,1],[3,1,2],[3,2,2],[2,2,2]],
];
const palette:readonly CubeColor[]=['white','red','yellow','green','blue','orange'];
export const SPECIAL_STAGES:readonly StageDefinition[]=designs.map((rooms,i)=>{
 const stage:StageDefinition={id:`special-${i+1}`,numericId:501+i,group:3,level:i+1,displayName:`SPECIAL ${i+1}`,subtitle:'カラーキューブ',difficulty:i+1,section:'special',stageType:'shape',rooms,start:rooms[0]!,goal:rooms.at(-1)!,colors:rooms.map((_,j)=>palette[j%palette.length]!),ladders:rooms.flatMap((p,j)=>{const q=rooms[j+1];return q&&q[1]!==p[1]?[{id:`special-${i+1}-ladder-${j}`,from:p,to:q}]:[];})};
 return {...stage,memo:extractMemoConfig(stage)};
});
const directions:readonly Vec3Tuple[]=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const adjacent=(a:Vec3Tuple,b:Vec3Tuple)=>a.reduce((n,v,i)=>n+Math.abs(v-b[i]!),0)===1;
function connected(points:readonly Vec3Tuple[]):boolean {
 const seen=new Set([0]),queue=[0];
 for(let i=0;i<queue.length;i++)points.forEach((p,j)=>{if(!seen.has(j)&&adjacent(points[queue[i]!]!,p)){seen.add(j);queue.push(j);}});
 return seen.size===points.length;
}
/** Four similar, connected silhouettes, each made by relocating exactly one cube. */
function similarShapes(rooms:readonly Vec3Tuple[]):readonly (readonly Vec3Tuple[])[]{
 const shapes:(readonly Vec3Tuple[])[]=[rooms],seen=new Set([getCanonicalShapeKey(rooms)]);
 for(let moved=rooms.length-1;moved>=0;moved--)for(const anchor of rooms)for(const direction of directions){
  const next=anchor.map((v,i)=>v+direction[i]!) as unknown as Vec3Tuple;
  if(rooms.some(p=>p.every((v,i)=>v===next[i])))continue;
  const candidate=rooms.map((p,i)=>i===moved?next:p);
  if(!connected(candidate))continue;
  const key=getCanonicalShapeKey(candidate);if(seen.has(key))continue;
  seen.add(key);shapes.push(candidate);if(shapes.length===5)return shapes;
 }
 throw Error('Insufficient similar SPECIAL shapes');
}
/** Ten choices = five different silhouettes, each with two distinct color arrangements. */
export function buildSpecialChoices(stage:StageDefinition):ShapeChoice[]{
 if(!stage.colors)throw Error('SPECIAL requires room colors');
 const choices:ShapeChoice[]=[];
 similarShapes(stage.rooms).forEach((voxels,group)=>{
  const colors=stage.colors!;const key=getColoredShapeKey(voxels,colors);
  let alternate:CubeColor[]|undefined;
  for(let a=0;a<colors.length&&!alternate;a++)for(let b=a+1;b<colors.length;b++){
   const swapped=[...colors];[swapped[a],swapped[b]]=[swapped[b]!,swapped[a]!];
   if(getColoredShapeKey(voxels,swapped)!==key){alternate=swapped;break;}
  }
  if(!alternate)throw Error('Insufficient distinct SPECIAL color arrangements');
  choices.push({id:group===0?'correct':`shape-${group}-a`,voxels,colors,correct:group===0},{id:`shape-${group}-b`,voxels,colors:alternate,correct:false});
 });
 return choices;
}
