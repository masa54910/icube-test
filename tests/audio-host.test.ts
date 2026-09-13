import {afterEach,it,expect,vi} from 'vitest';
import {PlayablesSDK} from '../src/platform/PlayablesSDK';
afterEach(()=>vi.unstubAllGlobals());
function fixture(inHost:boolean){
 const subscribe=vi.fn((callback:(enabled:boolean)=>void)=>{callback(false);return ()=>{};});
 vi.stubGlobal('localStorage',{getItem:()=>null});
 vi.stubGlobal('navigator',{languages:['en']});
 vi.stubGlobal('ytgame',{IN_PLAYABLES_ENV:inHost,system:{isAudioEnabled:()=>true,onAudioEnabledChange:subscribe,onPause:()=>()=>{},onResume:()=>()=>{},getLanguage:async()=>'en'},game:{loadData:async()=>''}});
 return subscribe;
}
it('ignores no-op SDK audio notifications outside Playables',async()=>{
 const subscribe=fixture(false),sdk=new PlayablesSDK(),audio=vi.fn();
 await sdk.initialize(()=>{},()=>{},audio);
 expect(sdk.audioEnabled).toBe(true);expect(subscribe).not.toHaveBeenCalled();expect(audio).not.toHaveBeenCalled();sdk.dispose();
});
it('respects real Playables host mute and subsequent unmute',async()=>{
 const subscribe=fixture(true),sdk=new PlayablesSDK(),audio=vi.fn();
 await sdk.initialize(()=>{},()=>{},audio);
 expect(sdk.audioEnabled).toBe(false);expect(audio).toHaveBeenCalledWith(false);
 subscribe.mock.calls[0]![0](true);expect(sdk.audioEnabled).toBe(true);expect(audio).toHaveBeenLastCalledWith(true);sdk.dispose();
});
