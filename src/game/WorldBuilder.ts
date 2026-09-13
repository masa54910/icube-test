import * as THREE from 'three';
import { CONFIG } from '../config';
import type { LadderDefinition, StageDefinition, Vec3Tuple } from '../types';
import { coordKey } from '../stages/stage-utils';
import {validateLadderTopExits} from '../stages/ladder-exit-validator';

export interface BuiltWorld {
  readonly root: THREE.Group;
  readonly answerPosition: THREE.Vector3;
  readonly answerPositions: readonly THREE.Vector3[];
  readonly rooms: readonly Vec3Tuple[];
  readonly ladders: readonly LadderDefinition[];
}

const material = (color: number, roughness = 0.82, emissive = 0): THREE.MeshStandardMaterial => new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.02, emissive, emissiveIntensity: emissive ? 0.8 : 0 });
const solid = (size: readonly [number, number, number], position: THREE.Vector3, mat: THREE.Material): THREE.Mesh => {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), mat); mesh.position.copy(position); mesh.castShadow = false; mesh.receiveShadow = true; return mesh;
};
const centerFor = ([x, y, z]: Vec3Tuple): THREE.Vector3 => new THREE.Vector3(x * CONFIG.roomSize, y * CONFIG.roomSize, z * CONFIG.roomSize);

export class WorldBuilder {
  #world: BuiltWorld | null = null;
  readonly colliders: THREE.Box3[] = [];
  private terminals:{cross:THREE.Group;materials:THREE.MeshStandardMaterial[];position:THREE.Vector3;delay:number;wake:number}[]=[];
  private terminalMaterials:THREE.MeshStandardMaterial[]=[];
  terminalWake=0;
  onTerminalWake:(()=>void)|null=null;
  update(dt:number,position?:THREE.Vector3,answering=false):void {
    this.terminalWake=0;
    for(const terminal of this.terminals){
      const near=!!position&&position.distanceTo(terminal.position)<3.5;
      if(near){if(terminal.delay===0)this.onTerminalWake?.();terminal.delay=1.2;}else if(!answering)terminal.delay=Math.max(0,terminal.delay-dt);
      const target=terminal.delay>0?1:0;terminal.wake+=(target-terminal.wake)*(1-Math.exp(-dt*(target?5:2.5)));
      for(const mat of terminal.materials)mat.emissiveIntensity=.06+terminal.wake*.8;
      terminal.cross.rotation.y+=dt*(.025+terminal.wake*.45);this.terminalWake=Math.max(this.terminalWake,terminal.wake);
    }
  }

