import type {Locale} from '../types';
export const answerPrompts:Record<Locale,{desktop:string;touch:string}>={
  en:{desktop:'Answer: Press {key}',touch:'Answer'},
  ja:{desktop:'回答：{key}を押す',touch:'回答'},
  ko:{desktop:'답하기: {key} 키를 누르세요',touch:'답하기'},
  'zh-CN':{desktop:'回答：按 {key}',touch:'回答'},
  'zh-TW':{desktop:'回答：按 {key}',touch:'回答'},
  es:{desktop:'Responder: pulsa {key}',touch:'Responder'},
  pt:{desktop:'Responder: pressione {key}',touch:'Responder'},
  de:{desktop:'Antworten: {key} drücken',touch:'Antworten'},
  fr:{desktop:'Répondre : appuyez sur {key}',touch:'Répondre'},
};
