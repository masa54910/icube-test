import type {StageDefinition,Vec3Tuple} from '../types';
export const CUBE_SCORE_MODEL_V1={version:'cube-score-1',baselineVersion:'synthetic-a-1',weights:[.12,.17,.20,.23,.28],components:{difficulty:.40,accuracy:.35,time:.25},secondTry:.78,hintMultiplier:.88,restartPenalty:.025,failureFloor:.16,ranks:[{min:900,rank:'S',label:'MASTERMIND'},{min:825,rank:'A',label:'ELITE MIND'},{min:725,rank:'B',label:'GENIUS'},{min:600,rank:'C',label:'INTELLIGENT'},{min:450,rank:'D',label:'SHARP'},{min:0,rank:'E',label:'CHALLENGER'}]} as const;
const clamp=(n:number,min=0,max=1)=>Math.max(min,Math.min(max,Number.isFinite(n)?n:min));
const distance=(a:Vec3Tuple,b:Vec3Tuple)=>a.reduce((s,v,i)=>s+Math.abs(v-b[i]!),0);
export function geometryMetrics(s:StageDefinition){
 const p=s.rooms,keys=new Set(p.map(v=>v.join())),span=[0,1,2].map(a=>Math.max(...p.map(v=>v[a]!))-Math.min(...p.map(v=>v[a]!))+1);
 const degree=p.map(v=>p.filter(q=>distance(v,q)===1).length);
 // Count geometric bends, not changes in the serialization order. Branches are
 // measured separately; a degree-two vertex bends unless its neighbours oppose.
 const turns=p.filter(v=>{const neighbours=p.filter(q=>distance(v,q)===1);return neighbours.length===2&&neighbours[0]!.some((n,a)=>(n+neighbours[1]![a]!)!==2*v[a]!);}).length;
 const mirror=p.filter(v=>keys.has([Math.min(...p.map(q=>q[0]))+Math.max(...p.map(q=>q[0]))-v[0],v[1],v[2]].join())).length/p.length;
 const compactness=p.length/(span[0]!*span[1]!*span[2]!);
 return {cubeCount:p.length,turnCount:turns,verticalTransitions:s.ladders.reduce((n,l)=>n+l.to[1]-l.from[1],0),floorSpan:span[1]!,routeLength:s.route?.main.length??p.length,compactness,asymmetry:1-mirror,protrusions:degree.filter(d=>d===1).length-2,branches:degree.filter(d=>d>2).length};
}
export function baselineFor(s:StageDefinition){
 const m=geometryMetrics(s);
 const raw=m.cubeCount*1.3+m.turnCount*2+m.verticalTransitions*4+m.floorSpan*2+m.routeLength*.2+(1-m.compactness)*4+m.asymmetry*3+Math.max(0,m.protrusions)+m.branches;
 const difficultyIndex=Math.round(clamp(raw/100)*100);
 // Synthetic thinking allowance + geometric traversal and interaction cost. Not human measurements.
 const baselineTime=Math.round((m.routeLength*6/3+ m.verticalTransitions*9 +m.turnCount*4 + m.cubeCount*4+30)*1000);
 return {difficultyIndex,baselineTime,baselineAttempts:1.4,source:'syntheticBaseline' as const,metrics:m};
}
export interface QuestionPerformance {stageId:string;baselineVersion?:string;difficulty:number;baselineTime:number;effectiveSolveTime:number;gameplayTime:number;memoTime:number;answerTime:number;answerAttempts:number;stageRestarts:number;hintUsed:boolean;memoUsed:boolean;directSubmissionUsed:boolean;completed:boolean;interrupted:boolean;}
/** Future aggregate calibration policy only; never changes the player's awarded score.
 * No telemetry is sent. Human medians must not incorporate fixtures or interrupted runs. */
