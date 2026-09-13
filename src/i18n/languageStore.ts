import type {Locale} from '../types'; import {detectLanguage,SUPPORTED_LOCALES} from './detectLanguage';
const KEY='icube-test-language';
export function loadLocale():Locale {try{const v=localStorage.getItem(KEY) as Locale|null;if(v&&SUPPORTED_LOCALES.includes(v))return v;}catch{} return detectLanguage(typeof navigator!=='undefined'?navigator.languages:undefined);}
export function saveLocale(locale:Locale):void {try{localStorage.setItem(KEY,locale);}catch{}}
