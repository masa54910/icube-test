import {it,expect,vi} from 'vitest';
import {ADVANCED_STAGES,validateRoute} from '../src/stages/advanced-route';
import {STAGES} from '../src/stages/stage-data';
import {ALL_STAGES,catalogStage} from '../src/stages/catalog';
import {buildChoices,isConnected,shapeKey} from '../src/stages/stage-utils';
import {CubeMemoSystem} from '../src/game/CubeMemoSystem';
import {WorldBuilder} from '../src/game/WorldBuilder';
import {advancedCopy} from '../src/i18n/advanced';
it('isolates standard catalog and advanced ids',()=>{expect(STAGES).toHaveLength(31);expect(ADVANCED_STAGES).toHaveLength(3);expect(new Set(ALL_STAGES.map(s=>s.id)).size).toBe(41);for(const s of ADVANCED_STAGES)expect(catalogStage(s.numericId).id).toBe(s.id);});
it.each(ADVANCED_STAGES)('$displayName connected path, distractors, goal, memo and choices',s=>{
 expect(()=>validateRoute(s)).not.toThrow();expect(isConnected(s.rooms)).toBe(true);expect(s.memo!.canonicalCubes).toHaveLength(s.rooms.length);const choices=buildChoices(s);expect(choices).toHaveLength(10);expect(new Set(choices.map(c=>shapeKey(c.voxels))).size).toBe(10);expect(choices.filter(c=>c.correct)).toHaveLength(1);choices.forEach(c=>expect(isConnected(c.voxels)).toBe(true));
 const world=new WorldBuilder();const built=world.build(s);expect(Math.abs(built.answerPosition.x-s.goal![0]*6)).toBeLessThan(3);expect(world.colliders.every(b=>!b.isEmpty())).toBe(true);world.clear();
 const data=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>data.get(k),setItem:(k:string,v:string)=>data.set(k,v)});const engine=new CubeMemoSystem(),memo=engine.get(s);memo.addBatch(s.memo!.canonicalCubes.map(([x,y,z])=>({x,y,z})));memo.unlockHint();memo.useHint();expect(memo.cubes.every(c=>c.hintState!=='unknown')).toBe(true);expect(engine.get(STAGES[0]!).cubes).toHaveLength(1);
});
it('contains nine complete localizations',()=>{expect(Object.keys(advancedCopy)).toHaveLength(9);Object.values(advancedCopy).forEach(v=>expect(v.every(s=>s.length>0)).toBe(true));});
