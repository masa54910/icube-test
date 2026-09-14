import {feedbackConfig,feedbackIsEnabled} from './FeedbackConfig';
const SUBMITTED='icube-beta-feedback-submitted',DISMISSED='icube-beta-feedback-dismissed',SESSION='icube-beta-feedback-dismissed-session';
export class FeedbackManager{
  constructor(readonly sessionId:string){}
  private read(key:string){try{return localStorage.getItem(key)??''}catch{return ''}}
  shouldShow(normalClears:number,activeSeconds:number,testComplete:boolean):boolean{
    if(!feedbackIsEnabled()||this.read(SUBMITTED))return false;
    if(this.read(SESSION)===this.sessionId)return false;
    const dismissed=Number(this.read(DISMISSED));if(dismissed&&Date.now()-dismissed<feedbackConfig.dismissCooldownMs)return false;
    return normalClears>=feedbackConfig.normalStageClearThreshold||activeSeconds>=feedbackConfig.activePlaySecondsThreshold||testComplete;
  }
  dismiss(){try{localStorage.setItem(DISMISSED,String(Date.now()));localStorage.setItem(SESSION,this.sessionId)}catch{} }
  submitted(){try{localStorage.setItem(SUBMITTED,'true')}catch{} }
}
