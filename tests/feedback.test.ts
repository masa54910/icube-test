import {describe,expect,it} from 'vitest';
import {validateFeedback} from '../src/feedback/FeedbackService';
import {FeedbackManager} from '../src/feedback/FeedbackManager';

const valid={ratingUsability:5,difficulty:'just_right' as const,ratingFun:4,ratingCubeMemo:null,ratingReplay:5,comment:'',email:'',marketingConsent:false,cubeMemoUnused:true};
describe('beta feedback',()=>{
  it('validates ratings and optional email',()=>{expect(validateFeedback(valid)).toBeNull();expect(validateFeedback({...valid,ratingFun:6})).toBeTruthy();expect(validateFeedback({...valid,email:'bad'})).toContain('メールアドレス');});
  it('counts distinct completed stages, not answer correctness',()=>{const m=new FeedbackManager('feedback-test-session');m.noteStageCompleted('1');m.noteStageCompleted('1');m.noteStageCompleted('2');expect(m.completedStageCount).toBe(2);expect(m.shouldShow(2,0,false)).toBe(false);m.noteStageCompleted('3');expect(m.shouldShow(0,0,false)).toBe(false);});
});
