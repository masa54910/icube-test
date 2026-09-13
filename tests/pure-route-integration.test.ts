import {it,expect,vi} from 'vitest';
import * as T from 'three';
import {PURE_ROUTE_STAGES} from '../src/stages/pure-route';
import {STAGES} from '../src/stages/stage-data';
import {WorldBuilder} from '../src/game/WorldBuilder';
import {PlayerController} from '../src/game/PlayerController';
import {BoostPads} from '../src/game/BoostPads';
import {CubeMemoSystem} from '../src/game/CubeMemoSystem';
import {ALL_STAGES,catalogStage} from '../src/stages/catalog';
import {pureRouteCopy} from '../src/i18n/pureRoute';
import {CubeMemoStore} from '../src/game/CubeMemo';
import {CONFIG} from '../src/config';
import {buildChoices,shapeKey} from '../src/stages/stage-utils';
const neutral={forward:0,x:0,turn:0,jump:false};
it('geometry refresh preserves old notes but removes stale correct glow',()=>{const s=PURE_ROUTE_STAGES[2]!;const old={version:2,stageId:s.id,cubes:[{id:'old',x:24,y:24,z:24,color:'blue',order:1,hintState:'correct'}],hintUnlocked:true,hintUsed:true,lit:['24,24,24']};vi.stubGlobal('localStorage',{getItem:()=>JSON.stringify(old),setItem:()=>{}});try{const m=new CubeMemoStore(s.id,s.memo!.canonicalCubes,1);expect(m.cubes.find(c=>c.x===24)?.color).toBe('blue');expect(m.cubes.find(c=>c.x===24)?.hintState).toBe('unknown');expect(m.hintUsed).toBe(true);}finally{vi.unstubAllGlobals();}});
it.each(STAGES)('$id Standard answer positions and choices remain unchanged',s=>{const w=new WorldBuilder(),b=w.build(s);expect(b.answerPositions).toHaveLength(1);expect(b.answerPosition.toArray()).toEqual(s.start.map((v,i)=>v*6+CONFIG.answer.pointOffset[i]!));expect(s.boostPads??[]).toHaveLength(0);const choices=buildChoices(s);expect(choices).toHaveLength(10);expect(choices.filter(c=>shapeKey(c.voxels)===shapeKey(s.rooms))).toHaveLength(1);w.clear();});
it.each(PURE_ROUTE_STAGES)('$id partial hint does not reveal missing cubes',s=>{vi.stubGlobal('localStorage',{getItem:()=>null,setItem:()=>{}});const m=new CubeMemoStore(s.id,s.memo!.canonicalCubes,1),p=s.memo!.canonicalCubes[1]!;m.add(...p);m.add(24,24,24);m.unlockHint();m.useHint();expect(m.cubes).toHaveLength(3);expect(m.cubes.find(c=>c.x===p[0]&&c.y===p[1]&&c.z===p[2])!.hintState).toBe('correct');expect(m.cubes.find(c=>c.x===24)!.hintState).toBe('unknown');vi.unstubAllGlobals();});
it.each(PURE_ROUTE_STAGES)('$id terminals, canonical hints and save isolation',s=>{
 const w=new WorldBuilder(),built=w.build(s);expect(built.answerPositions).toHaveLength(s.answerPoints!.length);expect(built.root.children.filter(o=>o.name==='answer-terminal')).toHaveLength(s.answerPoints!.length);
 for(const p of built.answerPositions){expect(w.isNavigable(p)).toBe(false);const front=p.clone().add(new T.Vector3(0,-.0798,-1.1));expect(w.isNavigable(front)).toBe(true);expect(front.distanceTo(p)).toBeLessThan(CONFIG.answer.pointRadius);}
 const memory=new Map<string,string>();vi.stubGlobal('localStorage',{getItem:(k:string)=>memory.get(k)??null,setItem:(k:string,v:string)=>memory.set(k,v)});const engine=new CubeMemoSystem(),m=engine.get(s);m.addBatch(s.memo!.canonicalCubes.map(([x,y,z])=>({x,y,z})));m.unlockHint();m.useHint();expect(m.cubes.every(c=>c.hintState!=='unknown')).toBe(true);expect(engine.get(STAGES[0]!).cubes).toHaveLength(1);expect(new CubeMemoSystem().get(s).cubes).toHaveLength(m.cubes.length);w.clear();vi.unstubAllGlobals();
});
it('production catalog archives old ids and keeps new Continue lookup isolated',()=>{expect(ALL_STAGES).toHaveLength(41);expect(ALL_STAGES.some(s=>s.id==='advanced_route_1')).toBe(false);expect(catalogStage(107).id).toBe('advanced-route1-7');expect(new Set(ALL_STAGES.map(s=>s.id)).size).toBe(41);expect(Object.keys(pureRouteCopy)).toHaveLength(9);Object.values(pureRouteCopy).forEach(v=>expect(v).toHaveLength(3));});
it('boost enters forwards, ignores jump, stops by distance and preserves collision',()=>{
 const s=PURE_ROUTE_STAGES[2]!,w=new WorldBuilder();w.build(s);const pads=new BoostPads();pads.build(s);const p=new PlayerController(),b=s.boostPads![0]!,start=new T.Vector3(...b.position).multiplyScalar(6);start.y-=2.939;p.reset(start,Math.PI/2);p.update(.03,w,neutral,p.yaw,'third-person');let seen=false,max=0;
 for(let i=0;i<500;i++){pads.update(.01,p,i===0?1:0);seen||=pads.boosting;p.update(.01,w,{...neutral,jump:i>20},p.yaw,'third-person');max=Math.max(max,p.position.x-start.x);if(seen&&!pads.boosting)break;expect(Math.abs(p.position.y-start.y)).toBeLessThan(.02);expect(w.isNavigable(p.position)).toBe(true);}
 expect(seen).toBe(true);expect(max).toBeCloseTo(b.distance*6,1);expect(pads.boosting).toBe(false);
 pads.clear();pads.build(s);p.reset(start,-Math.PI/2);p.update(.03,w,neutral,p.yaw);pads.update(.01,p,1);expect(pads.boosting).toBe(false);
 // Inject a collision fixture in the dash corridor: no wall tunnelling at boost speed.
 pads.clear();pads.build(s);p.reset(start,Math.PI/2);p.update(.03,w,neutral,p.yaw);w.colliders.push(new T.Box3(new T.Vector3(start.x+3,-3,-3),new T.Vector3(start.x+3.2,3,3)));
 for(let i=0;i<200;i++){pads.update(.01,p,1);p.update(.01,w,neutral,p.yaw,'third-person');}expect(p.position.x).toBeLessThan(start.x+3);expect(pads.boosting).toBe(false);pads.clear();w.clear();
});
