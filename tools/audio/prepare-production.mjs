// Reproducible selection. No downloads, synthesis, or gameplay changes here.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const source=path.join(root,'docs/audio-v2');
const out=path.join(root,'public/assets/audio');
fs.mkdirSync(out,{recursive:true});
const selection={'bgm-home':'home-F','bgm-gameplay':'gameplay-D','bgm-correct-scene':'correct-scene','se-footstep-a':'se-footstep-A','se-footstep-b':'se-footstep-B','se-footstep-c':'se-footstep-C'};
for(const name of ['ladder-climb','jump','land','boost','cube-place','answer-enter','answer-select','correct','incorrect'])selection['se-'+name]='se-'+name+'-A';
const candidates=JSON.parse(fs.readFileSync(path.join(source,'manifest.json'),'utf8'));
const assets=Object.entries(selection).map(([name,id])=>{const bytes=fs.readFileSync(path.join(source,id+'.ogg'));fs.writeFileSync(path.join(out,name+'.ogg'),bytes);return {...candidates.assets.find(a=>a.id===id),productionFile:name+'.ogg',sha256:createHash('sha256').update(bytes).digest('hex'),bytes:bytes.length};});
const report={selectedHome:'F',selectedGameplay:'D',correctScene:'ADOPT',method:'Original programmatic synthesis',thirdPartyAudio:'NONE',totalBytes:assets.reduce((n,a)=>n+a.bytes,0),assets};
fs.writeFileSync(path.join(root,'docs/AUDIO_PRODUCTION_MANIFEST.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({files:assets.length,totalBytes:report.totalBytes}));
