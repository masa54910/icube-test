import {describe,it,expect} from 'vitest';
import {fitMini,miniColor} from '../src/ui/MiniMemoView';
import {memoHelp} from '../src/i18n/memoHelp';
describe('mini memo presentation',()=>{
 it('fits a hundred cubes and extreme aspect ratios',()=>{const cubes=Array.from({length:100},(_,i)=>({x:i%10,y:Math.floor(i/10),z:i%3}));for(const aspect of [.5,1,2]){const fit=fitMini(cubes,aspect);expect(fit.halfHeight).toBeGreaterThan(5);expect(Number.isFinite(fit.distance)).toBe(true);}});
 it('hint appearance never mutates the user color',()=>{const c={id:'a',x:1,y:0,z:0,color:'navy' as const,order:1,hintState:'correct' as const};expect(miniColor(c,true)).toBe(0x69dcf3);expect(c.color).toBe('navy');});
 it('provides all mini copy in nine locales',()=>{expect(Object.keys(memoHelp)).toHaveLength(9);for(const dict of Object.values(memoHelp))for(const k of ['memo.mini.title','memo.mini.open','memo.mini.empty'] as const)expect(dict[k].length).toBeGreaterThan(0);});
});
