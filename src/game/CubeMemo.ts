import type {Vec3Tuple} from '../types';
import {compareMemoToCanonical} from './MemoComparator';
export type MemoColor='white'|'navy'|'blue'|'cyan'|'lightblue';
export const MEMO_COLORS:MemoColor[]=['white','navy','blue','cyan','lightblue'];
export const MEMO_LIMIT=256;
export interface MemoCube {id:string;x:number;y:number;z:number;color:MemoColor;order:number;hintState:'origin'|'unknown'|'correct'}
export interface MemoData {version:2;stageId:string;cubes:MemoCube[];hintUsed:boolean;hintUnlocked:boolean;lit:string[];hintUses?:number}
const key=(p:{x:number;y:number;z:number})=>[p.x,p.y,p.z].join(',');
const origin=():MemoCube=>({id:'origin',x:0,y:0,z:0,color:'cyan',order:0,hintState:'origin'});
export function memoCoordinates(rooms:readonly Vec3Tuple[],start:Vec3Tuple):Vec3Tuple[]{return rooms.map(p=>[p[0]-start[0],p[1]-start[1],p[2]-start[2]]);}
/** Presentation-only notes; hint consumption is deliberately outside edit history. */
export class CubeMemoStore {
 onPlacement:((count:number)=>void)|null=null;
 private data:MemoData;
 private undo:MemoCube[][]=[];
 private redo:MemoCube[][]=[];
 private canonical:Set<string>;
 constructor(readonly stageId:string,private canonicalCoordinates:readonly Vec3Tuple[],private hintLimit=1){
  const canonical=canonicalCoordinates;
  this.canonical=new Set(canonical.map(p=>p.join(',')));
  this.data={version:2,stageId,cubes:[origin()],hintUsed:false,hintUnlocked:false,lit:[]};
  try{
   const raw=JSON.parse(localStorage.getItem('icube-memo:'+stageId)??'null');
   if(raw?.stageId===stageId&&[1,2].includes(raw.version)&&Array.isArray(raw.cubes)){
    // Preserve valid v1 notes, not its unguarded hint flags.
    for(const p of raw.cubes.slice(0,MEMO_LIMIT))if(p&&p.id!=='origin'&&this.data.cubes.length<MEMO_LIMIT&&this.valid(p.x,p.y,p.z)&&MEMO_COLORS.includes(p.color)&&!this.has(p.x,p.y,p.z)){
     this.data.cubes.push({...p,id:'restored-'+this.data.cubes.length,order:this.data.cubes.length,hintState:'unknown'});
    }
    if(raw.version===2){this.data.hintUnlocked=raw.hintUnlocked===true;this.data.hintUsed=this.data.hintUnlocked&&raw.hintUsed===true;this.data.lit=this.data.hintUsed&&Array.isArray(raw.lit)?raw.lit.filter((k:unknown)=>typeof k==='string'&&this.canonical.has(k)):[];}
   }
  }catch{/* Storage is optional. */}
  this.data.hintUses=this.data.hintUsed?1:0;
  try{const raw=JSON.parse(localStorage.getItem('icube-memo:'+stageId)??'null');if(raw?.stageId===stageId&&raw.version===2&&this.data.hintUnlocked&&Number.isInteger(raw.hintUses)&&raw.hintUses>=0)this.data.hintUses=Math.max(this.data.hintUsed?1:0,Math.min(raw.hintUses,Math.max(0,hintLimit)));}catch{/* Optional legacy preference. */}
  this.applyHint();
 }
 get cubes():readonly MemoCube[]{return this.data.cubes;}
 get hintUsed(){return this.data.hintUsed;}
 get hintExhausted(){return (this.data.hintUses??0)>=this.hintLimit;}
 get hintUnlocked(){return this.data.hintUnlocked;}
 get canUndo(){return this.undo.length>0;}
 get canRedo(){return this.redo.length>0;}
 valid(x:number,y:number,z:number){return [x,y,z].every(v=>Number.isInteger(v)&&Math.abs(v)<=24);}
 has(x:number,y:number,z:number){return this.data.cubes.some(c=>c.x===x&&c.y===y&&c.z===z);}
 private save(){try{localStorage.setItem('icube-memo:'+this.stageId,JSON.stringify(this.data));}catch{/* Continue in memory. */}}
 flush():void {this.save();}
 private applyHint(){const lit=new Set(this.data.lit);for(const c of this.data.cubes)c.hintState=c.id==='origin'?'origin':lit.has(key(c))?'correct':'unknown';}
 private commit(fn:()=>void){this.undo.push(structuredClone(this.data.cubes));if(this.undo.length>100)this.undo.shift();this.redo=[];fn();this.applyHint();this.save();}
 add(x:number,y:number,z:number,color:MemoColor='white'){return this.addBatch([{x,y,z}],color)>0;}
 addBatch(points:readonly {x:number;y:number;z:number}[],color:MemoColor='white'){
  if(!MEMO_COLORS.includes(color))return 0;
  const seen=new Set(this.data.cubes.map(key));const valid=points.filter(p=>{if(!this.valid(p.x,p.y,p.z)||seen.has(key(p)))return false;seen.add(key(p));return true;}).slice(0,MEMO_LIMIT-this.data.cubes.length);
  if(!valid.length)return 0;
  this.commit(()=>valid.forEach(p=>this.data.cubes.push({...p,id:crypto.randomUUID(),color,order:this.data.cubes.length,hintState:'unknown'})));this.onPlacement?.(valid.length);return valid.length;
 }
 addLine(x:number,y:number,z:number,axis:'x'|'y'|'z',amount:number,color:MemoColor='white',sign=1){
  if(!Number.isInteger(amount)||amount<1||amount>24||![1,-1].includes(sign))return 0;
  return this.addBatch(Array.from({length:amount},(_,i)=>{const p={x,y,z};p[axis]+=(i+1)*sign;return p;}),color);
 }
 remove(id:string){if(id==='origin'||!this.data.cubes.some(c=>c.id===id))return false;this.commit(()=>this.data.cubes=this.data.cubes.filter(c=>c.id!==id));return true;}
 color(id:string,color:MemoColor){const c=this.data.cubes.find(c=>c.id===id);if(!c||c.id==='origin'||c.color===color||!MEMO_COLORS.includes(color))return false;this.commit(()=>c.color=color);return true;}
 clear(){if(this.data.cubes.length<2)return;this.commit(()=>this.data.cubes=[origin()]);}
 undoOnce(){const s=this.undo.pop();if(!s)return false;this.redo.push(structuredClone(this.data.cubes));this.data.cubes=s;this.applyHint();this.save();return true;}
 redoOnce(){const s=this.redo.pop();if(!s)return false;this.undo.push(structuredClone(this.data.cubes));this.data.cubes=s;this.applyHint();this.save();return true;}
 unlockHint(){if(this.data.hintUnlocked)return;this.data.hintUnlocked=true;this.save();}
 useHint(){if(!this.data.hintUnlocked||this.hintExhausted)return false;this.data.hintUsed=true;this.data.hintUses=(this.data.hintUses??0)+1;this.data.lit=compareMemoToCanonical(this.data.cubes,this.canonicalCoordinates).correctCoordinates.map(key);this.applyHint();this.save();return true;}
}
