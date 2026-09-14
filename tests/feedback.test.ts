import {describe,expect,it} from 'vitest';
import {validateFeedback} from '../src/feedback/FeedbackService';
import {FeedbackManager} from '../src/feedback/FeedbackManager';

const valid={ratingUsability:5,difficulty:'just_right' as const,ratingFun:4,ratingCubeMemo:null,ratingReplay:5,comment:'',email:'',marketingConsent:false,cubeMemoUnused:true};
describe('beta feedback',()=>{
  it('validates ratings and optional email',()=>{expect(validateFeedback(valid)).toBeNull();expect(validateFeedback({...valid,ratingFun:6})).toBeTruthy();expect(validateFeedback({...valid,email:'bad'})).toContain('メールアドレス');});
  it('is disabled outside a browser runtime',()=>{const m=new FeedbackManager('feedback-test-session');expect(m.shouldShow(3,0,false)).toBe(false);});
});
