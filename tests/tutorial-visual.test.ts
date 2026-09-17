import {expect,it} from 'vitest';
import {existsSync,readFileSync} from 'node:fs';
import {tutorialScenes,spotlightSteps,placeTutorialBubble} from '../src/ui/SpotlightTutorial';
it('six scenes follow the play flow and Memo targets the real button without an image',()=>{
 expect(tutorialScenes).toEqual(['explore','look-up','jump','climb',null,'solve']);
 expect(spotlightSteps(true)[4]!.target).toBe('.mini-memo');
 for(const scene of tutorialScenes)if(scene&&scene!=='jump'&&scene!=='look-up')expect(existsSync(`public/assets/home-showcase/${scene}.webp`)).toBe(true);
});
it('jump still uses shipped world/character, no game mutation or telemetry',()=>{
 const source=readFileSync('src/ui/TutorialJumpStill.ts','utf8');
 expect(source).toContain('world.build(stage)');expect(source).toContain('STAGES[0]');
 expect(source).toContain('character.update(position,Math.PI/2,0,.2,false,0,true)');
 expect(source).toContain('forceContextLoss');expect(source).not.toMatch(/fetch\(|localStorage|analytics|requestAnimationFrame/);
});
it.each([[1280,720],[768,1024],[390,844],[844,390]])('image card contained at %s x %s',(w,h)=>{
 const width=Math.min(620,w-24),height=Math.min(560,h-24);
 const p=placeTutorialBubble({x:w-190,y:h-200,width:170,height:180},width,height,{x:12,y:12,width:w-24,height:h-24});
 expect(p.x).toBeGreaterThanOrEqual(12);expect(p.y).toBeGreaterThanOrEqual(12);
 expect(p.x+width).toBeLessThanOrEqual(w-12);expect(p.y+height).toBeLessThanOrEqual(h-12);
});
