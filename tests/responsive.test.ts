import {expect,it} from 'vitest';
import {responsiveCopy,responsiveKeys,responsiveTranslation,homeSupplement,homeSupplementKeys} from '../src/i18n/responsive';
it('all nine responsive dictionaries contain a nonempty translation for every key',()=>{
 expect(Object.keys(responsiveCopy)).toHaveLength(9);
 for(const [locale,values] of Object.entries(responsiveCopy)){
  expect(values.length,locale).toBe(responsiveKeys.length);
  for(const value of values)expect(value.trim().length,locale).toBeGreaterThan(0);
  const home=homeSupplement[locale as keyof typeof homeSupplement];expect(home.length).toBe(homeSupplementKeys.length);expect(home.every(Boolean)).toBe(true);
 }
});
it('result attempts used is distinct from remaining attempts and all-clear remains available',()=>{
 for(const locale of Object.keys(responsiveCopy) as (keyof typeof responsiveCopy)[]){
  expect(responsiveTranslation(locale,'result.attempts')).not.toBe(responsiveTranslation(locale,'answer.remainingAttempts'));
  expect(responsiveTranslation(locale,'result.allClear')).toBeTruthy();
 }
});
