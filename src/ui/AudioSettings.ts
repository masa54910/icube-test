import type {AudioManager} from '../audio/AudioManager';
import {locale} from '../i18n';
import type {Locale} from '../types';
import './audio-settings.css';
const labels:Record<Locale,readonly [string,string]>={en:['Background music','Sound effects'],ja:['BGM','効果音'],ko:['배경 음악','효과음'],'zh-CN':['背景音乐','音效'],'zh-TW':['背景音樂','音效'],es:['Música','Efectos de sonido'],pt:['Música','Efeitos sonoros'],de:['Hintergrundmusik','Soundeffekte'],fr:['Musique','Effets sonores']};
export class AudioSettings {
 readonly root=document.createElement('div');
 constructor(audio:AudioManager){this.root.className='audio-settings';for(const key of ['bgm','se'] as const){const label=document.createElement('label'),input=document.createElement('input'),text=document.createElement('span');input.type='checkbox';input.dataset.audio=key;input.checked=key==='bgm'?audio.bgmEnabled:audio.seEnabled;input.onchange=()=>{if(key==='bgm')audio.setBGMEnabled(input.checked);else audio.setSEEnabled(input.checked);};label.append(input,text);this.root.append(label);}this.refresh();}
 refresh(){this.root.querySelectorAll('span').forEach((e,i)=>e.textContent=labels[locale()][i]!);}
}
