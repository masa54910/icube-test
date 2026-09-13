import {describe,it,expect} from 'vitest';
import {HomeShowcaseClock,HOME_SHOWCASE_INTERVAL_MS} from '../src/ui/HomeShowcaseClock';
describe('Home-only showcase clock',()=>{
  it('starts at BRAND and rotates twice in order',()=>{const c=new HomeShowcaseClock();const seen=[c.current];for(let i=0;i<10;i++){expect(c.tick(HOME_SHOWCASE_INTERVAL_MS,[true,true,true,true,true])).toBe(true);seen.push(c.current);}expect(seen).toEqual([0,1,2,3,4,0,1,2,3,4,0]);});
  it('manual selection resets the interval',()=>{const c=new HomeShowcaseClock();c.tick(9000,[true,true,true,true,true]);c.select(3);expect(c.tick(9999,[true,true,true,true,true])).toBe(false);expect(c.tick(1,[true,true,true,true,true])).toBe(true);expect(c.current).toBe(4);});
  it('skips unavailable assets and stays on BRAND if all fail',()=>{const c=new HomeShowcaseClock();c.tick(10000,[true,false,true,false,false]);expect(c.current).toBe(2);c.tick(10000,[true,false,true,false,false]);expect(c.current).toBe(0);expect(c.tick(10000,[true,false,false,false,false])).toBe(false);});
  it('returning Home discards previous presentation state',()=>{const c=new HomeShowcaseClock();c.select(4);c.tick(1000,[true,true,true,true,true]);c.reset();expect([c.current,c.elapsed]).toEqual([0,0]);});
});
