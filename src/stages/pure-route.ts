import type {StageDefinition,Vec3Tuple,LadderDefinition} from '../types';
import {extractMemoConfig} from './memo-config';
const delta=(a:Vec3Tuple,b:Vec3Tuple)=>a.map((v,i)=>v-b[i]!) as unknown as Vec3Tuple;
const distance=(a:Vec3Tuple,b:Vec3Tuple)=>a.reduce((s,v,i)=>s+Math.abs(v-b[i]!),0);
export function isPurePath(path:readonly Vec3Tuple[]):boolean{
 return new Set(path.map(p=>p.join(','))).size===path.length&&path.every((p,i)=>p.every(Number.isInteger)&&(!i||distance(p,path[i-1]!)===1)&&path.filter(q=>distance(p,q)===1).length===(i===0||i===path.length-1?1:2));
}
export function routeAudit(stage:StageDefinition){
 const p=stage.route!.main;let turns=0,vertical=0,last:Vec3Tuple|null=null,run=0,longest=0;const runs:{start:number;end:number;direction:Vec3Tuple}[]=[];let start=0,previous:Vec3Tuple|null=null;
 for(let i=1;i<p.length;i++){const d=delta(p[i]!,p[i-1]!);if(previous&&d.join()!==previous.join()){if(previous[1]===0)runs.push({start,end:i-1,direction:previous});start=i-1;}previous=d;if(d[1]){vertical++;run=0;}else{if(last&&last.join()!==d.join())turns++;last=d;run=(i>1&&delta(p[i-1]!,p[i-2]!).join()===d.join()?run:0)+1;longest=Math.max(longest,run+1);}}
 if(previous?.[1]===0)runs.push({start,end:p.length-1,direction:previous});
 const span=[0,1,2].map(a=>Math.max(...p.map(v=>v[a]!))-Math.min(...p.map(v=>v[a]!))+1);
 return {cubes:p.length,turns,floors:new Set(p.map(v=>v[1])).size,vertical,longest,span,verticalSpan:span[1]!,horizontalSpan:Math.max(span[0]!,span[2]!),runs,answers:stage.answerPoints?.length??1,boosts:stage.boostPads?.length??0};
}
/** QA summary for answer terminals, expressed as progress along the authored route. */
export function answerZoneAudit(stage:StageDefinition){
 const route=stage.route?.main??[];const index=new Map(route.map((p,i)=>[p.join(','),i]));
 const progress=(stage.answerPoints??[]).map(p=>(index.get(p.join(','))??0)/Math.max(1,route.length-1)).sort((a,b)=>a-b);
 const minGap=progress.length>1?Math.min(...progress.slice(1).map((p,i)=>p-progress[i]!)):1;
 return {count:progress.length,progress,minGap,clustered:minGap<Math.max(.05,1.5/Math.max(1,route.length-1))};
}
export function validatePureRoute(s:StageDefinition):void{
 const p=s.route!.main;if(!isPurePath(p)||s.route!.distractors.length||s.rooms.length!==p.length||s.rooms.some(r=>!p.some(v=>v.join()===r.join())))throw Error('Not a pure path: '+s.id);
 if(p[0]!.join()!==s.start.join()||p.at(-1)!.join()!==s.goal?.join())throw Error('Endpoints: '+s.id);
 const audit=routeAudit(s);if(audit.vertical!==s.ladders.length)throw Error('Ladder coverage');
 for(const a of s.answerPoints??[])if(!p.some(v=>v.join()===a.join())||s.ladders.some(l=>distance(a,l.from)<=1||distance(a,l.to)<=1))throw Error('Unsafe answer: '+s.id);
 for(const b of s.boostPads??[]){const run=audit.runs.find(r=>r.direction.join()===b.direction.join()&&p.slice(r.start,r.end+1).some(v=>v.join()===b.position.join()));if(!run||run.end-run.start<6)throw Error('Boost needs seven cubes');const index=p.findIndex(v=>v.join()===b.position.join());if(index+b.distance>run.end-2||b.distance<=0)throw Error('Boost end unsafe');for(let i=index;i<=index+b.distance+1;i++)if(s.answerPoints?.some(a=>a.join()===p[i]!.join()))throw Error('Boost/answer interference');}
}
// Explicit signed axes: each stage has its own silhouette, not one shared zigzag template.
type Run=readonly [axis:'x'|'y'|'z',steps:number];
const designs=[
 {name:'THREE TURNS',runs:[['x',4],['z',3],['y',1],['x',-4],['z',4]],answers:2,boosts:0},
 {name:'TALL ROUTE',runs:[['x',3],['y',1],['z',4],['y',1],['x',-3],['y',1],['z',-4],['y',1],['x',3]],answers:2,boosts:0},
 {name:'LONG + TALL',runs:[['x',7],['y',1],['z',4],['y',1],['x',-3],['y',1],['z',3],['y',1],['x',4]],answers:2,boosts:1},
 {name:'S ROUTE',runs:[['x',4],['z',3],['x',-5],['y',1],['z',3],['x',3],['y',-1],['z',2]],answers:3,boosts:0},
 {name:'SPIRAL / WHIRL',runs:[['x',6],['y',1],['z',6],['x',-4],['z',-4],['x',2],['z',2]],answers:3,boosts:0},
 {name:'U-TURN STACK',runs:[['x',7],['z',3],['x',-7],['y',1],['z',3],['x',4],['y',1],['x',1]],answers:3,boosts:2},
 {name:'VERTICAL SNAKE',runs:[['x',4],['y',1],['z',2],['x',-4],['y',1],['z',2],['x',4],['y',1],['z',2],['x',-4],['y',1],['z',2]],answers:3,boosts:0},
 {name:'CORKSCREW',runs:[['x',4],['y',1],['z',4],['y',1],['x',-4],['y',1],['z',-4],['y',1],['x',4],['y',1],['z',3]],answers:3,boosts:0},
 {name:'WIDE + TALL',runs:[['x',7],['y',1],['z',3],['y',1],['x',-7],['y',1],['z',3],['x',4]],answers:3,boosts:2},
 {name:'PURE ROUTE FINAL v2',runs:[['x',7],['y',1],['z',3],['x',-5],['y',1],['z',3],['x',3],['y',1],['z',-2],['x',-2],['y',1],['z',-3],['y',-1],['x',-2]],answers:4,boosts:1}
] as const satisfies readonly {name:string;runs:readonly Run[];answers:number;boosts:number}[];
export const PURE_ROUTE_STAGES:readonly StageDefinition[]=designs.map((design,n)=>{
 const main:Vec3Tuple[]=[[0,0,0]],ladders:LadderDefinition[]=[];let current:Vec3Tuple=main[0]!;
 design.runs.forEach(([axis,steps],run)=>{const a={x:0,y:1,z:2}[axis],sign=Math.sign(steps);for(let j=0;j<Math.abs(steps);j++){const before=current;current=current.map((v,i)=>v+(i===a?sign:0)) as unknown as Vec3Tuple;main.push(current);if(axis==='y')ladders.push({id:`pure-${n+1}-${run}-${j}`,from:sign>0?before:current,to:sign>0?current:before});}});
 const base:StageDefinition={id:`advanced-route1-${n+1}`,numericId:101+n,group:3,level:n+1,displayName:`1-${n+1}`,subtitle:design.name,difficulty:n+3,section:'advanced',stageType:'route',routeChapter:1,rooms:main,start:main[0]!,goal:main.at(-1)!,ladders,route:{main,distractors:[]}};
 // Prior six-step runs used a three-cube boost. Seven-step runs now allow exactly four,
 // while retaining two complete cubes before the next turn/ladder/end.
 const runs=routeAudit(base).runs;const boostPads=runs.filter(r=>r.end-r.start>=7).slice(0,design.boosts).map(r=>({position:main[r.start+1]!,direction:r.direction,distance:4}));
 const eligible=main.map((p,i)=>({p,i})).filter(({p,i})=>i>=4&&!ladders.some(l=>distance(p,l.from)<=1||distance(p,l.to)<=1)&&!boostPads.some(b=>{const start=main.findIndex(v=>v.join()===b.position.join());return i>=start-1&&i<=start+b.distance+1;}));
 const answerPoints:Vec3Tuple[]=[];for(let j=0;j<design.answers;j++){const target=(j+1)*main.length/design.answers-1;const candidate=eligible.filter(({p})=>!answerPoints.some(a=>distance(a,p)<2)).sort((a,b)=>Math.abs(a.i-target)-Math.abs(b.i-target))[0];if(!candidate)throw Error('No safe answer placement: '+base.id+' eligible='+eligible.map(v=>v.i));answerPoints.push(candidate.p);}
 // Chapter entrance: first answer opportunity is on 2F after the ladder, then at the goal.
 if(n===0){answerPoints[0]=main[10]!;answerPoints[1]=main.at(-1)!;}
 const stage={...base,boostPads,answerPoints,memo:extractMemoConfig(base)};validatePureRoute(stage);return stage;
});
