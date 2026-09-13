export type AudioSlot='homeBgm'|'gameplayBgm'|'correctBgm'|'footstep'|'ladderClimb'|'answerEnter'|'jump'|'land'|'boost'|'cubePlace'|'answerSelect'|'correct'|'incorrect';
export type AudioRights={source:string;creator:string;license:string;commercial:boolean;redistribution:boolean;youtube:boolean;attribution:string};
export type AudioAsset={url:string|null;approved:boolean;loop:boolean;volume:number;rights:AudioRights|null;variants?:string[]};
const rights:AudioRights={source:'tools/audio/generate.mjs',creator:'i CUBE TEST original synthesis',license:'Original programmatic synthesis; no third-party samples',commercial:true,redistribution:true,youtube:true,attribution:'None'};
const slot=(loop:boolean,volume:number):AudioAsset=>({url:null,approved:false,loop,volume,rights:null});
/** No placeholder/remote audio. Populate only after publisher approval and rights review. */
export const AUDIO_MANIFEST:Record<AudioSlot,AudioAsset>={homeBgm:slot(true,.3),gameplayBgm:slot(true,.25),correctBgm:slot(true,.3),footstep:slot(false,.25),ladderClimb:slot(false,.25),answerEnter:slot(false,.6),jump:slot(false,.4),land:slot(false,.45),boost:slot(false,.7),cubePlace:slot(false,.55),answerSelect:slot(false,.25),correct:slot(false,.7),incorrect:slot(false,.45)};
const files:Record<AudioSlot,string>={homeBgm:'bgm-home',gameplayBgm:'bgm-gameplay',correctBgm:'bgm-correct-scene',footstep:'se-footstep-a',ladderClimb:'se-ladder-climb',answerEnter:'se-answer-enter',jump:'se-jump',land:'se-land',boost:'se-boost',cubePlace:'se-cube-place',answerSelect:'se-answer-select',correct:'se-correct',incorrect:'se-incorrect'};
for(const key of Object.keys(files) as AudioSlot[])Object.assign(AUDIO_MANIFEST[key],{url:'/assets/audio/'+files[key]+'.ogg',approved:true,rights});
AUDIO_MANIFEST.homeBgm.volume=.25;
AUDIO_MANIFEST.gameplayBgm.volume=.22;
AUDIO_MANIFEST.footstep.variants=['/assets/audio/se-footstep-b.ogg','/assets/audio/se-footstep-c.ogg'];
export function isApproved(a:AudioAsset){return !!(a.approved&&a.url&&a.rights?.source&&a.rights.creator&&a.rights.license&&a.rights.commercial&&a.rights.redistribution&&a.rights.youtube);}
export const AUDIO_EVENTS={JUMP_START:'jump',FOOT_CONTACT:'land',JOG_CONTACT:'footstep',LADDER_CONTACT:'ladderClimb',ANSWER_ENTER:'answerEnter',BOOST_START:'boost',MEMO_CUBE_COMMIT:'cubePlace',ANSWER_SELECT:'answerSelect',ANSWER_CORRECT:'correct',ANSWER_INCORRECT:'incorrect'} as const;
export type AudioEvent=keyof typeof AUDIO_EVENTS;