export function calibrationEligibility(raw:QuestionPerformance,source:'human'|'syntheticBaseline'|'qa'='human'){
 const reasons:string[]=[];if(source!=='human')reasons.push(source);if(raw.interrupted)reasons.push('interrupted');if(!raw.completed)reasons.push('incomplete');
 if(!Number.isFinite(raw.effectiveSolveTime)||raw.effectiveSolveTime<Math.max(5000,raw.baselineTime*.05))reasons.push('impossible-fast');
 if(raw.effectiveSolveTime>raw.baselineTime*8)reasons.push('idle-outlier');return {eligible:reasons.length===0,reasons};
}
export function scoreQuestion(raw:QuestionPerformance){
 const c=CUBE_SCORE_MODEL_V1;
 const accuracy=raw.completed?clamp((raw.answerAttempts<=1?1:c.secondTry)*(raw.hintUsed?c.hintMultiplier:1)-Math.max(0,raw.stageRestarts)*c.restartPenalty):c.failureFloor;
 const ratio=clamp(raw.baselineTime/Math.max(1000,raw.effectiveSolveTime),.1,2);
 const time=raw.completed?clamp(.5+.5*Math.tanh(1.3*(ratio-1.05))):c.failureFloor;
 const spatial=raw.completed?clamp((.42+.52*accuracy)*(.96+.04*clamp(raw.difficulty/100))):c.failureFloor;
 const score=Math.round(1000*(c.components.difficulty*spatial+c.components.accuracy*accuracy+c.components.time*time));
 return {score,time,accuracy,spatial};
}
export function scoreTest(results:readonly QuestionPerformance[]){
 if(results.length!==5)throw Error('A complete test requires five results');
 const questions=results.map(scoreQuestion),weights=CUBE_SCORE_MODEL_V1.weights;
 const total=Math.round(questions.reduce((n,q,i)=>n+q.score*weights[i]!,0));
 const rank=CUBE_SCORE_MODEL_V1.ranks.find(r=>total>=r.min)!;
 const badges=[results.every(r=>r.completed&&r.answerAttempts===1)?'FIRST TRY':null,results.every(r=>!r.hintUsed)?'NO HINT':null,results.every(r=>r.completed&&r.effectiveSolveTime<r.baselineTime)?'FAST SOLVE':null,results.every(r=>r.completed)?'PERFECT ANSWER':null].filter((v):v is string=>!!v);
 return {total,rank:rank.rank,label:rank.label,questions,badges,scoreModelVersion:CUBE_SCORE_MODEL_V1.version,baselineVersion:results[0]!.baselineVersion??CUBE_SCORE_MODEL_V1.baselineVersion};
}
export function syntheticCalibration(stages:readonly StageDefinition[],baselineVersion='synthetic-a-3'){
 // The revised baseline already includes thinking/interaction time. The v2
 // Average adds 15% hesitation; this is a model assumption, not measured users.
 const profiles=[['Novice',2.3,2,3],['Careful',1.7,1,1],['Average',baselineVersion!=='synthetic-a-1'?1.15:1.4,2,1],['Fast',.8,2,1],['Accurate',1.2,1,0],['Memo-heavy',1.5,1,1],['No-Memo',1.4,2,1],['Route-strong',1.1,2,1],['Vertical-weak',1.8,2,2],['Expert',.85,1,0],['Fast + Accurate',.95,1,0],['Near-perfect',.5,1,0]] as const;
 return profiles.map(([name,multiplier,attempts,failures])=>{const raw=stages.map((s,i)=>{const b=baselineFor(s);return {stageId:s.id,baselineVersion,difficulty:b.difficultyIndex,baselineTime:b.baselineTime,effectiveSolveTime:b.baselineTime*multiplier,gameplayTime:b.baselineTime*multiplier,memoTime:0,answerTime:0,answerAttempts:attempts,stageRestarts:0,hintUsed:attempts===2&&i%2===0,memoUsed:name==='Memo-heavy',directSubmissionUsed:false,completed:i>=failures,interrupted:false};});return {name,source:'syntheticBaseline',raw,...scoreTest(raw)};});
}
