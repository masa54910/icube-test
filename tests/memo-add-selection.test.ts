import {it,expect,vi} from 'vitest';
import {CubeMemoStore} from '../src/game/CubeMemo';
import {MemoViewport} from '../src/ui/MemoViewport';
function fixture(){
 const store=new CubeMemoStore('selection-test',[[0,0,0]]);
 const view:any=Object.create(MemoViewport.prototype);
 Object.assign(view,{store,selected:'origin',selectedFace:null,color:'white',highlight:vi.fn(),sync:vi.fn(),changed:vi.fn(),inside:()=>true,pointers:new Map(),drawPreview:vi.fn()});
 return {store,view};
}
it.each([1,3,5])('line %i selects last newly added cube and its outward face',n=>{
 const {store,view}=fixture();view.addLine(n);
 expect(view.selected).toBe(store.cubes.at(-1)!.id);expect(view.selectedFace.cube.x).toBe(n);
 store.color(view.selected,'red');expect(store.cubes.at(-1)!.color).toBe('red');expect(store.cubes[0]!.color).toBe('cyan');
});
it.each(['stock','face'])('%s drop selects new cube before notifying UI',kind=>{
 const {store,view}=fixture();view.gesture={kind,face:kind==='face'?{cube:store.cubes[0],axis:'y',sign:1}:undefined};view.preview=[{x:0,y:1,z:0}];
 view.changed=()=>expect(view.selected).toBe(store.cubes.at(-1)!.id);
 view.up({clientX:0,clientY:0,pointerId:1});
 expect(view.selected).not.toBe('origin');store.color(view.selected,'blue');expect(store.cubes.at(-1)!.color).toBe('blue');
});
it('blocked addition keeps selection',()=>{
 const {view}=fixture();view.gesture={kind:'stock'};view.preview=[{x:0,y:0,z:0}];view.up({clientX:0,clientY:0,pointerId:1});expect(view.selected).toBe('origin');expect(view.highlight).not.toHaveBeenCalled();
});
it('continuous placement selects last actually inserted cube, not an occupied target',()=>{
 const {store,view}=fixture();store.add(3,0,0);view.gesture={kind:'stock'};view.preview=[{x:1,y:0,z:0},{x:2,y:0,z:0},{x:3,y:0,z:0}];view.up({clientX:0,clientY:0,pointerId:1});expect(store.cubes.find(c=>c.id===view.selected)?.x).toBe(2);
});
