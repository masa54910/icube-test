import type {Locale} from '../types';
import {isYouTubePlayables} from '../platform/hostEnvironment';

export type AnalyticsEventName='session_start'|'session_end'|'game_start'|'stage_start'|'stage_complete'|'stage_abandon'|'answer_attempt'|'hint_used'|'cube_memo_open'|'cube_memo_submit'|'cube_test_start'|'cube_test_question_complete'|'cube_test_complete'|'stage_retry'|'language_changed';
export interface AnalyticsEvent {eventId:string;eventName:AnalyticsEventName;anonymousPlayerId:string;sessionId:string;occurredAt:string;appVersion:string;platform:'web';deviceClass:'desktop'|'mobile'|'tablet';orientation:'portrait'|'landscape';language:Locale;payload:Record<string,unknown>;isTest:boolean;}
const PLAYER_KEY='icube-analytics-player-id';
const PENDING_KEY='icube-analytics-pending';
const uuid=()=>crypto.randomUUID();
const deviceClass=():AnalyticsEvent['deviceClass']=>{const w=typeof innerWidth==='number'?innerWidth:1024;return w<600?'mobile':w<1024?'tablet':'desktop';};
const orientation=():AnalyticsEvent['orientation']=>{const w=typeof innerWidth==='number'?innerWidth:1024,h=typeof innerHeight==='number'?innerHeight:768;return w>=h?'landscape':'portrait';};
const readId=(disabled=false)=>{if(disabled)return uuid();try{const old=localStorage.getItem(PLAYER_KEY);if(old)return old;const id=uuid();localStorage.setItem(PLAYER_KEY,id);return id;}catch{return uuid();}};
type TrafficAttribution={trafficSource:string;trafficMedium:string;trafficCampaign:string;referrer:string;landingPath:string};
const clean=(value:string,max=128)=>value.trim().slice(0,max);
export const readTrafficAttribution=():TrafficAttribution=>{if(typeof window==='undefined')return {trafficSource:'direct',trafficMedium:'',trafficCampaign:'',referrer:'',landingPath:'/'};const url=new URL(window.location.href);const source=clean(url.searchParams.get('utm_source')??'').toLowerCase();const medium=clean(url.searchParams.get('utm_medium')??'').toLowerCase();const campaign=clean(url.searchParams.get('utm_campaign')??'');let host='';try{host=document.referrer?new URL(document.referrer).hostname.toLowerCase():'';}catch{/* invalid referrer */}if(source)return {trafficSource:source,trafficMedium:medium,trafficCampaign:campaign,referrer:host,landingPath:url.pathname||'/'};let trafficSource='direct';if(host){if(/(^|\.)google\.|(^|\.)bing\.|(^|\.)yahoo\.|(^|\.)duckduckgo\./.test(host))trafficSource='organic_search';else if(/(^|\.)x\.com$|(^|\.)twitter\.com$|(^|\.)t\.co$/.test(host))trafficSource='x';else if(/(^|\.)note\.com$/.test(host))trafficSource='note';else if(/(^|\.)youtube\.com$|(^|\.)youtu\.be$/.test(host))trafficSource='youtube';else trafficSource='referral';}return {trafficSource,trafficMedium:'',trafficCampaign:'',referrer:host,landingPath:url.pathname||'/'};};

/** Privacy-safe, non-blocking analytics observer. It never participates in gameplay decisions. */
export class AnalyticsManager {
 private readonly disabled=isYouTubePlayables(); readonly anonymousPlayerId=readId(this.disabled); readonly appVersion='beta-1';
 readonly sessionId=uuid(); private queue:AnalyticsEvent[]=[]; private activeMs=0; private lastActivity=performance.now(); private started=false; private currentStage:string|null=null; private readonly traffic=readTrafficAttribution();
 private readonly endpoint=import.meta.env.VITE_ANALYTICS_URL as string|undefined; private readonly key=import.meta.env.VITE_ANALYTICS_ANON_KEY as string|undefined;
 constructor(private readonly language:()=>Locale){this.restore();}
 private restore(){if(this.disabled)return;try{const raw=JSON.parse(localStorage.getItem(PENDING_KEY)??'[]');if(Array.isArray(raw))this.queue=raw.slice(-100) as AnalyticsEvent[];}catch{/* optional queue */}}
 private persist(){try{localStorage.setItem(PENDING_KEY,JSON.stringify(this.queue.slice(-100)));}catch{/* storage optional */}}
 initialize(){if(this.disabled||this.started)return;this.started=true;this.track('session_start',{startedAt:new Date().toISOString(),...this.traffic});if(typeof window!=='undefined'){window.addEventListener('pagehide',()=>{this.endSession();});window.addEventListener('visibilitychange',()=>{if(document.hidden)this.lastActivity=performance.now();});}void this.flush();}
 startSession(){this.initialize();}
 getActivePlaySeconds(){return Math.round(this.activeMs/1000);}
 startStage(stageId:string,section:string,stageType:string){this.currentStage=stageId;this.track('stage_start',{stageId,section,stageType});}
 completeStage(payload:Record<string,unknown>){this.track('stage_complete',{stageId:this.currentStage,effectivePlaySeconds:Math.round(this.activeMs/1000),...payload});this.currentStage=null;}
 abandon(reason:string){if(this.currentStage){const seconds=Math.round(this.activeMs/1000);this.track('stage_abandon',{stageId:this.currentStage,reason,effectivePlaySeconds:seconds,effectivePlaySecondsAtAbandon:seconds});}this.currentStage=null;}
 answer(payload:Record<string,unknown>){this.track('answer_attempt',{stageId:this.currentStage,...payload});}
 track(name:AnalyticsEventName,payload:Record<string,unknown>={}){if(this.disabled)return;const host=typeof location!=='undefined'?location.hostname:'';const event:AnalyticsEvent={eventId:uuid(),eventName:name,anonymousPlayerId:this.anonymousPlayerId,sessionId:this.sessionId,occurredAt:new Date().toISOString(),appVersion:this.appVersion,platform:'web',deviceClass:deviceClass(),orientation:orientation(),language:this.language(),payload,isTest:host==='localhost'||host==='127.0.0.1'};this.queue.push(event);this.persist();if(this.queue.length>=8)void this.flush();}
 tick(ms:number,active:boolean){if(!this.started||document.hidden||!active)return;const now=performance.now();if(now-this.lastActivity<90000)this.activeMs+=Math.max(0,Math.min(ms,100));this.lastActivity=now;}
 endSession(){if(!this.started)return;this.track('session_end',{activePlaySeconds:Math.round(this.activeMs/1000)});this.started=false;void this.flush();}
 async flush(){if(this.disabled||!this.endpoint||!this.key||!this.queue.length)return;const batch=this.queue.slice();const rows=batch.map(e=>({event_id:e.eventId,event_name:e.eventName,anonymous_player_id:e.anonymousPlayerId,session_id:e.sessionId,occurred_at:e.occurredAt,app_version:e.appVersion,platform:e.platform,device_class:e.deviceClass,orientation:e.orientation,language:e.language,payload:e.payload,is_test:e.isTest}));try{const res=await fetch(`${this.endpoint}/rest/v1/analytics_events`,{method:'POST',headers:{apikey:this.key,Authorization:`Bearer ${this.key}`, 'Content-Type':'application/json',Prefer:'return=minimal'},body:JSON.stringify(rows)});if(res.ok||res.status===409){this.queue.splice(0,batch.length);this.persist();}}catch{/* Analytics must never interrupt gameplay. */}}
}
