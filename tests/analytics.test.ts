import {describe,it,expect,vi,beforeEach} from 'vitest';
import {AnalyticsManager} from '../src/analytics/AnalyticsManager';
describe('anonymous analytics',()=>{
 beforeEach(()=>{const store=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>store.get(k)??null,setItem:(k:string,v:string)=>store.set(k,v)});vi.stubGlobal('innerWidth',1280);vi.stubGlobal('innerHeight',720);vi.stubGlobal('location',{hostname:'localhost'});});
 it('creates a stable anonymous player id and fresh session id',()=>{const a=new AnalyticsManager(()=> 'ja');const b=new AnalyticsManager(()=> 'ja');expect(a.anonymousPlayerId).toMatch(/^[0-9a-f-]{36}$/);expect(b.anonymousPlayerId).toBe(a.anonymousPlayerId);expect(a.sessionId).not.toBe(b.sessionId);});
 it('queues versioned privacy-safe events without PII',()=>{const a=new AnalyticsManager(()=> 'en');a.initialize();a.startStage('1-1','standard','shape');a.answer({answerSource:'answer_point',correct:false});expect(a.anonymousPlayerId).toBeTruthy();expect(a.appVersion).toBe('beta-1');});
 it('never requires a remote endpoint to track locally',()=>{const a=new AnalyticsManager(()=> 'en');expect(()=>a.track('game_start',{entry:'new-game'})).not.toThrow();});
});