  get world(): BuiltWorld | null { return this.#world; }

  build(stage: StageDefinition): BuiltWorld {
    this.clear();
    const root = new THREE.Group(); root.name = `stage-${stage.numericId}`;
    const roomLookup = new Set(stage.rooms.map(coordKey));
    const roomMat = material(CONFIG.colors.room); const gridMat = material(CONFIG.colors.grid, 0.9);
    stage.rooms.forEach((room, index) => this.buildRoom(root, room, roomLookup, roomMat, gridMat, index));
    stage.ladders.forEach((ladder) => this.buildLadder(root, ladder));
    const answerPositions=(stage.answerPoints??[stage.goal??stage.start]).map(p=>centerFor(p).add(new THREE.Vector3(...CONFIG.answer.pointOffset)));
    const answerPosition=answerPositions[0]!;
    for(const position of answerPositions)this.buildAnswerPad(root, position);
    root.updateMatrixWorld(true);
    root.traverse(object => {
      if(object instanceof THREE.Mesh && (object.material===roomMat||object.userData.solidTerminal)) this.colliders.push(new THREE.Box3().setFromObject(object));
    });
    this.#world = { root, answerPosition, answerPositions, rooms: stage.rooms, ladders: stage.ladders };
    if(stage.routeChapter!==undefined)validateLadderTopExits(stage,this);
    return this.#world;
  }

  buildOverview(stage: StageDefinition): THREE.Group {
    const root = new THREE.Group(); root.name = 'correct-overview';
    const cubeMaterial = material(0xf5f8fc, 0.55);
    const edgeMaterial = material(0x71829a, 0.65);
    const bounds = this.bounds(stage.rooms);
    const center = new THREE.Vector3((bounds.min[0] + bounds.max[0]) / 2, (bounds.min[1] + bounds.max[1]) / 2, (bounds.min[2] + bounds.max[2]) / 2);
    stage.rooms.forEach(([x, y, z]) => {
      const cube = solid([1.72, 1.72, 1.72], new THREE.Vector3((x - center.x) * 1.9, (y - center.y) * 1.9, (z - center.z) * 1.9), cubeMaterial);
      root.add(cube);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.78, 1.78, 1.78)), new THREE.LineBasicMaterial({ color: edgeMaterial.color }));
      edges.position.copy(cube.position); root.add(edges);
    });
    return root;
  }

  clear(): void {
    this.terminals=[];
    this.terminalMaterials=[];this.terminalWake=0;
    this.colliders.length=0;
    if (!this.#world) return;
    this.#world.root.removeFromParent();
    this.#world.root.traverse((object) => { if (object instanceof THREE.Mesh || object instanceof THREE.LineSegments) { object.geometry.dispose(); if (Array.isArray(object.material)) object.material.forEach((mat) => mat.dispose()); else object.material.dispose(); } });
    this.#world = null;
  }

  roomAt(worldPosition: THREE.Vector3): Vec3Tuple | null {
    if (!this.#world) return null;
    const coordinate: Vec3Tuple = [Math.round(worldPosition.x / CONFIG.roomSize), Math.round(worldPosition.y / CONFIG.roomSize), Math.round(worldPosition.z / CONFIG.roomSize)];
    return this.#world.rooms.some((room) => coordKey(room) === coordKey(coordinate)) ? coordinate : null;
  }

  isNavigable(worldPosition: THREE.Vector3, radius = CONFIG.player.radius): boolean {
    const box=new THREE.Box3(worldPosition.clone().add(new THREE.Vector3(-radius,.001,-radius)),worldPosition.clone().add(new THREE.Vector3(radius,1.52,radius)));
    return !this.colliders.some(wall=>box.intersectsBox(wall));
  }

  /** Entire foot footprint must rest on a real horizontal collider, not the hatch edge. */
  hasSafeFloor(position:THREE.Vector3,margin=.08):boolean {
    const r=CONFIG.player.radius+margin;
    return this.colliders.some(b=>b.max.y-b.min.y<=CONFIG.wallThickness+.001&&Math.abs(position.y-b.max.y)<.015&&position.x-r>=b.min.x&&position.x+r<=b.max.x&&position.z-r>=b.min.z&&position.z+r<=b.max.z)&&this.isNavigable(position);
  }
  ladderClimbTop(ladder:LadderDefinition):number {
    // The rendered rails extend through the destination room. Keep the capsule
    // below its ceiling, rather than treating the destination floor as the end.
    return (ladder.to[1]+.5)*CONFIG.roomSize-CONFIG.wallThickness/2-CONFIG.player.height-.02;
  }
  ladderTopExitTarget(ladder:LadderDefinition,position:THREE.Vector3):THREE.Vector3|null {
    const x=ladder.to[0]*CONFIG.roomSize,z=ladder.to[2]*CONFIG.roomSize,y=ladder.to[1]*CONFIG.roomSize-CONFIG.roomSize/2+CONFIG.wallThickness/2+.0002;
    // Prefer the rung-facing floor strip; side strips support rotated/obstructed placements.
    const candidates=[new THREE.Vector3(x+THREE.MathUtils.clamp(position.x-x,-.62,.62),y,z-2.49),new THREE.Vector3(x-1.64,y,z-1.35),new THREE.Vector3(x+1.64,y,z-1.35),new THREE.Vector3(x,y,z+2.49)];
    return candidates.find(p=>this.hasSafeFloor(p))??null;
  }

  moveAxis(position:THREE.Vector3,axis:'x'|'y'|'z',amount:number):boolean {
    if(!amount)return false;
    position[axis]+=amount;let hit=false;
    const radius=CONFIG.player.radius,height=CONFIG.player.height;
    for(const wall of this.colliders) {
      const box=new THREE.Box3(position.clone().add(new THREE.Vector3(-radius,.0001,-radius)),position.clone().add(new THREE.Vector3(radius,height,radius)));
      if(!box.intersectsBox(wall))continue;
      hit=true;
      if(axis==='y') position.y=amount>0?wall.min.y-height-.0002:wall.max.y+.0002;
      else position[axis]=amount>0?wall.min[axis]-radius-.0002:wall.max[axis]+radius+.0002;
    }
    return hit;
  }

  cameraDistance(origin:THREE.Vector3,direction:THREE.Vector3,distance:number):number {
    const ray=new THREE.Ray(origin,direction),point=new THREE.Vector3();
    for(const wall of this.colliders) {
      const box=wall.clone().expandByScalar(.16);
      if(box.containsPoint(origin)) { distance=Math.min(distance,.1); continue; }
      if(ray.intersectBox(box,point))distance=Math.min(distance,Math.max(.08,point.distanceTo(origin)-.04));
    }
    return distance;
  }

  ladderAt(worldPosition: THREE.Vector3): LadderDefinition | null {
    if (!this.#world) return null;
    return this.#world.ladders.find((ladder) => {
      const lower = Math.min(ladder.from[1], ladder.to[1]); const upper = Math.max(ladder.from[1], ladder.to[1]);
      const anchor = centerFor([ladder.from[0], 0, ladder.from[2]]);
      const yaw=ladder.facingYaw??0,dx=worldPosition.x-anchor.x,dz=worldPosition.z-(anchor.z-1.65);
      return Math.abs(dx*Math.cos(yaw)+dz*Math.sin(yaw)) < .65 && Math.abs(-dx*Math.sin(yaw)+dz*Math.cos(yaw)) < .65 && worldPosition.y >= lower * CONFIG.roomSize - 3 && worldPosition.y <= upper * CONFIG.roomSize - 2.8;
    }) ?? null;
  }

  adjacentLadder(current:LadderDefinition,side:number,y:number):LadderDefinition|null {
    // Only transfer between physically touching rails; never teleport across a room.
    return this.#world?.ladders.find(candidate=>{
      if(candidate.id===current.id)return false;
      const a=current.facingYaw??0,b=candidate.facingYaw??0;
      const dx=(candidate.from[0]-current.from[0])*6-side*.78*(Math.cos(a)+Math.cos(b));
      const dz=(candidate.from[2]-current.from[2])*6-side*.78*(Math.sin(a)+Math.sin(b));
      return Math.hypot(dx,dz)<.25&&y>=Math.min(candidate.from[1],candidate.to[1])*6-2.94&&y<=Math.max(candidate.from[1],candidate.to[1])*6-2.94;
    })??null;
  }

  ladderGrabAt(position:THREE.Vector3,velocity:THREE.Vector3):LadderDefinition|null {
    return this.#world?.ladders.find(ladder=>{
      const a=ladder.facingYaw??0,c=Math.cos(a),s=Math.sin(a);
      const dx=position.x-ladder.from[0]*6,dz=position.z-(ladder.from[2]*6-1.35);
      const tangent=dx*c+dz*s,normal=-dx*s+dz*c;
      const normalSpeed=-velocity.x*s+velocity.z*c;
      const target=new THREE.Vector3(ladder.from[0]*6+THREE.MathUtils.clamp(tangent,-.62,.62)*c,position.y,ladder.from[2]*6-1.35+THREE.MathUtils.clamp(tangent,-.62,.62)*s);
      return Math.abs(tangent)<.78&&Math.abs(normal)<.48&&normal*normalSpeed<=.12
        &&position.y>=Math.min(ladder.from[1],ladder.to[1])*6-2.94&&position.y<=Math.max(ladder.from[1],ladder.to[1])*6-2.94
        &&this.isNavigable(target);
    })??null;
  }

  private buildRoom(root: THREE.Group, room: Vec3Tuple, lookup: Set<string>, roomMat: THREE.Material, gridMat: THREE.Material, index: number): void {
    const center = centerFor(room); const half = CONFIG.roomSize / 2; const t = CONFIG.wallThickness;
    const adjacent = (delta: Vec3Tuple): boolean => lookup.has(coordKey([room[0] + delta[0], room[1] + delta[1], room[2] + delta[2]]));
    const floorY = center.y - half; const ceilingY = center.y + half;
    this.surfaceGrid(root,center,floorY+t/2+.008,gridMat,adjacent([0,-1,0]));
    this.surfaceGrid(root,center,ceilingY-t/2-.008,gridMat,adjacent([0,1,0]));
    if (adjacent([0,-1,0])) this.buildHatchedSurface(root, center, floorY, roomMat, true); else root.add(solid([CONFIG.roomSize,t,CONFIG.roomSize], new THREE.Vector3(center.x,floorY,center.z), roomMat));
    if (adjacent([0,1,0])) this.buildHatchedSurface(root, center, ceilingY, roomMat, false); else root.add(solid([CONFIG.roomSize,t,CONFIG.roomSize], new THREE.Vector3(center.x,ceilingY,center.z), roomMat));
    if (!adjacent([-1,0,0])) this.buildWall(root, center, [-half,0,0], [t,CONFIG.roomSize,CONFIG.roomSize], gridMat, roomMat, 'x');
    if (!adjacent([1,0,0])) this.buildWall(root, center, [half,0,0], [t,CONFIG.roomSize,CONFIG.roomSize], gridMat, roomMat, 'x');
    if (!adjacent([0,0,-1])) this.buildWall(root, center, [0,0,-half], [CONFIG.roomSize,CONFIG.roomSize,t], gridMat, roomMat, 'z');
    if (!adjacent([0,0,1])) this.buildWall(root, center, [0,0,half], [CONFIG.roomSize,CONFIG.roomSize,t], gridMat, roomMat, 'z');
    if (index < 10) { const light = new THREE.PointLight(0xdceeff, 0.8, 10); light.position.set(center.x, center.y + 1.2, center.z); root.add(light); }
  }

  private buildWall(root: THREE.Group, center: THREE.Vector3, offset: Vec3Tuple, size: Vec3Tuple, gridMat: THREE.Material, wallMat: THREE.Material, axis: 'x' | 'z'): void {
    root.add(solid(size, center.clone().add(new THREE.Vector3(...offset)), wallMat));
    const position = center.clone().add(new THREE.Vector3(...offset).multiplyScalar(.975));
    for (const amount of [-CONFIG.roomSize/2,CONFIG.roomSize/2]) {
      const line = axis === 'x' ? solid([t(0.02), 0.025, CONFIG.roomSize], position.clone().add(new THREE.Vector3(0, amount, 0)), gridMat) : solid([CONFIG.roomSize, 0.025, t(0.02)], position.clone().add(new THREE.Vector3(0, amount, 0)), gridMat);
      root.add(line);
      const vertical=axis==='x'?solid([.024,6,.024],position.clone().add(new THREE.Vector3(0,0,amount)),gridMat):solid([.024,6,.024],position.clone().add(new THREE.Vector3(amount,0,0)),gridMat);
      root.add(vertical);
    }
  }

  private surfaceGrid(root:THREE.Group,center:THREE.Vector3,y:number,mat:THREE.Material,hatch:boolean):void {
    for(const offset of [-CONFIG.roomSize/2,CONFIG.roomSize/2]) {
      const zRanges=hatch&&Math.abs(offset)<1.2?[[-3,-2.05],[2.05,3]]:[[-3,3]];
      for(const [a,b] of zRanges) root.add(solid([.018,.012,b!-a!],new THREE.Vector3(center.x+offset,y,center.z+(a!+b!)/2),mat));
      const xRanges=hatch&&Math.abs(offset)<2.05?[[-3,-1.2],[1.2,3]]:[[-3,3]];
      for(const [a,b] of xRanges) root.add(solid([b!-a!,.012,.018],new THREE.Vector3(center.x+(a!+b!)/2,y,center.z+offset),mat));
    }
  }

  private buildHatchedSurface(root: THREE.Group, center: THREE.Vector3, y: number, mat: THREE.Material, floor: boolean): void {
    const half = CONFIG.roomSize / 2; const hatchHalfX = 1.2; const hatchHalfZ = 2.05; const t = CONFIG.wallThickness;
    root.add(solid([half - hatchHalfX, t, CONFIG.roomSize], new THREE.Vector3(center.x - (half + hatchHalfX) / 2, y, center.z), mat));
    root.add(solid([half - hatchHalfX, t, CONFIG.roomSize], new THREE.Vector3(center.x + (half + hatchHalfX) / 2, y, center.z), mat));
    root.add(solid([hatchHalfX * 2, t, half - hatchHalfZ], new THREE.Vector3(center.x, y, center.z - (half + hatchHalfZ) / 2), mat));
    root.add(solid([hatchHalfX * 2, t, half - hatchHalfZ], new THREE.Vector3(center.x, y, center.z + (half + hatchHalfZ) / 2), mat));
    const markerMat = material(CONFIG.colors.accent, 0.4, CONFIG.colors.accent); markerMat.transparent = true; markerMat.opacity = 0.12;
    const marker = solid([hatchHalfX * 2, 0.025, hatchHalfZ * 2], new THREE.Vector3(center.x, y + (floor ? 0.08 : -0.08), center.z), markerMat); root.add(marker);
  }

  private buildLadder(root: THREE.Group, ladder: LadderDefinition): void {
    const lower = Math.min(ladder.from[1], ladder.to[1]); const upper = Math.max(ladder.from[1], ladder.to[1]);
    const x = ladder.from[0] * CONFIG.roomSize; const z = ladder.from[2] * CONFIG.roomSize - 1.7; const y0 = lower * CONFIG.roomSize - 2.8; const y1 = (upper + 1) * CONFIG.roomSize - 2.8; const height = y1 - y0;
    const metal = material(0xaeb9c7, 0.42); const rails = new THREE.Group(); rails.userData = { ladderId: ladder.id }; rails.position.set(x, y0 + height / 2, z);
    rails.rotation.y=-(ladder.facingYaw??0);
    rails.add(solid([0.14, height, 0.14], new THREE.Vector3(-0.78, 0, 0), metal)); rails.add(solid([0.14, height, 0.14], new THREE.Vector3(0.78, 0, 0), metal));
    for (let y = -height / 2 + 0.35; y < height / 2; y += 0.45) rails.add(solid([1.7, 0.1, 0.12], new THREE.Vector3(0, y, 0), metal));
    root.add(rails);
  }

  private buildAnswerPad(root: THREE.Group, position: THREE.Vector3): void {
    this.terminalMaterials=[];
    const padMat = material(0xbbe6ff, 0.35, CONFIG.colors.accent); padMat.transparent = true; padMat.opacity = 0.62;
    const pad = solid([2.25, 0.04, 1.65], position, padMat); root.add(pad);
    const edges = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.3, 0.08, 1.7)), new THREE.LineBasicMaterial({ color: CONFIG.colors.accent })); edges.position.copy(position).add(new THREE.Vector3(0, 0.05, 0)); root.add(edges);
    const terminal=new THREE.Group();terminal.name='answer-terminal';terminal.position.copy(position);root.add(terminal);
    const white=material(0xf0f5fa,.38),cyan=material(0x65d9ef,.3,0x16708b),glass=material(0x071a30,.16);
    glass.emissive.setHex(0x16465b);this.terminalMaterials.push(padMat,cyan,glass);
    const part=(size:Vec3Tuple,p:Vec3Tuple,mat:THREE.Material,parent:THREE.Group=terminal)=>{const m=solid(size,new THREE.Vector3(...p),mat);m.userData.solidTerminal=true;parent.add(m);return m;};
    part([1.5,.1,.78],[0,.08,0],white);part([.42,.73,.35],[0,.45,0],white);
    part([.44,.05,.37],[0,.62,0],cyan);part([1.68,.14,.86],[0,.89,0],white);
    part([1.58,.025,.025],[0,.89,-.44],cyan);
    part([.14,.4,.12],[0,1.08,.15],white);
    const monitor=new THREE.Group();monitor.name='answer-monitor';monitor.position.set(0,1.4,.08);monitor.rotation.x=-.12;terminal.add(monitor);
    part([1.48,.86,.09],[0,0,0],cyan,monitor);part([1.40,.78,.1],[0,0,-.015],glass,monitor);
    const displayLayer=new THREE.Group();displayLayer.position.z=-.12;displayLayer.scale.z=.15;monitor.add(displayLayer);
    const cross=new THREE.Group();cross.name='seven-cube-cross';cross.rotation.set(.32,.55,.1);displayLayer.add(cross);this.terminals.push({cross,materials:this.terminalMaterials,position:position.clone(),delay:0,wake:0});
    const cubeGeometry=new THREE.BoxGeometry(.145,.145,.145),cubeMaterial=material(0xe1faff,.3,0x23566a);
    this.terminalMaterials.push(cubeMaterial);for(const mat of this.terminalMaterials)mat.emissiveIntensity=.06;
    for(const p of [[0,0,0],[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]]){const cube=new THREE.Mesh(cubeGeometry,cubeMaterial);cube.position.set(p[0]!*.15,p[1]!*.15,p[2]!*.15);cross.add(cube);}
    // Small vector lettering: no font request or texture allocation.
    const glyphs:Record<string,number[][]>={A:[[0,0,1,4],[1,4,2,0],[.5,2,1.5,2]],N:[[0,0,0,4],[0,4,2,0],[2,0,2,4]],S:[[2,4,0,4],[0,4,0,2],[0,2,2,2],[2,2,2,0],[2,0,0,0]],W:[[0,4,.5,0],[.5,0,1,2],[1,2,1.5,0],[1.5,0,2,4]],E:[[2,4,0,4],[0,4,0,0],[0,2,1.5,2],[0,0,2,0]],R:[[0,0,0,4],[0,4,2,4],[2,4,2,2],[2,2,0,2],[0,2,2,0]]};
    const points:THREE.Vector3[]=[];
    [...'ANSWER'].forEach((letter,i)=>glyphs[letter]!.forEach(([x,y,u,v])=>{points.push(new THREE.Vector3((i*3+x!-8.5)*.027,-.33+y!*.027,-.074),new THREE.Vector3((i*3+u!-8.5)*.027,-.33+v!*.027,-.074));}));
    monitor.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:0x8eeeff})));
    // Monitor faces -Z, so lettering's local X must run right-to-left in world space.
    const lettering=monitor.children[monitor.children.length-1]!;lettering.scale.x=-1;
  }

  private bounds(rooms: readonly Vec3Tuple[]): { min: Vec3Tuple; max: Vec3Tuple } {
    const xs = rooms.map((room) => room[0]); const ys = rooms.map((room) => room[1]); const zs = rooms.map((room) => room[2]);
    return { min: [Math.min(...xs), Math.min(...ys), Math.min(...zs)], max: [Math.max(...xs), Math.max(...ys), Math.max(...zs)] };
  }
}

const t = (value: number): number => value;
