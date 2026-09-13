import {it,expect} from 'vitest';
import {TestSession} from '../src/test-mode/TestSession';
import {testResetKeys,testResetTranslation} from '../src/i18n/testReset';
import type {Locale} from '../src/types';
import ui from '../src/ui/UIController.ts?raw';
import test from '../src/test-mode/TestUI.ts?raw';
it('confirmed clear removes only TEST data and survives reload',()=>{const normal={completed:['stage_1_1','advanced-route1-1'],settings:{bgm:true},memo:{regular:'kept'},cubeTest:{} as unknown};const before=JSON.stringify({...normal,cubeTest:undefined});const s=new TestSession(undefined,v=>normal.cubeTest=structuredClone(v));s.start();for(let i=0;i<5;i++)s.finish(true);s.start();expect(s.data.best).not.toBeNull();s.clearResults();expect(s.data).toEqual({version:1,session:null,history:[],best:null});expect(JSON.stringify({...normal,cubeTest:undefined})).toBe(before);expect(new TestSession(s.data,()=>{}).data).toEqual(s.data);});
it('translates explicit test-only reset and main CTA in all nine locales',()=>{for(const l of ['en','ja','ko','zh-CN','zh-TW','es','pt','de','fr'] as Locale[])for(const key of testResetKeys)expect(testResetTranslation(l,key)).toBeTruthy();});
it('prepends TEST before New / Continue / Stages / How without translating it as another row',()=>{expect(ui.indexOf("['new',t(")).toBeLessThan(ui.indexOf("['continue',t("));expect(test).toContain(".prepend(this.primaryCTA)");expect(ui).toContain('.menu-button:not(.test-primary-cta)');expect(test).toContain("data.session?'home.continueCubeTest':'home.takeCubeTest'");});
