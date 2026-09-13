export interface MovementInput { x: number; forward: number; jump: boolean; turn: number }
const movementKeys = new Set(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','KeyQ','KeyR','KeyE','KeyV','KeyF','ShiftLeft','ShiftRight']);
export class InputController {
  enabled = false;
  onInteract = () => {};
  onToggleCamera = () => {};
  onLookUp = (_held:boolean) => {};
  private shiftHeld=false;
  private updateShift():void {const held=this.enabled&&(this.keys.has('ShiftLeft')||this.keys.has('ShiftRight'));if(held!==this.shiftHeld){this.shiftHeld=held;this.onLookUp(held);}}
  private keys = new Set<string>();
  private pointers = new Map<number, { x: number; y: number; stick: boolean }>();
  private stick = { x: 0, y: 0 };
  private look = { x: 0, y: 0 };
  private jumpTap = false;
  constructor(canvas: HTMLCanvasElement) {
    window.addEventListener('keydown', event => {
      if (!this.enabled || (event.target instanceof HTMLElement && event.target.matches('input,textarea,select'))) return;
      if (movementKeys.has(event.code)) event.preventDefault();
      this.keys.add(event.code);
      this.updateShift();
      if(!event.repeat&&event.code==='Space')this.jumpTap=true;
      if (!event.repeat && event.code === 'KeyV') this.onToggleCamera();
      if (!event.repeat && (event.code === 'KeyF'||event.code==='KeyE')) this.onInteract();
    });
    window.addEventListener('keyup', event => { if (this.enabled && movementKeys.has(event.code)) event.preventDefault(); this.keys.delete(event.code);this.updateShift(); });
    window.addEventListener('blur', () => this.reset());
    window.addEventListener('resize',()=>this.reset());
    document.addEventListener('visibilitychange',()=>{if(document.hidden)this.reset();});
    canvas.addEventListener('contextmenu', event => event.preventDefault());
    canvas.addEventListener('pointerdown', event => {
      if (!this.enabled) return;
      event.preventDefault(); canvas.setPointerCapture(event.pointerId);
      const stick = event.pointerType === 'touch' && event.clientX < canvas.clientWidth * .45 && ![...this.pointers.values()].some(p=>p.stick);
      this.pointers.set(event.pointerId, { x:event.clientX, y:event.clientY, stick });
    });
    canvas.addEventListener('pointermove', event => {
      const p = this.pointers.get(event.pointerId); if (!p || !this.enabled) return;
      if (p.stick) {
        this.stick.x = (event.clientX-p.x)/55; this.stick.y = (p.y-event.clientY)/55;
        const length = Math.hypot(this.stick.x,this.stick.y); if(length>1) { this.stick.x/=length; this.stick.y/=length; }
      } else {
        const scale = event.pointerType==='touch' ? .0042 : .0026;
        this.look.x += (event.clientX-p.x)*scale; this.look.y += (event.clientY-p.y)*scale;
        p.x=event.clientX; p.y=event.clientY;
      }
    });
    const release = (event:PointerEvent) => { if(this.pointers.get(event.pointerId)?.stick) this.stick={x:0,y:0}; this.pointers.delete(event.pointerId); };
    canvas.addEventListener('pointerup', release); canvas.addEventListener('pointercancel', release); canvas.addEventListener('lostpointercapture', release);
  }
  setEnabled(enabled:boolean):void { if(this.enabled!==enabled) this.reset(); this.enabled=enabled; }
  reset():void { this.keys.clear();this.updateShift(); this.pointers.clear(); this.stick={x:0,y:0}; this.look={x:0,y:0}; this.jumpTap=false; }
  jump():void { if(this.enabled) this.jumpTap=true; }
  sample():MovementInput {
    if(!this.enabled) return {x:0,forward:0,jump:false,turn:0};
    const has=(...codes:string[])=>codes.some(code=>this.keys.has(code))?1:0;
    const x=has('KeyD','ArrowRight')-has('KeyA','ArrowLeft')+this.stick.x;
    const forward=has('KeyW','ArrowUp')-has('KeyS','ArrowDown')+this.stick.y;
    const jump=has('Space')===1||this.jumpTap; this.jumpTap=false;
    return {x:Math.max(-1,Math.min(1,x)),forward:Math.max(-1,Math.min(1,forward)),jump,turn:has('KeyR')-has('KeyQ')};
  }
  consumeLook():{x:number;y:number} { const value=this.look; this.look={x:0,y:0}; return value; }
}
