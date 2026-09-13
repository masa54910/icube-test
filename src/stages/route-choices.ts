import type {ShapeChoice,StageDefinition,Vec3Tuple} from '../types';
import {normalizeVoxels,isConnected,shapeKey} from './stage-utils';
import {isPurePath} from './pure-route';
const directions:Vec3Tuple[]=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const key=(p:Vec3Tuple)=>p.join(',');
const plus=(p:Vec3Tuple,d:Vec3Tuple):Vec3Tuple=>[p[0]+d[0],p[1]+d[1],p[2]+d[2]];
/** Hash the 24 proper cube rotations, not reflections. Only used for duplicate rejection. */
export function routeRotationKey(cubes:readonly Vec3Tuple[]):string {
 const hashes:string[]=[];
 for(const a of directions)for(const b of directions){if(a.reduce((s,v,i)=>s+v*b[i]!,0)!==0)continue;const c:Vec3Tuple=[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
  hashes.push(shapeKey(cubes.map(p=>[p.reduce((s,v,i)=>s+v*a[i]!,0),p.reduce((s,v,i)=>s+v*b[i]!,0),p.reduce((s,v,i)=>s+v*c[i]!,0)])));
 }return hashes.sort()[0]!;
}
export interface RouteChoice extends ShapeChoice {readonly routeDifficulty:'correct'|'easy'|'medium'|'hard';readonly mutation:string;}
export function buildRouteChoices(stage:StageDefinition):RouteChoice[]{
 if(stage.routeChapter===1)return buildPureChoices(stage);
 if(!stage.route||!stage.memo)throw Error('Missing route canonical: '+stage.id);
 const canonical=normalizeVoxels(stage.memo.canonicalCubes),main=stage.route.main,distractors=stage.route.distractors;
 const result:RouteChoice[]=[{id:'correct',correct:true,voxels:canonical,routeDifficulty:'correct',mutation:'canonical-normalize-only'}];
 const seen=new Set([routeRotationKey(canonical)]);
 const accept=(cubes:readonly Vec3Tuple[],tier:RouteChoice['routeDifficulty'],mutation:string)=>{
  if(cubes.length<canonical.length-3||cubes.length>canonical.length+3||new Set(cubes.map(key)).size!==cubes.length||!isConnected(cubes))return false;
  const hash=routeRotationKey(cubes);if(seen.has(hash))return false;seen.add(hash);result.push({id:'route-'+tier+'-'+result.length,correct:false,voxels:normalizeVoxels(cubes),routeDifficulty:tier,mutation});return true;
 };
 // A single bend reversal moves its downstream segment rigidly; it does not compress the path.
 for(let i=1;i<main.length-1&&result.length<4;i++){
  const pivot=main[i]!,previous=main[i-1]!,next=main[i+1]!;
  const incoming=pivot.map((v,a)=>v-previous[a]!),axis=next.findIndex((v,a)=>v!==pivot[a]);if(incoming[axis]!==0)continue;
  const reflect=(p:Vec3Tuple):Vec3Tuple=>p.map((v,a)=>a===axis?2*pivot[a]!-v:v) as unknown as Vec3Tuple;
  const tail=main.map((p,j)=>j>i?reflect(p):p);
  const accessories=distractors.map(d=>{const anchor=main.findIndex(p=>p.reduce((s,v,a)=>s+Math.abs(v-d[a]!),0)===1);return anchor>i?reflect(d):d;});
  accept([...tail,...accessories],'easy','reverse-bend-'+i);
 }
 if(Number(result.length)!==4)throw Error('Need three distinct route bends: '+stage.id);
 const end=main.at(-1)!,before=main.at(-2)!,direction=end.map((v,a)=>v-before[a]!) as unknown as Vec3Tuple;
 accept([...stage.rooms,plus(end,direction)],'medium','extend-end-1');
 accept(stage.rooms.filter(p=>key(p)!==key(end)),'medium','shorten-end-1');
 for(const d of distractors){if(result.length>=8)break;const anchor=main.find(p=>p.reduce((s,v,a)=>s+Math.abs(v-d[a]!),0)===1)!;
  for(const offset of directions){if(result.length>=8)break;const moved=plus(anchor,offset);if(key(moved)===key(d))continue;accept([...stage.rooms.filter(p=>key(p)!==key(d)),moved],'medium','relocate-protrusion-'+key(d)+'-to-'+key(moved));}
 }
 if(Number(result.length)!==8)throw Error('Need four medium route mutations: '+stage.id);
 for(const d of distractors){if(result.length>=10)break;accept(stage.rooms.filter(p=>key(p)!==key(d)),'hard','missing-protrusion-'+key(d));}
 if(Number(result.length)!==10)throw Error('Need two hard route mutations: '+stage.id);
 if(result.filter(c=>shapeKey(c.voxels)===shapeKey(canonical)).length!==1)throw Error('Canonical must appear exactly once');
 return result;
}
function buildPureChoices(stage:StageDefinition):RouteChoice[]{
 const main=stage.route!.main,canonical=normalizeVoxels(stage.memo!.canonicalCubes),seen=new Set([routeRotationKey(canonical)]),result:RouteChoice[]=[{id:'correct',correct:true,voxels:canonical,routeDifficulty:'correct',mutation:'canonical-normalize-only'}];
 const add=(path:readonly Vec3Tuple[],tier:RouteChoice['routeDifficulty'],mutation:string)=>{if(!isPurePath(path)||Math.abs(path.length-main.length)>3)return false;const hash=routeRotationKey(path);if(seen.has(hash))return false;seen.add(hash);result.push({id:'pure-'+result.length,voxels:normalizeVoxels(path),correct:false,routeDifficulty:tier,mutation});return true;};
 // Reserve the one-cube endpoint omission as the most similar answer.
 add(main.slice(0,-1),'hard','shorten-goal-1');
 for(let i=1;i<main.length-2&&result.length<7;i++){
 const pivot=main[i]!,before=main[i-1]!,next=main[i+1]!;if(before.map((v,a)=>pivot[a]!-v).join()===next.map((v,a)=>v-pivot[a]!).join())continue;
 for(const axis of [0,2,1]){if(result.length>=7)break;add(main.map((p,j)=>j<=i?p:p.map((v,a)=>a===axis?2*pivot[a]!-v:v) as unknown as Vec3Tuple),'easy',`reverse-after-${i}-axis-${axis}`);}}
 // If a bend reflection overlaps the earlier path, a quarter-turn of the downstream route is another single structural edit.
 for(let i=2;i<main.length-2&&result.length<7;i++)for(const sign of [1,-1]){if(result.length>=7)break;const p=main[i]!;add(main.map((v,j)=>j<=i?v:[p[0]+sign*(v[2]-p[2]),v[1],p[2]-sign*(v[0]-p[0])]),'easy',`turn-tail-${i}-${sign}`);}
 if(Number(result.length)!==7)throw Error('Pure route needs 5 easy answers: '+stage.id);
 for(let i=1;i<main.length&&result.length<10;i++){const a=main[i-1]!,b=main[i]!,d=b.map((v,k)=>v-a[k]!) as unknown as Vec3Tuple;if(d[1])continue;
 // Insert one cube into a run and translate its suffix, retaining a continuous path.
 const shifted=main.map((p,j)=>j<i?p:plus(p,d));add([...shifted.slice(0,i),b,...shifted.slice(i)],'medium',`lengthen-run-${i}`);
 }
 if(Number(result.length)!==10)throw Error('Pure route needs 3 medium answers: '+stage.id);return result;
}
