export const BACKGROUND_PRESETS=[
  {id:'A',name:'Earth + Milky Way',sky:0x07132e,nebula:0x715fc4,planet:0x2879b6,kind:0,space:0,ring:false,moons:0,asteroids:false,light:0xc9eaff},
  {id:'B',name:'Blue Planet + Light Ring',sky:0x03102a,nebula:0x2567bc,planet:0x1762b8,kind:1,space:0,ring:true,moons:0,asteroids:false,light:0xaddfff},
  {id:'C',name:'Sunset Planet',sky:0x35142e,nebula:0xf0789d,planet:0x99345d,kind:1,space:2,ring:false,moons:0,asteroids:false,light:0xffd4bf},
  {id:'D',name:'Moon + Asteroids',sky:0x070e1c,nebula:0x2b3c59,planet:0xb9bdca,kind:2,space:0,ring:false,moons:0,asteroids:true,light:0xd1dcff},
  {id:'E',name:'Cyan Nebula',sky:0x041c29,nebula:0x42b8bc,planet:0x296276,kind:1,space:1,ring:false,moons:0,asteroids:false,light:0xc4ffff},
  {id:'F',name:'Spiral Galaxy',sky:0x17092a,nebula:0xb86ae6,planet:0x482665,kind:1,space:3,ring:false,moons:0,asteroids:false,light:0xeddcff},
  {id:'G',name:'Planet Dawn',sky:0x101c3b,nebula:0xa779ad,planet:0x44718c,kind:0,space:2,ring:false,moons:0,asteroids:false,light:0xffe1c3},
  {id:'H',name:'Ringed Planet',sky:0x090f25,nebula:0x574b80,planet:0xba916d,kind:3,space:0,ring:true,moons:3,asteroids:false,light:0xffe6cd},
] as const;
export type BackgroundPreset=typeof BACKGROUND_PRESETS[number];
export const CUBIE_POSES=[
  {id:'01',name:'stand',scale:1,x:0,y:0,anchor:.978,shadow:.55},
  {id:'02',name:'wave',scale:1,x:0,y:0,anchor:.978,shadow:.55},
  {id:'03',name:'peace',scale:1,x:0,y:0,anchor:.978,shadow:.57},
  {id:'04',name:'helmet',scale:1,x:0,y:0,anchor:.978,shadow:.55},
  {id:'05',name:'one-leg',scale:1.01,x:-3,y:0,anchor:.969,shadow:.40},
  {id:'06',name:'look-up',scale:1,x:0,y:0,anchor:.978,shadow:.55},
  {id:'07',name:'seated',scale:1.03,x:0,y:0,anchor:.946,shadow:.78},
  {id:'08',name:'back',scale:1,x:0,y:0,anchor:.978,shadow:.55},
] as const;
export type CubiePose=typeof CUBIE_POSES[number];
export const poseUrl=(pose:CubiePose)=>`${import.meta.env.BASE_URL}assets/cubie/cubie-correct-${pose.id}.webp`;

/** Presentation-only session history. Never writes progress or save data. */
export class CorrectSceneVariantService {
  private recentBackgrounds:string[]=[];
  private recentPoses:string[]=[];
  constructor(private readonly random:()=>number=Math.random){}
  private pick<T extends {id:string}>(items:readonly T[],recent:string[]):T {
    const candidates=items.filter(item=>!recent.includes(item.id));
    const selected=candidates[Math.min(candidates.length-1,Math.max(0,Math.floor(this.random()*candidates.length)))]!;
    recent.push(selected.id);if(recent.length>2)recent.shift();return selected;
  }
  selectBackground():BackgroundPreset {return this.pick(BACKGROUND_PRESETS,this.recentBackgrounds);}
  selectCubiePose():CubiePose {return this.pick(CUBIE_POSES,this.recentPoses);}
}
