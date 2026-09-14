import {feedbackConfig,feedbackIsEnabled} from './FeedbackConfig';
const SUBMITTED='icube-beta-feedback-submitted',DISMISSED='icube-beta-feedback-dismissed',SESSION='icube-beta-feedback-dismissed-session';
export class FeedbackManager{
  private readonly completedStages=new Set<string>();
  constructor(readonly sessionId:string){}
  setCompletedStages(ids:readonly string[]){ids.forEach(id=>this.completedStages.add(id));}
  noteStageCompleted(stageId:string){if(stageId)this.completedStages.add(stageId);}
  get completedStageCount(){return this.completedStages.size;}
  private read(key:string){try{return localStorage.getItem(key)??''}catch{return ''}}
  shouldShow(_normalClears:number,activeSeconds:number,testComplete:boolean):boolean{
    if(!feedbackIsEnabled()||this.read(SUBMITTED))return false;
    if(this.read(SESSION)===this.sessionId)return false;
    const dismissed=Number(this.read(DISMISSED));if(dismissed&&Date.now()-dismissed<feedbackConfig.dismissCooldownMs)return false;
    return this.completedStages.size>=feedbackConfig.normalStageClearThreshold||activeSeconds>=feedbackConfig.activePlaySecondsThreshold||testComplete;
  }
  dismiss(){try{localStorage.setItem(DISMISSED,String(Date.now()));localStorage.setItem(SESSION,this.sessionId)}catch{} }
  submitted(){try{localStorage.setItem(SUBMITTED,'true')}catch{} }
}
