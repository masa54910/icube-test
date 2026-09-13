import {afterEach,expect,it,vi} from 'vitest';
const render=vi.hoisted(()=>vi.fn());
vi.mock('three',async importOriginal=>{const actual=await importOriginal<typeof import('three')>();return {...actual,WebGLRenderer:class{
  ratio=1;canvas:HTMLCanvasElement;constructor({canvas}:{canvas:HTMLCanvasElement}){this.canvas=canvas;}
  setPixelRatio(r:number){this.ratio=r;}getPixelRatio(){return this.ratio;}
  setSize(w:number,h:number){this.canvas.width=Math.floor(w*this.ratio);this.canvas.height=Math.floor(h*this.ratio);}
  render=render;
}};});
import {HomePreview} from '../src/ui/HomePreview';
afterEach(()=>{vi.unstubAllGlobals();render.mockClear();});
function setup(reduced:boolean,top=0){
  vi.stubGlobal('devicePixelRatio',1.5);vi.stubGlobal('innerHeight',768);vi.stubGlobal('matchMedia',()=>({matches:reduced,addEventListener:vi.fn()}));
  vi.stubGlobal('document',{hidden:false,createElement:()=>({width:0,height:0,getContext:()=>({fillStyle:'',fillRect(){},beginPath(){},moveTo(){},lineTo(){},closePath(){},fill(){}})})});
  const canvas={width:0,height:0,addEventListener:vi.fn(),getBoundingClientRect:()=>({width:800.6,height:700.6,top,bottom:top+700.6})} as unknown as HTMLCanvasElement;
  return new HomePreview(canvas);
}
it('reduced motion draws only once even at fractional CSS dimensions',()=>{const preview=setup(true);for(let i=0;i<120;i++)preview.render(1/60);expect(render).toHaveBeenCalledTimes(1);});
it('home render rate is capped at 30Hz',()=>{const preview=setup(false);for(let i=0;i<120;i++)preview.render(1/60);expect(render.mock.calls.length).toBeLessThanOrEqual(61);expect(render.mock.calls.length).toBeGreaterThanOrEqual(59);});
it('off-screen mobile home canvas does not render',()=>{const preview=setup(false,-800);preview.render(1);expect(render).not.toHaveBeenCalled();});
