import {it,expect,vi,afterEach} from 'vitest';
import {TestUI} from '../src/test-mode/TestUI';
import {TestSession} from '../src/test-mode/TestSession';
import {t} from '../src/i18n';
afterEach(()=>vi.unstubAllGlobals());
it.each([true,false])('Q5 verdict %s remains visible until results button, once only',completed=>{
 const session=new TestSession(undefined,()=>{});session.start();for(let i=0;i<4;i++)session.finish(true);const result=session.finish(completed)!;
 const nodes:any[]=[];let advance=()=>{};
 vi.stubGlobal('document',{createElement:()=>({setAttribute:vi.fn(),textContent:'',className:''})});
 const ui:any={hud:{classList:{add:vi.fn()}},panel:vi.fn(()=>({append:(...items:any[])=>nodes.push(...items)})),button:vi.fn((label:string,action:()=>void)=>{advance=action;return {label};}),hide:vi.fn(),analyze:vi.fn()};
 TestUI.prototype.finalAnswerResult.call(ui,completed,result);
 expect(nodes[0].textContent).toBe(t(completed?'result.correct':'memo.answer.incorrect'));
 expect(ui.analyze).not.toHaveBeenCalled();expect(ui.panel).toHaveBeenCalledWith(t('test.question',{n:5}));
 advance();advance();expect(ui.analyze).toHaveBeenCalledTimes(1);expect(ui.analyze).toHaveBeenCalledWith(result);
 expect(result.raw[4]!.completed).toBe(completed);
});
