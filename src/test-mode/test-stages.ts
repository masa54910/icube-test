import type {StageDefinition,Vec3Tuple,LadderDefinition} from '../types';
import {extractMemoConfig} from '../stages/memo-config';
type Run=readonly [axis:0|1|2,steps:number];
type Design={name:string;runs:readonly Run[];extra:readonly Vec3Tuple[]};
const legacyDesigns:readonly Design[]=[
 {name:'ENTRY',runs:[[0,3],[2,2],[1,1],[0,-2]],extra:[[1,0,1]]},
 {name:'BASIC 3D',runs:[[0,3],[2,3],[1,1],[0,-3],[2,2]],extra:[[1,0,1],[2,1,3]]},
 {name:'VERTICAL',runs:[[0,3],[1,1],[2,3],[0,-2],[1,1],[2,3],[0,2]],extra:[[1,0,1],[2,2,4]]},
 {name:'COMPLEX SHAPE',runs:[[0,4],[2,3],[1,1],[0,-3],[2,3],[1,1],[0,3],[2,-2]],extra:[[2,0,1],[2,1,4],[3,2,5]]},
 {name:'FINAL ROUTE',runs:[[0,7],[1,1],[2,3],[0,-3],[1,1],[2,3],[0,2],[1,1],[2,2],[0,-2]],extra:[]},
];
const designs:readonly Design[]=[
 {name:'ENTRY',runs:[[0,5],[2,4]],extra:[]},
 {name:'BASIC 3D',runs:[[0,4],[2,4],[1,1],[0,-3]],extra:[]},
 {name:'VERTICAL',runs:[[0,4],[1,1],[2,4],[0,-3],[1,1],[2,2]],extra:[]},
 {name:'COMPLEX SHAPE',runs:[[0,4],[2,3],[1,1],[0,-3],[2,3],[1,1],[0,3]],extra:[]},
 {name:'FINAL ROUTE',runs:[[0,7],[1,1],[2,3],[0,-3],[1,1],[2,3],[0,2]],extra:[]},
];
const buildStages=(definitions:readonly Design[]):readonly StageDefinition[]=>definitions.map((design,index)=>{
 const main:Vec3Tuple[]=[[0,0,0]],ladders:LadderDefinition[]=[];
 for(const [axis,steps] of design.runs)for(let i=0;i<Math.abs(steps);i++){
  const a=main.at(-1)!,b=a.map((v,j)=>v+(axis===j?Math.sign(steps):0)) as unknown as Vec3Tuple;main.push(b);
  if(axis===1)ladders.push({id:`test-${index+1}-${main.length}`,from:steps>0?a:b,to:steps>0?b:a});
 }
 const rooms=[...main,...design.extra.filter(e=>!main.some(p=>p.join()===e.join()))];
 const base:StageDefinition={id:`test-set-a-q${index+1}`,numericId:201+index,group:3,level:index+1,displayName:`Q${index+1}`,subtitle:design.name,difficulty:index+1,section:'test',stageType:index===4?'route':'shape',rooms,start:main[0]!,goal:main.at(-1)!,ladders,answerPoints:[main.at(-1)!],...(index===4?{route:{main,distractors:[]},boostPads:[{position:main[1]!,direction:[1,0,0] as Vec3Tuple,distance:4}]}:{})};
  return {...base,...(index===4?{routeChapter:1}:{}),memo:extractMemoConfig(base)};
});
/** Existing runs retain their exact geometry and memo coordinate contract. */
export const LEGACY_TEST_STAGES=buildStages(legacyDesigns);
export const TEST_STAGES_V2=buildStages(designs);
// Front elevation (+X right, +Y up): top bar 4, middle bar 3, stem 4.
const fRooms:readonly Vec3Tuple[]=[[0,0,0],[0,1,0],[0,2,0],[0,3,0],[1,3,0],[2,3,0],[3,3,0],[1,1,0],[2,1,0]];
const fBase:StageDefinition={...TEST_STAGES_V2[1]!,subtitle:'BASIC 3D — F',rooms:fRooms,start:[0,0,0],goal:[3,3,0],answerPoints:[[2,1,0],[3,3,0]],ladders:[{id:'test-q2-f-stem',from:[0,0,0],to:[0,3,0]}]};
export const TEST_STAGES:readonly StageDefinition[]=TEST_STAGES_V2.map((s,i)=>i===1?{...fBase,memo:extractMemoConfig(fBase)}:s);
export const testStagesForRevision=(revision:1|2|3=1)=>revision===3?TEST_STAGES:revision===2?TEST_STAGES_V2:LEGACY_TEST_STAGES;
