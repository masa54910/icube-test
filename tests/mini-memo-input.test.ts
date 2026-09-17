import {it,expect,vi,afterEach} from 'vitest';
import {MiniMemoView} from '../src/ui/MiniMemoView';
class ElementStub extends EventTarget {
 className='';type='';textContent='';title='';clientWidth=0;clientHeight=0;
 classList={contains:(s:string)=>this.className.split(' ').includes(s),toggle:()=>{}};
 append(){} setAttribute(){} setPointerCapture(){} remove(){}
}
afterEach(()=>vi.unstubAllGlobals());
it.each(['mouse','touch'])('%s drag changes only preview orientation; cancellation releases input',pointerType=>{
 vi.stubGlobal('document',{createElement:()=>new ElementStub(),hidden:false});
 vi.stubGlobal('ResizeObserver',class{observe(){}disconnect(){}});
 const view=new MiniMemoView(()=>{});
 view.root.className='mini-memo mini-quiz';
 const data=[{id:'a',x:1,y:2,z:3,color:'red' as const,order:1,hintState:'unknown' as const}];
 view.sync(data,false);const snapshot=JSON.stringify(data);
 const state=view as unknown as {yaw:number;pitch:number};const yaw=state.yaw;
 const send=(type:string,x:number,y:number)=>view.root.dispatchEvent(Object.assign(new Event(type,{cancelable:true}),{pointerId:1,pointerType,clientX:x,clientY:y}));
 send('pointerdown',0,0);send('pointermove',30,15);expect(state.yaw).not.toBe(yaw);expect(JSON.stringify(data)).toBe(snapshot);
 const rotated=state.yaw;send('pointercancel',30,15);send('pointermove',60,30);expect(state.yaw).toBe(rotated);
 view.dispose();
});
