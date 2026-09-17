import type {SaveData} from '../platform/PlayablesSDK';

/** Shared first-play/manual tutorial state. No platform-specific UI or new storage key. */
export class FirstPlayTutorial {
 active=false;
 constructor(private save:()=>SaveData,private persist:()=>Promise<void>){}
 open(manual:boolean,show:(complete:()=>void)=>void,resume:()=>void):boolean {
  if(this.active)return false;
  if(!manual&&this.save().tutorialCompleted===true)return false;
  this.active=true;
  let completed=false;
  show(()=>{
   if(completed)return;
   completed=true;
   if(!manual){
    this.save().tutorialCompleted=true;
    // Start saving before resuming. An unavailable host/storage must not freeze play.
    void this.persist().catch(()=>{});
   }
   this.active=false;resume();
  });
  return true;
 }
}
