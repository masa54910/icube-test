import {readTrafficAttribution} from '../analytics/AnalyticsManager';

export type FeedbackForm={ratingUsability:number;difficulty:'very_easy'|'easy'|'just_right'|'hard'|'very_hard';ratingFun:number;ratingCubeMemo:number|null;cubeMemoUnused:boolean;ratingReplay:number;comment:string;email:string;marketingConsent:boolean};
export const validateFeedback=(form:FeedbackForm):string|null=>{
  if(!Number.isInteger(form.ratingUsability)||form.ratingUsability<1||form.ratingUsability>5)return '操作性の評価を選択してください。';
  if(!['very_easy','easy','just_right','hard','very_hard'].includes(form.difficulty))return '難易度を選択してください。';
  if(!Number.isInteger(form.ratingFun)||form.ratingFun<1||form.ratingFun>5)return '面白さの評価を選択してください。';
  if(!form.cubeMemoUnused&&(!Number.isInteger(form.ratingCubeMemo)||form.ratingCubeMemo!<1||form.ratingCubeMemo!>5))return 'CUBE MEMOの評価を選択してください。';
  if(!Number.isInteger(form.ratingReplay)||form.ratingReplay<1||form.ratingReplay>5)return '再プレイ意向を選択してください。';
  if(form.comment.length>1000)return '自由記述は1000文字以内で入力してください。';
  if(form.email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))return 'メールアドレスの形式を確認してください。';
  return null;
};
const env=(name:string)=>String(import.meta.env[name]??'');
export async function submitFeedback(form:FeedbackForm,anonymousPlayerId:string,sessionId:string):Promise<void>{
  const url=env('VITE_ANALYTICS_URL'),key=env('VITE_ANALYTICS_ANON_KEY');
  if(!url||!key)throw new Error('feedback_not_configured');
  const id=crypto.randomUUID();const isTest=typeof location!=='undefined'&&(location.hostname==='localhost'||location.hostname==='127.0.0.1');
  const response=await fetch(`${url}/rest/v1/beta_feedback`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({id,anonymous_player_id:anonymousPlayerId,session_id:sessionId,rating_usability:form.ratingUsability,difficulty:form.difficulty,rating_fun:form.ratingFun,rating_cube_memo:form.cubeMemoUnused?null:form.ratingCubeMemo,cube_memo_unused:form.cubeMemoUnused,rating_replay:form.ratingReplay,comment:form.comment||null,traffic_source:readTrafficAttribution().trafficSource,is_test:isTest})});
  if(!response.ok)throw new Error('feedback_insert_failed');
  if(form.email){const contact=await fetch(`${url}/rest/v1/beta_feedback_contacts`,{method:'POST',headers:{apikey:key,Authorization:`Bearer ${key}`,'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify({feedback_id:id,email:form.email,marketing_consent:form.marketingConsent})});if(!contact.ok)throw new Error('contact_insert_failed');}
}
