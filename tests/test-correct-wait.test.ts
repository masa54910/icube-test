import {it,expect} from 'vitest';
import {TestSession} from '../src/test-mode/TestSession';
import {cubeTestTranslation} from '../src/i18n/cubeTest';
import {GameState,StateMachine} from '../src/game/GameState';
it('saved correct reveal follows permitted state transitions without judging again',()=>{
 const state=new StateMachine();
 for(const next of [GameState.Loading,GameState.Title,GameState.Exploration,GameState.Quiz,GameState.AnswerResult,GameState.Reveal,GameState.StageResult])state.transition(next);
 expect(state.state).toBe(GameState.StageResult);
});
it('all five correct outcomes wait through time and reload until explicit finish',()=>{
 let s=new TestSession(undefined,()=>{});s.start();
 for(let q=0;q<5;q++){
  s.run!.current.answerAttempts=1;s.tick(120000,'gameplay');s.recordJudgment(true);
  const time=s.run!.current.effectiveSolveTime;
  s.tick(600000,'gameplay');expect(s.run!.current.effectiveSolveTime).toBe(time);
  s=new TestSession(structuredClone(s.data),()=>{});
  expect(s.run!.currentQuestion).toBe(q);expect(s.run!.pendingOutcome).toBe(true);
  expect(s.run!.current.completed).toBe(true);expect(s.data.history).toHaveLength(0);
  const result=s.finish(true);
  if(q<4){expect(result).toBeNull();expect(s.run!.currentQuestion).toBe(q+1);}
  else{expect(result!.raw).toHaveLength(5);expect(s.run).toBeNull();expect(s.data.history).toHaveLength(1);}
 }
});
it('final result action is localized in all nine languages',()=>{
 for(const l of ['en','ja','ko','zh-CN','zh-TW','es','pt','de','fr'] as const)expect(cubeTestTranslation(l,'test.seeResults')).toBeTruthy();
});
