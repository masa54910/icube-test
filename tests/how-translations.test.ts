import {expect,it} from 'vitest';
import {how,howKeys} from '../src/i18n/how';
it('provides complete instruction text for all nine languages',()=>{
  expect(Object.keys(how)).toHaveLength(9);
  for(const values of Object.values(how)){
    expect(values).toHaveLength(howKeys.length);
    expect(values.every(v=>v.trim().length>0)).toBe(true);
    expect(values.join(' ')).not.toMatch(/ATTEMPTS|立方体の建物/);
  }
  expect(new Set(Object.values(how).map(v=>v[2])).size).toBe(9);
  expect(how.ja[1]).toBe('自由に探索');
});
