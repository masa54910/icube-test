import {TEST_STAGES,testStagesForRevision} from './test-stages';
import {baselineFor,scoreTest,type QuestionPerformance} from './CubeScoreEngine';
export interface TestRun {id:string;setId:'test-set-a';geometryRevision?:1|2|3;startedAt:string;currentQuestion:number;questionResults:QuestionPerformance[];current:QuestionPerformance;usedChoices:string[];memoEpoch:string;pendingOutcome?:boolean;finalAnnouncementSeen?:boolean;}
export interface TestResult {id:string;date:string;setId:string;raw:QuestionPerformance[];score:ReturnType<typeof scoreTest>;}
export interface TestSave {version:1;session:TestRun|null;history:TestResult[];best:TestResult|null;}
export type SolvePhase='gameplay'|'memo'|'answer'|'excluded';
const fresh=(index:number,revision:1|2|3):QuestionPerformance=>{const s=testStagesForRevision(revision)[index]!,b=baselineFor(s);return {stageId:s.id,baselineVersion:`synthetic-a-${revision}`,difficulty:b.difficultyIndex,baselineTime:b.baselineTime,effectiveSolveTime:0,gameplayTime:0,memoTime:0,answerTime:0,answerAttempts:0,stageRestarts:0,hintUsed:false,memoUsed:false,directSubmissionUsed:false,completed:false,interrupted:false};};
function validPerformance(value:unknown,index:number):value is QuestionPerformance {
 if(!value||typeof value!=='object')return false;
 const v=value as QuestionPerformance;
 return v.stageId===TEST_STAGES[index]?.id && ['difficulty','baselineTime','effectiveSolveTime','gameplayTime','memoTime','answerTime','answerAttempts','stageRestarts'].every(k=>Number.isFinite(v[k as keyof QuestionPerformance])&&Number(v[k as keyof QuestionPerformance])>=0)
  && Number.isInteger(v.answerAttempts)&&v.answerAttempts<=2&&Number.isInteger(v.stageRestarts)
  && ['hintUsed','memoUsed','directSubmissionUsed','completed','interrupted'].every(k=>typeof v[k as keyof QuestionPerformance]==='boolean');
}
function validResult(value:unknown):value is TestResult {
 if(!value||typeof value!=='object')return false;const v=value as TestResult;
 return typeof v.id==='string'&&Number.isFinite(Date.parse(v.date))&&v.setId==='test-set-a'&&Array.isArray(v.raw)&&v.raw.length===5&&v.raw.every(validPerformance)
  && !!v.score&&Number.isFinite(v.score.total)&&v.score.total>=0&&v.score.total<=1000&&Array.isArray(v.score.questions)&&v.score.questions.length===5&&Array.isArray(v.score.badges);
}
/** Owns only test performance; persistence is injected through the existing save adapter. */
export class TestSession {
 readonly data:TestSave;
 constructor(saved:TestSave|undefined,private persist:(data:TestSave)=>void){
  this.data={version:1,session:null,history:[],best:null};
  if(saved?.version!==1)return;
  this.data.history=Array.isArray(saved.history)?saved.history.filter(validResult).slice(-5).map(v=>structuredClone(v)):[];
  this.data.best=validResult(saved.best)?structuredClone(saved.best):null;
  const r=saved.session;
  if(r&&r.setId==='test-set-a'&&typeof r.id==='string'&&typeof r.memoEpoch==='string'&&Number.isFinite(Date.parse(r.startedAt))&&Number.isInteger(r.currentQuestion)&&r.currentQuestion>=0&&r.currentQuestion<5
   &&Array.isArray(r.questionResults)&&r.questionResults.length===r.currentQuestion&&r.questionResults.every(validPerformance)&&validPerformance(r.current,r.currentQuestion)
   &&Array.isArray(r.usedChoices)&&r.usedChoices.every(v=>typeof v==='string')){
   this.data.session=structuredClone(r);
   this.data.session.current.interrupted=true;
   // Older in-progress saves did not persist the terminal judgment. Two spent attempts
   // must never create a question that can neither be answered nor advanced.
   if(r.current.answerAttempts===2&&typeof r.pendingOutcome!=='boolean')this.data.session.pendingOutcome=r.current.completed;
  }
 }
 get run(){return this.data.session;}
 /** Explicit confirmed reset: only this optional TEST namespace is replaced. */
 clearResults(){this.data.session=null;this.data.history=[];this.data.best=null;this.save();}
 start(){const id=crypto.randomUUID();this.data.session={id,setId:'test-set-a',geometryRevision:3,startedAt:new Date().toISOString(),currentQuestion:0,questionResults:[],current:fresh(0,3),usedChoices:[],memoEpoch:id};this.save();}
 tick(ms:number,phase:SolvePhase){const r=this.run;if(!r||r.pendingOutcome!==undefined||phase==='excluded'||!Number.isFinite(ms)||ms<0)return;r.current.effectiveSolveTime+=ms;r.current[phase==='gameplay'?'gameplayTime':phase==='memo'?'memoTime':'answerTime']+=ms;}
 recordJudgment(correct:boolean){const r=this.run;if(!r||r.pendingOutcome!==undefined)return;r.current.completed=correct;if(correct||r.current.answerAttempts>=2)r.pendingOutcome=correct;this.save();}
 restart(){if(!this.run)return;this.run.current.stageRestarts++;this.run.current.interrupted=true;this.save();}
 finish(completed:boolean):TestResult|null {
  const r=this.run;if(!r)return null;r.current.completed=completed;r.questionResults.push(structuredClone(r.current));
  if(r.currentQuestion<4){r.currentQuestion++;r.current=fresh(r.currentQuestion,r.geometryRevision??1);r.usedChoices=[];delete r.pendingOutcome;this.save();return null;}
  const result:TestResult={id:r.id,date:new Date().toISOString(),setId:r.setId,raw:r.questionResults,score:scoreTest(r.questionResults)};
  this.data.history=[...this.data.history,result].slice(-5);if(!this.data.best||result.score.total>this.data.best.score.total)this.data.best=result;this.data.session=null;this.save();return result;
 }
 save(){this.persist(this.data);}
}
