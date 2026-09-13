// Original Synth Audio v1. No third-party recordings, samples, or soundfonts.
// Method reference: user's Trailer v1.2 audio-v12.mjs (PCM/envelopes/seeded noise).
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'docs/audio-v2'), masters=path.join(root,'tools/audio/masters-v2');
fs.mkdirSync(out,{recursive:true});fs.mkdirSync(masters,{recursive:true});
const ffmpeg=process.env.ICUBE_FFMPEG;
if(!ffmpeg||!fs.existsSync(ffmpeg))throw Error('Set ICUBE_FFMPEG to an installed ffmpeg executable. No download performed.');
const SR=48000,TAU=2*Math.PI;let seed;
function rnd(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const hz=m=>440*2**((m-69)/12);
function buffer(seconds){return [new Float32Array(Math.round(seconds*SR)),new Float32Array(Math.round(seconds*SR))];}
function add(a,start,dur,fn,gain=1,pan=0,wrap=false){const offset=Math.round(start*SR),n=Math.round(dur*SR),N=a[0].length,l=Math.sqrt((1-pan)/2),r=Math.sqrt((1+pan)/2);for(let i=0;i<n;i++){let j=offset+i;if(wrap)j=((j%N)+N)%N;if(j<0||j>=N)continue;const v=fn(i/SR,i)*gain;a[0][j]+=v*l;a[1][j]+=v*r;}}
function tone(a,start,m,dur,gain,pan=0,wrap=false){const f=hz(m);add(a,start,dur,t=>{const e=(1-Math.exp(-t*110))*Math.exp(-t*3.2)*Math.min(1,(dur-t)/.05);return e*(Math.sin(TAU*f*t)+.15*Math.sin(TAU*f*2*t)*Math.exp(-t*5)+.035*Math.sin(TAU*f*3*t));},gain,pan,wrap);}
function space(a,loop){const dry=a.map(x=>x.slice()),N=a[0].length;for(const [sec,g]of [[.173,.16],[.307,.11],[.491,.075],[.733,.04]]){const d=Math.round(sec*SR);for(let c=0;c<2;c++)for(let i=0;i<N;i++){const j=i-d;if(j>=0||loop)a[c][i]+=dry[1-c][(j+N)%N]*g;}}}
function bgm(seconds,kind,variant){const a=buffer(seconds),N=a[0].length;const quiet=kind==='gameplay';
 // Periodic oscillator and LFO cycles: no pad discontinuity at the loop seam.
 for(const [k,m] of [50,57,64,66,71].entries()){const f=Math.round(hz(m)*seconds)/seconds;for(let i=0;i<N;i++){const t=i/SR,phase=TAU*t/seconds;const amp=(quiet?.008:.011)*(1+.17*Math.sin(phase*(k+1)+k));const v=(Math.sin(TAU*f*t+k)+.12*Math.sin(TAU*f*2*t+k)) * amp;const p=.3*Math.sin(phase*(k%2+1)+k);a[0][i]+=v*Math.sqrt((1-p)/2);a[1][i]+=v*Math.sqrt((1+p)/2);}}
 const pulse=variant==='B'?1:variant==='C'?.4:.16;
 for(let t=1.1;t<seconds;t+=quiet?4.8:3.2)add(a,t,1.7,u=>Math.sin(TAU*hz(50)*u)*Math.sin(Math.PI*u/1.7)**2*Math.exp(-u*2),pulse*(quiet?.012:.018),0,true);
 const spacing=variant==='B'&&!quiet?4.4:variant==='C'&&quiet?6.5:quiet?13:9;
 const notes=[74,81,76,71,78];
 for(let t=2;t<seconds;t+=spacing){const pan=(rnd()-.5)*1.2,m=notes[Math.floor(rnd()*notes.length)]-(quiet?12:0),v=(quiet?.012:.019)*(.8+rnd()*.3);tone(a,t+rnd()*.5,m,1.7,v,pan,true);if(rnd()>.63)tone(a,t+.28,m+2,1.3,v*.5,-pan,true);}
 const motif=[62,69,76,71,66],times=quiet?[15,65]:[8,40,64];
 for(const t of times)for(let k=0;k<5;k++)tone(a,t+[0,1.3,3.4,4,6.5][k]*(quiet?1.5:1),motif[k]+(quiet?0:12),3,(quiet?.007:.015)*(variant==='C'?1.5:variant==='A'?.6:1),Math.sin(k)*.4,true);
 // Tiny low-pass noise bed, crossfaded cyclically; not a recorded sample.
 let v=0;const noise=new Float32Array(N);for(let i=0;i<N;i++){v=.985*v+.015*(rnd()*2-1);noise[i]=v*.006;}
 const edge=SR;for(let i=0;i<edge;i++){const w=.5-.5*Math.cos(Math.PI*i/edge);noise[i]=noise[i]*w+noise[N-edge+i]*(1-w);}for(let i=0;i<N;i++){a[0][i]+=noise[i];a[1][i]+=noise[i]*.8;}
 space(a,true);return a;
}
function melodic(seconds,kind,variant){const a=buffer(seconds),N=a[0].length,quiet=kind==='gameplay',reward=kind==='correct';
 // Air only: remove low-mid fundamentals, >90% lower pad amplitude than v1.
 for(const [k,m]of [69,76,78].entries()){const f=Math.round(hz(m)*seconds)/seconds;for(let i=0;i<N;i++){const t=i/SR,v=Math.sin(TAU*f*t+k)*.0007*(1+.12*Math.sin(TAU*t/seconds));a[0][i]+=v;a[1][i]+=v*.92;}}
 const phrases=[[62,69,76,71,66],[69,66,64],[76,71,69,66],[66,69,74,76],[71,76,69],[74,69,66,64]];
 const step=quiet?1.65:1.25;
 for(let t=.2,k=0;t<seconds;t+=step,k++){const phrase=phrases[Math.floor(k/5)%phrases.length],m=phrase[k%phrase.length]+(quiet?0:12),pan=Math.sin(k*1.7)*.3;
 tone(a,t,m,1.2,(quiet?.047:.055)*(reward?1.15:1)*(.85+rnd()*.25),pan,true);
 if(variant==='E'&&k%3===1){tone(a,t+.3,m+7,.65,.021,-pan,true);tone(a,t+.52,m+2,.65,.015,pan,true);}
 if(variant==='F'&&k%4===2)for(let j=0;j<3;j++)tone(a,t+.22*(j+1),m+[0,4,7][j],.9,.018,-pan,true);
 if(k%2===0)add(a,t,.6,u=>Math.sin(TAU*hz(62)*u)*Math.sin(Math.PI*u/.6)**2*Math.exp(-u*5),.006,0,true);
 }space(a,true);return a;}
function se(name,variant){const dur={boost:1.2,'cube-place':.22,correct:3.3,jump:.32,land:.48,'answer-select':.13,incorrect:.55,footstep:.18,'ladder-climb':.28,'answer-enter':.42}[name],a=buffer(dur);let low=0,phase=0;
 if(name==='footstep'||name==='ladder-climb'){add(a,0,dur,t=>{low=.84*low+.16*(rnd()*2-1);const e=(1-Math.exp(-t*230))*Math.exp(-t*(name==='footstep'?30:16))*Math.min(1,(dur-t)/.035);return e*(low*.65+Math.sin(TAU*(variant==='B'?170:variant==='C'?210:190)*t)*.12);});}
 if(name==='answer-enter'){tone(a,0,74,.16,.3);add(a,.09,.3,t=>{phase+=TAU*(440+900*t)/SR;return Math.sin(phase)*Math.sin(Math.PI*t/.3)**2*.15;});}
 if(['boost','jump','land'].includes(name))add(a,0,dur,t=>{low=.90*low+.10*(rnd()*2-1);const e=Math.sin(Math.PI*t/dur)**2;const f=name==='boost'?180+650*t/dur:name==='jump'?330+200*t/dur:100-35*t/dur;phase+=TAU*f/SR;return e*(low*(name==='land'?.45:1)+Math.sin(phase)*(name==='land'?.2:.065))*Math.exp(-t*(name==='land'?8:.5));},1,variant==='B'?.2:0);
 if(name==='cube-place'){tone(a,0,variant==='B'?78:74,.2,.4);tone(a,.012,86,.17,.10,.15);}
 if(name==='answer-select')tone(a,0,74,.13,.28);
 if(name==='incorrect'){tone(a,0,62,.3,.30);tone(a,.17,59,.35,.23);}
 if(name==='correct'){tone(a,0,74,.3,.12);for(const [i,m]of [62,69,76,71,78].entries())tone(a,.95+i*.20,m+12,1.1,.13,Math.sin(i)*.25);for(const [i,m]of [74,78,81,88].entries())tone(a,2.63,m,.65,i===3?.15:.28,Math.sin(i)*.2);}
 space(a,false);return a;
}
function wav(file,a){const N=a[0].length,b=Buffer.alloc(44+N*4);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(2,22);b.writeUInt32LE(SR,24);b.writeUInt32LE(SR*4,28);b.writeUInt16LE(4,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(N*4,40);for(let i=0;i<N;i++)for(let c=0;c<2;c++)b.writeInt16LE(Math.round(a[c][i]*32767),44+i*4+c*2);fs.writeFileSync(file,b);}
const manifest=[];
function save(id,a,isBgm,initialSeed){let sum=0,peak=0;for(const ch of a)for(const v of ch){sum+=v*v;peak=Math.max(peak,Math.abs(v));}const rms=Math.sqrt(sum/(a[0].length*2)),gain=Math.min((isBgm?.033:.12)/rms,.72/peak);for(const ch of a)for(let i=0;i<ch.length;i++)ch[i]*=gain;
 if(!isBgm){for(const ch of a)for(let i=0;i<480;i++)ch[ch.length-1-i]*=i/480;}
 const master=path.join(masters,id+'.wav'),file=path.join(out,id+'.ogg');wav(master,a);
 const result=spawnSync(ffmpeg,['-hide_banner','-loglevel','error','-y','-i',master,'-c:a','libvorbis','-q:a',isBgm?'4':'6',file],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);
 manifest.push({id,kind:isBgm?'bgm':'se',url:'./audio-v2/'+id+'.ogg',seconds:a[0].length/SR,seed:initialSeed,sampleRate:SR,peakDb:20*Math.log10(peak*gain),rmsDb:20*Math.log10(rms*gain),seamDelta:Math.max(...a.map(ch=>Math.abs(ch[0]-ch.at(-1)))),bytes:fs.statSync(file).size,thirdPartySamples:'NONE',method:'Offline PCM synthesis v2',generator:'tools/audio/generate.mjs'});console.log(id,manifest.at(-1).bytes);
}
for(const kind of ['home','gameplay'])for(const variant of ['D','E','F']){seed=20260914+manifest.length*103;const s=seed;save(kind+'-'+variant,melodic(kind==='home'?80:112,kind,variant),true,s);}
seed=20262000;save('correct-scene',melodic(24,'correct','F'),true,seed);
for(const name of ['boost','cube-place','correct','jump','land','answer-select','incorrect','footstep','ladder-climb','answer-enter'])for(const variant of name==='footstep'?['A','B','C']:['A']){seed=20260914+manifest.length*103;const s=seed;save('se-'+name+'-'+variant,se(name,variant),false,s);}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({version:2,generatedAt:new Date().toISOString(),status:'CANDIDATES ONLY',thirdPartyAudio:'NONE',assets:manifest},null,2));
