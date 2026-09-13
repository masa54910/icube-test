import {beforeEach,it,expect,vi} from 'vitest';
import {STAGES} from '../src/stages/stage-data';
import {buildChoices,shapeKey} from '../src/stages/stage-utils';
import {CubeMemoStore} from '../src/game/CubeMemo';
import {CubeMemoSystem} from '../src/game/CubeMemoSystem';
beforeEach(()=>{const map=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>map.set(k,v)});});
it.each(STAGES)('$displayName canonical, origin, answer shape and full/partial hints',stage=>{
 const config=stage.memo!;expect(config.enabled).toBe(true);expect(config.hintLimit).toBe(1);expect(config.canonicalCubes).toHaveLength(stage.rooms.length);expect(new Set(config.canonicalCubes.map(p=>p.join(','))).size).toBe(stage.rooms.length);expect(config.canonicalCubes).toContainEqual([0,0,0]);expect(config.canonicalCubes.every(p=>p.every(Number.isInteger))).toBe(true);
 expect(shapeKey(config.canonicalCubes)).toBe(shapeKey(buildChoices(stage).find(c=>c.correct)!.voxels));
 config.canonicalCubes.forEach((p,i)=>expect(p.map((v,k)=>v+config.origin[k]!)).toEqual(stage.rooms[i]));
 const full=new CubeMemoStore(stage.id,config.canonicalCubes);full.addBatch(config.canonicalCubes.map(([x,y,z])=>({x,y,z})));full.unlockHint();full.useHint();expect(full.cubes.every(c=>c.hintState!=='unknown')).toBe(true);
 const part=new CubeMemoStore(stage.id+'-partial',config.canonicalCubes);const good=config.canonicalCubes.find(p=>p.some(v=>v!==0))!;part.add(...good);part.add(24,24,24);part.unlockHint();part.useHint();expect(part.cubes[1]!.hintState).toBe('correct');expect(part.cubes[2]!.hintState).toBe('unknown');expect(part.cubes).toHaveLength(3);
});
it('shares stage data and undo without sharing hint state',()=>{const system=new CubeMemoSystem(),a=system.get(STAGES[0]!),b=system.get(STAGES[1]!);a.add(1,0,0);a.unlockHint();a.useHint();expect(b.hintUnlocked).toBe(false);expect(b.cubes).toHaveLength(1);expect(system.get(STAGES[0]!)).toBe(a);expect(a.canUndo).toBe(true);});
it('supports configurable hint budgets without legacy hint refund',()=>{const s=new CubeMemoStore('future',[[0,0,0],[1,0,0]],2);s.unlockHint();expect(s.useHint()).toBe(true);expect(s.hintExhausted).toBe(false);s.add(1,0,0);expect(s.useHint()).toBe(true);expect(s.hintExhausted).toBe(true);expect(new CubeMemoStore('future',[[0,0,0],[1,0,0]],2).hintExhausted).toBe(true);});
