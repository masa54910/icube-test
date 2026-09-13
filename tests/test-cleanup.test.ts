import {beforeEach,it,expect,vi} from 'vitest';
import {TEST_STAGES,LEGACY_TEST_STAGES,testStagesForRevision} from '../src/test-mode/test-stages';
import {TestSession} from '../src/test-mode/TestSession';
import {baselineFor,geometryMetrics} from '../src/test-mode/CubeScoreEngine';
import {CubeMemoSystem} from '../src/game/CubeMemoSystem';
import {memoStageForRun} from '../src/game/MemoRun';
import {STAGES} from '../src/stages/stage-data';
import {testResetTranslation} from '../src/i18n/testReset';
import ui from '../src/ui/UIController.ts?raw';
import game from '../src/game/Game.ts?raw';
beforeEach(()=>{const storage=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>storage.get(k)??null,setItem:(k:string,v:string)=>storage.set(k,v)});});
it('reduces all five difficulties and Q5 floors, length and horizontal turns',()=>{
 expect(TEST_STAGES.map(s=>s.rooms.length)).toEqual([10,9,16,19,21]);
 TEST_STAGES.forEach((s,i)=>expect(baselineFor(s).difficultyIndex).toBeLessThan(baselineFor(LEGACY_TEST_STAGES[i]!).difficultyIndex));
 const q=TEST_STAGES[4]!,m=geometryMetrics(q);expect(m.floorSpan).toBe(3);expect(m.verticalTransitions).toBe(2);expect(m.branches).toBe(0);expect(m.protrusions).toBe(0);
 const headings=q.route!.main.slice(1).map((p,i)=>p.map((v,a)=>v-q.route!.main[i]![a]!)).filter(p=>p[1]===0);
 expect(headings.slice(1).filter((p,i)=>p.join()!==headings[i]!.join()).length).toBe(4);
 const total=TEST_STAGES.reduce((n,s)=>n+baselineFor(s).baselineTime,0);expect(total).toBeGreaterThanOrEqual(12*60000);expect(total).toBeLessThanOrEqual(15*60000);
 expect(baselineFor(q).baselineTime*1.2).toBeLessThan(4*60000); // synthetic hesitation, not human timing
});
it('keeps old in-progress geometry but starts revised questions for a fresh test',()=>{
 const old=new TestSession(undefined,()=>{});old.start();delete old.run!.geometryRevision;
 const restored=new TestSession(old.data,()=>{});expect(testStagesForRevision(restored.run!.geometryRevision)).toBe(LEGACY_TEST_STAGES);
 restored.finish(true);expect(restored.run!.current.baselineTime).toBe(baselineFor(LEGACY_TEST_STAGES[1]!).baselineTime);
 restored.start();expect(restored.run!.geometryRevision).toBe(3);expect(restored.run!.current.baselineVersion).toBe('synthetic-a-3');
});
it('new game has one origin, preserves prior notes, and Continue/Retry restore its own notes',()=>{
 const s=STAGES[0]!,system=new CubeMemoSystem(),old=system.get(s);old.add(1,0,0,'blue');
 const fresh=memoStageForRun(s,'run-b'),notes=system.get(fresh);expect(notes.cubes).toHaveLength(1);expect(notes.cubes[0]!.id).toBe('origin');
 notes.add(2,0,0,'navy');expect(system.get(fresh)).toBe(notes);expect(new CubeMemoSystem().get(fresh).cubes).toHaveLength(2);
 expect(new CubeMemoSystem().get(s).cubes[1]!.color).toBe('blue');expect(system.get(memoStageForRun(STAGES[1]!,'run-b')).cubes).toHaveLength(1);
});
it('each fresh TEST question starts with one origin and reload retains that question only',()=>{
 const session=new TestSession(undefined,()=>{});session.start();const epoch=session.run!.memoEpoch,system=new CubeMemoSystem();
 for(const s of TEST_STAGES){const scoped={...s,id:s.id+'@'+epoch};expect(memoStageForRun(scoped,'normal-run')).toBe(scoped);const notes=system.get(scoped);expect(notes.cubes).toHaveLength(1);notes.add(1,0,0);expect(new CubeMemoSystem().get(scoped).cubes).toHaveLength(2);}
});
it('removes top memo action and retains the mini entry and common controller',()=>{
 expect(ui).not.toContain('[data-memo]');expect(ui).not.toContain('memo.dataset.memo');expect(ui).toContain('new MiniMemoView(()=>this.cb.openMemo())');
 expect(game.match(/new PlayerController\(/g)).toHaveLength(1);expect(game).toContain('this.player.update(');
});
it('names CUBE TEST explicitly in all nine main CTA translations',()=>{
 for(const l of ['en','ja','ko','zh-CN','zh-TW','es','pt','de','fr'] as const)expect(testResetTranslation(l,'home.takeCubeTest')).toContain('CUBE TEST');
 expect(testResetTranslation('ja','home.takeCubeTest')).toBe('CUBE TESTを受ける');
});
