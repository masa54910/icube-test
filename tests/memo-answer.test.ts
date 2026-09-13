import {it,expect,vi} from 'vitest';
import {CubeMemoStore} from '../src/game/CubeMemo';
import {memoDirectCopy as memoAnswerCopy} from '../src/i18n/memoDirect';
import {memoHelpTranslation} from '../src/i18n/memoHelp';
it('flush preserves committed notes and history before answer entry',()=>{
 const data=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>data.set(k,v)});
 const s=new CubeMemoStore('answer-qa',[[0,0,0],[1,0,0]]);s.add(1,0,0,'cyan');s.unlockHint();s.useHint();
 const before=JSON.stringify(s.cubes);s.flush();expect(s.canUndo).toBe(true);expect(JSON.stringify(s.cubes)).toBe(before);
 const restored=new CubeMemoStore('answer-qa',[[0,0,0],[1,0,0]]);expect(restored.cubes.map(({id,...c})=>c)).toEqual(s.cubes.map(({id,...c})=>c));expect(restored.hintUsed).toBe(true);
 s.undoOnce();s.flush();expect(s.canRedo).toBe(true);vi.unstubAllGlobals();
});
it.each(Object.keys(memoAnswerCopy) as (keyof typeof memoAnswerCopy)[])('%s translates CTA and live tutorial',l=>{
 expect(memoHelpTranslation(l,'memo.answer')).toBe(memoAnswerCopy[l][0]);
 expect(memoHelpTranslation(l,'howToPlay.memo.body')).toContain(memoAnswerCopy[l][6]);
 expect(memoAnswerCopy[l].every(v=>v.length>0)).toBe(true);
});
