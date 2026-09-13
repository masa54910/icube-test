import {it,expect,vi} from 'vitest';
import {t,setLocale,SUPPORTED_LOCALES} from '../src/i18n';
import {loadLocale} from '../src/i18n/languageStore';
import ui from '../src/ui/UIController.ts?raw';
// @ts-expect-error Node builtin used only by Vitest; this browser project excludes Node types.
import {readFileSync} from 'node:fs';
const css=readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
it('stage labels, statuses, filters and sections resolve in all nine locales',()=>{
 const data=new Map<string,string>();vi.stubGlobal('document',{documentElement:{lang:'ja'}});vi.stubGlobal('localStorage',{getItem:(k:string)=>data.get(k)??null,setItem:(k:string,v:string)=>data.set(k,v)});
 const titles=new Set<string>();
 for(const l of SUPPORTED_LOCALES){setLocale(l);expect(loadLocale()).toBe(l);titles.add(t('stageSelect.title'));
  for(const key of ['stageSelect.title','stageSelect.all','stageSelect.alphabet','stageSelect.digits','stageSelect.shapes','game.stage','common.play','common.clear','common.back','advanced.standard','advanced.title','advanced.select'])expect(t(key).trim()).not.toBe('');
 }
 expect(titles.size).toBe(9);setLocale('ja');vi.unstubAllGlobals();
});
it('runtime subscription preserves group and scroll and reads global locale',()=>{
 expect(ui).toContain("if(this.view==='stage-select')this.refreshStageSelect?.()");
 expect(ui).toContain('lang.value=currentLocale()');
 expect(ui).toContain('this.showStageSelect(stages,completed,selectedGroup)');
 expect(ui).toContain("scrollTop=scroll");expect(ui).toContain('render(selectedGroup)');
});
it('stage header groups selector before Back with wrapped mobile layout',()=>{
 expect(ui).toContain('tools.append(lang,back)');expect(css).toContain('.stage-header-tools{display:flex');
 expect(css).toContain('.stage-language{position:static');expect(css).toContain('gap:32px');expect(css).toContain('flex-basis:100%');
});
