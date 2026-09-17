import {it,expect,vi,afterEach} from 'vitest';
import {t,setLocale,locale,SUPPORTED_LOCALES} from '../src/i18n';
import {specialSubtitle} from '../src/i18n/special';
const original=locale();
afterEach(()=>{setLocale(original);vi.unstubAllGlobals();});
it('SPECIAL subtitle uses global locale immediately in all nine languages',()=>{
 vi.stubGlobal('document',{documentElement:{lang:''}});
 expect(Object.keys(specialSubtitle)).toHaveLength(9);
 for(const language of [...SUPPORTED_LOCALES,'ja','en','fr','ja'] as const){setLocale(language);expect(t('special.subtitle')).toBe(specialSubtitle[language]);expect(t('special.subtitle').length).toBeGreaterThan(10);if(language!=='ja')expect(t('special.subtitle')).not.toContain('カラーキューブ');}
});
