import type {StageDefinition,Vec3Tuple,LadderDefinition} from '../types';
import {extractMemoConfig} from './memo-config';
function path(points:readonly Vec3Tuple[]):Vec3Tuple[]{
 const result:Vec3Tuple[]=[points[0]!];for(const end of points.slice(1)){const start=result.at(-1)!;const axes=[0,1,2].filter(a=>start[a]!==end[a]);if(axes.length!==1)throw Error('Route segment must be axis aligned');const axis=axes[0]!;let p=[...start] as [number,number,number];while(p[axis]!==end[axis]){p=[...p];p[axis]=p[axis]!+Math.sign(end[axis]!-p[axis]!);result.push(p);}}return result;
}
export function validateRoute(stage:StageDefinition):void {
 const r=stage.route;if(!r||!stage.goal)throw Error('Missing route metadata');
 const keys=new Set(stage.rooms.map(p=>p.join(',')));if(keys.size!==stage.rooms.length||stage.rooms.some(p=>p.some(v=>!Number.isInteger(v))))throw Error('Invalid voxels');
 if(r.main[0]!.join(',')!==stage.start.join(',')||r.main.at(-1)!.join(',')!==stage.goal.join(','))throw Error('Invalid endpoints');
 r.main.forEach((p,i)=>{if(!keys.has(p.join(',')))throw Error('Missing main cube');if(i&&p.reduce((sum,v,a)=>sum+Math.abs(v-r.main[i-1]![a]!),0)!==1)throw Error('Disconnected route');});
 for(const d of r.distractors){if(!keys.has(d.join(','))||r.main.some(p=>p.join(',')===d.join(','))||!r.main.some(p=>p.reduce((s,v,a)=>s+Math.abs(v-d[a]!),0)===1))throw Error('Invalid distractor');}
 for(let i=1;i<r.main.length;i++){const a=r.main[i-1]!,b=r.main[i]!;if(a[1]!==b[1]&&!stage.ladders.some(l=>l.from[0]===a[0]&&l.from[2]===a[2]&&l.from[1]<=Math.min(a[1],b[1])&&l.to[1]>=Math.max(a[1],b[1])))throw Error('Missing vertical connection');}
}
function stage(n:number,name:string,waypoints:readonly Vec3Tuple[],distractors:readonly Vec3Tuple[]):StageDefinition {
 const main=path(waypoints),ladders:LadderDefinition[]=[];
 for(let i=1;i<main.length;i++){const a=main[i-1]!,b=main[i]!;if(a[1]!==b[1])ladders.push({id:'route-'+n+'-ladder-'+i,from:a[1]<b[1]?a:b,to:a[1]>b[1]?a:b});}
 const value:StageDefinition={id:'advanced_route_'+n,numericId:31+n,group:3,level:n,displayName:'A-'+n,subtitle:name,difficulty:n+2,section:'advanced',stageType:'route',rooms:[...main,...distractors],start:main[0]!,goal:main.at(-1)!,ladders,route:{main,distractors}};
 validateRoute(value);return {...value,memo:extractMemoConfig(value)};
}
export const ADVANCED_STAGES:readonly StageDefinition[]=[
 stage(1,'BASIC ROUTE',[[0,0,0],[3,0,0],[3,0,3],[6,0,3],[6,1,3],[8,1,3]],[[1,1,0],[3,1,2],[7,2,3]]),
 stage(2,'VERTICAL ROUTE',[[0,0,0],[4,0,0],[4,1,0],[4,1,3],[1,1,3],[1,2,3],[1,2,6],[4,2,6]],[[2,1,0],[4,2,2],[3,2,3],[1,3,5],[3,3,6]]),
 stage(3,'3D SNAKE',[[0,0,0],[4,0,0],[4,0,3],[4,1,3],[1,1,3],[1,1,6],[1,2,6],[4,2,6],[4,2,9],[4,1,9],[6,1,9]],[[1,1,0],[3,1,0],[5,0,2],[3,2,3],[0,1,5],[2,3,6],[4,3,8],[6,2,9]])
];
