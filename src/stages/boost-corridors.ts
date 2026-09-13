import type {StageDefinition, Vec3Tuple} from '../types';

/** Minimum number of same-floor, face-connected voxels in a horizontal run. */
export const MIN_BOOST_CORRIDOR_LENGTH = 6;
type Pad = {position: Vec3Tuple; direction: Vec3Tuple; distance: number};

const key = (p: Vec3Tuple) => p.join(',');
const near = (a: Vec3Tuple, b: Vec3Tuple, radius = 1) => Math.hypot(a[0]-b[0], a[1]-b[1], a[2]-b[2]) <= radius;

/** Finds horizontal voxel runs and derives safe forward/reverse pads without changing canonical rooms. */
export function detectBoostCorridors(stage: StageDefinition): readonly {axis:'x'|'z'; length:number; positions:readonly Vec3Tuple[]}[] {
  const rooms = stage.rooms;
  const occupied = new Set(rooms.map(key));
  const runs: {axis:'x'|'z'; length:number; positions:Vec3Tuple[]}[] = [];
  for (const p of rooms) {
    for (const axis of ['x','z'] as const) {
      const dir:Vec3Tuple = axis==='x'?[1,0,0]:[0,0,1];
      const prev:Vec3Tuple = [p[0]-dir[0],p[1],p[2]-dir[2]];
      if (occupied.has(key(prev))) continue; // only emit each run from its first voxel
      const positions:Vec3Tuple[] = [];
      let cursor:Vec3Tuple = p;
      while (occupied.has(key(cursor))) { positions.push(cursor); cursor=[cursor[0]+dir[0],cursor[1],cursor[2]+dir[2]]; }
      if (positions.length >= MIN_BOOST_CORRIDOR_LENGTH) runs.push({axis,length:positions.length,positions});
    }
  }
  return runs;
}

export function deriveBoostPads(stage: StageDefinition): {pads:readonly Pad[]; corridors:readonly {axis:'x'|'z';length:number;positions:readonly Vec3Tuple[]}[]} {
  const corridors = detectBoostCorridors(stage);
  const existing = [...(stage.boostPads??[])];
  const occupied = new Set(existing.map(p=>`${key(p.position)}|${p.direction.join(',')}`));
  const blocked = [...(stage.answerPoints??[]), stage.start, ...(stage.ladders??[]).flatMap(l=>[l.from,l.to])];
  const pads = [...existing];
  for (const run of corridors) {
    const first = run.positions[1]!, last = run.positions[run.positions.length-2]!;
    const distance = Math.min(4, Math.max(1, run.length-2));
    const candidates:Pad[] = [
      {position:first,direction:run.axis==='x'?[1,0,0]:[0,0,1],distance},
      {position:last,direction:run.axis==='x'?[-1,0,0]:[0,0,-1],distance},
    ];
    for (const candidate of candidates) {
      if (blocked.some(p=>near(p,candidate.position,.9))) continue;
      const id=`${key(candidate.position)}|${candidate.direction.join(',')}`;
      if (!occupied.has(id)) {occupied.add(id);pads.push(candidate);}
    }
  }
  return {pads,corridors};
}

export function stageWithAutoBoostPads(stage: StageDefinition): StageDefinition {
  const {pads}=deriveBoostPads(stage);
  return pads.length===stage.boostPads?.length ? stage : {...stage,boostPads:pads};
}
