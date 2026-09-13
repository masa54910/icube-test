import type {AudioManager} from './AudioManager';
/** Explicit dev-only UI, never included through the production entry branch. */
export function attachAudioDiagnostics(audio:AudioManager){
 const hostProbe=typeof ytgame==='undefined'?{sdk:false}:{sdk:true,inPlayables:ytgame?.IN_PLAYABLES_ENV,rawAudioEnabled:ytgame?.system.isAudioEnabled()};
 const panel=document.createElement('details');panel.open=true;panel.id='audio-diagnostics';panel.style.cssText='position:fixed;z-index:99999;right:8px;top:8px;width:min(380px,90vw);max-height:70vh;overflow:auto;background:#fff;color:#123;padding:12px;font:12px monospace;border:2px solid #167';
 const summary=document.createElement('summary');summary.textContent='AUDIO DIAGNOSTICS (DEV)';const text=document.createElement('pre');
 const button=document.createElement('button');button.textContent='UNLOCK / RETRY';button.onclick=()=>void audio.unlock();
 const simple=document.createElement('audio');simple.controls=true;simple.src='/assets/audio/bgm-home.ogg';simple.preload='none';
 panel.append(summary,button,simple,text);document.body.append(panel);
 for(const scene of ['HOME','GAMEPLAY','CORRECT_SCENE','NONE'] as const){const b=document.createElement('button');b.textContent='BGM '+scene;b.onclick=()=>{simple.pause();audio.playBGM(scene);};panel.insertBefore(b,text);}
 for(const slot of ['footstep','ladderClimb','jump','land','boost','cubePlace','answerEnter','answerSelect','correct','incorrect'] as const){const b=document.createElement('button');b.textContent='TEST '+slot;b.onclick=()=>audio.playSE(slot);panel.insertBefore(b,text);}
 const timer=setInterval(()=>{text.textContent=JSON.stringify({hostProbe,...audio.diagnostics(),recentEvents:audio.events.slice(-8)},null,2)},250);
 window.addEventListener('pagehide',()=>{clearInterval(timer);},{once:true});
}
