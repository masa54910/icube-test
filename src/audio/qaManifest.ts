import {AUDIO_MANIFEST,type AudioSlot} from './manifest';
/** Explicit local QA only. No candidate is adopted by production or saved. */
export function qaAudioManifest(){
 const m=structuredClone(AUDIO_MANIFEST);
 if(!import.meta.env.DEV||typeof location==='undefined')return m;
 const choice=new URLSearchParams(location.search).get('audioQA');if(!choice||!['D','E','F'].includes(choice))return m;
 const files:Record<AudioSlot,string>={homeBgm:'home-'+choice,gameplayBgm:'gameplay-'+choice,correctBgm:'correct-scene',footstep:'se-footstep-A',ladderClimb:'se-ladder-climb-A',answerEnter:'se-answer-enter-A',jump:'se-jump-A',land:'se-land-A',boost:'se-boost-A',cubePlace:'se-cube-place-A',answerSelect:'se-answer-select-A',correct:'se-correct-A',incorrect:'se-incorrect-A'};
 for(const key of Object.keys(files) as AudioSlot[])m[key]={...m[key],url:'/docs/audio-v2/'+files[key]+'.ogg',approved:true,rights:{source:'tools/audio/generate.mjs',creator:'i CUBE TEST original synth',license:'Original synthesized output — QA candidate',commercial:true,redistribution:true,youtube:true,attribution:'No third-party samples'}};
 return m;
}
