import type {Locale} from '../types';
export const SUPPORTED_LOCALES:readonly Locale[]=['en','ja','ko','zh-CN','zh-TW','es','pt','de','fr'];
export function detectLanguage(values:readonly string[]|undefined=[typeof navigator!=='undefined'?navigator.language:'en']):Locale {
  for(const raw of values){const v=raw.toLowerCase().replace('_','-'); if(v.startsWith('zh-tw')||v.startsWith('zh-hk')||v.startsWith('zh-mo')||v.includes('hant'))return'zh-TW'; if(v.startsWith('zh'))return'zh-CN'; for(const l of ['ja','ko','en','es','pt','de','fr'] as const)if(v.startsWith(l))return l;} return'en';
}
