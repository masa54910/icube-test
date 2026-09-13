import {describe,it,expect} from 'vitest';
import {memoHelp,memoHelpTranslation,type MemoHelpKey} from '../src/i18n/memoHelp';
import source from '../src/ui/HowToMemo.ts?raw';
import ui from '../src/ui/UIController.ts?raw';
describe('Memo help presentation',()=>{
 it.each(Object.keys(memoHelp) as (keyof typeof memoHelp)[])('%s has complete localized instructions',locale=>{
  expect(Object.keys(memoHelp[locale]).sort()).toEqual(Object.keys(memoHelp.en).sort());
  for(const key of Object.keys(memoHelp.en) as MemoHelpKey[])expect(memoHelpTranslation(locale,key)?.trim().length).toBeGreaterThan(0);
  if(locale!=='en')expect(memoHelp[locale]['howToPlay.memo.body']).not.toBe(memoHelp.en['howToPlay.memo.body']);
 });
 it('preserves official Japanese copy and explains manual extension',()=>{
  expect(memoHelp.ja['memo.stock.instructions']).toBe('立方体を右のワークスペースにドラッグします。\nまたは、ワークスペース内の立方体の面を指定してから、延ばしたい方向へドラッグでも可。');
  expect(memoHelp.ja['howToPlay.memo.body']).toContain('通ったキューブはCUBE MEMOで記録できる。');
  expect(memoHelp.ja['howToPlay.memo.hint']).toContain('正解全体が表示されるわけではありません');
  expect(memoHelp.ja['howToPlay.memo.scope']).toContain('1-1');
 });
 it('keeps tutorial presentation separate from the live editor',()=>{
  expect(source).not.toMatch(/CubeMemoStore|MemoViewport|PlayerController/);expect(source).toContain('assets/howto/cube-memo.png');
  expect(ui).toContain('body.append(grid,createHowToMemo())');
 });
});
