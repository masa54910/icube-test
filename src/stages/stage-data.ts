import type { LadderDefinition, StageDefinition, Vec3Tuple } from '../types';
import {extractMemoConfig} from './memo-config';

const fromRows = (rows: readonly string[]): readonly Vec3Tuple[] => {
  const result: Vec3Tuple[] = [];
  rows.forEach((row, rowIndex) => [...row].forEach((cell, column) => {
    if (cell === '#') result.push([column - 2, 4 - rowIndex, 0]);
  }));
  return result;
};

export const LETTER_SHAPES: Readonly<Record<string, readonly Vec3Tuple[]>> = {
  C: fromRows(['#####', '#....', '#....', '#....', '#####']),
  E: fromRows(['#####', '#....', '#####', '#....', '#####']),
  F: fromRows(['#####', '#....', '#####', '#....', '#....']),
  H: fromRows(['#...#', '#...#', '#####', '#...#', '#...#']),
  I: fromRows(['#####', '..#..', '..#..', '..#..', '#####']),
  L: fromRows(['##...', '#....', '##...', '##...', '#####']),
  O: fromRows(['#####', '#...#', '#...#', '#...#', '#####']),
  P: fromRows(['#####', '#...#', '#####', '#....', '#....']),
  T: fromRows(['#####', '..##.', '..##.', '..##.', '..##.']),
  U: fromRows(['#...#', '#...#', '#...#', '#...#', '#####']),
};

const SEGMENTS: Readonly<Record<string, readonly Vec3Tuple[]>> = {
  A: [[-1, 3, 0], [0, 3, 0], [1, 3, 0]], B: [[1, 2, 0], [1, 3, 0]],
  C: [[1, 0, 0], [1, 1, 0]], D: [[-1, -1, 0], [0, -1, 0], [1, -1, 0]],
  E: [[-1, 0, 0], [-1, 1, 0]], F: [[-1, 2, 0], [-1, 3, 0]],
  G: [[-1, 1, 0], [0, 1, 0], [1, 1, 0]],
};
const DIGIT_SEGMENTS: readonly (readonly string[])[] = [
  ['A', 'B', 'C', 'D', 'E', 'F'], ['B', 'C'], ['A', 'B', 'G', 'E', 'D'],
  ['A', 'B', 'C', 'D', 'G'], ['F', 'G', 'B', 'C'], ['A', 'F', 'G', 'C', 'D'],
  ['A', 'F', 'E', 'D', 'C', 'G'], ['A', 'B', 'C'], ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
  ['A', 'B', 'C', 'D', 'F', 'G'],
];
const unique = (voxels: readonly Vec3Tuple[]): readonly Vec3Tuple[] => {
  const seen = new Set<string>();
  return voxels.filter((voxel) => { const key = voxel.join(':'); if (seen.has(key)) return false; seen.add(key); return true; });
};
export const DIGIT_SHAPES: readonly (readonly Vec3Tuple[])[] = DIGIT_SEGMENTS.map((names) => unique(names.flatMap((name) => SEGMENTS[name] ?? [])));

const buildLadders = (rooms: readonly Vec3Tuple[], prefix: string): readonly LadderDefinition[] => {
  const columns = new Map<string, number[]>();
  rooms.forEach(([x, y, z]) => { const key = `${x}:${z}`; const ys = columns.get(key) ?? []; ys.push(y); columns.set(key, ys); });
  const ladders: LadderDefinition[] = [];
  [...columns.entries()].forEach(([key, values]) => {
    const [xText, zText] = key.split(':'); const x = Number(xText); const z = Number(zText);
    const ys = [...values].sort((a, b) => a - b); let start = ys[0]; let previous = ys[0];
    for (let index = 1; index <= ys.length; index += 1) {
      const current = ys[index];
      if (current !== previous! + 1) {
        if (start !== undefined && previous !== undefined && previous > start) ladders.push({ id: `${prefix}-${x}-${z}-${start}-${previous}`, from: [x, start, z], to: [x, previous, z] });
        start = current;
      }
      previous = current;
    }
  });
  return ladders.sort((a, b) => a.id.localeCompare(b.id));
};
const bestStart = (rooms: readonly Vec3Tuple[]): Vec3Tuple => rooms.reduce<Vec3Tuple>((best, room) => {
  if (Math.abs(room[0]) < Math.abs(best[0])) return room;
  if (Math.abs(room[0]) === Math.abs(best[0]) && room[1] < best[1]) return room;
  return best;
}, rooms[0] ?? [0, 0, 0]);

const letters = Object.keys(LETTER_SHAPES);
const stage1: StageDefinition[] = letters.map((letter, index) => {
  const rooms = LETTER_SHAPES[letter] ?? [];
  return { id: `stage_1_${index + 1}`, numericId: index + 1, group: 1, level: index + 1, displayName: `1-${index + 1}`, subtitle: 'ALPHABET TEST', difficulty: 2, rooms, start: bestStart(rooms), ladders: buildLadders(rooms, 'AlphabetLadder'), choiceFamily: 'letters' };
});
const stage2: StageDefinition[] = DIGIT_SHAPES.map((rooms, digit) => ({
  id: `stage_2_${digit + 1}`, numericId: digit + 11, group: 2 as const, level: digit + 1, displayName: `2-${digit + 1}`, subtitle: 'DIGIT TEST', difficulty: 3, rooms, start: bestStart(rooms), ladders: buildLadders(rooms, 'DigitLadder'), choiceFamily: 'digits' as const,
}));
const shapeStage = (level: number, difficulty: number, rooms: readonly Vec3Tuple[], start: Vec3Tuple, ladders: readonly LadderDefinition[]): StageDefinition => ({ id: `stage_3_${level}`, numericId: level + 20, group: 3, level, displayName: `3-${level}`, subtitle: 'SHAPE TEST', difficulty, rooms, start, ladders });

const stage3: StageDefinition[] = [
  shapeStage(1,1,[[-2,-2,0],[-2,-1,0],[-2,0,0],[-2,1,0],[-2,2,0],[-1,0,0],[0,0,0],[1,0,0],[2,-2,0],[2,-1,0],[2,0,0],[2,1,0]],[0,0,0],[{id:'LeftTowerLadder',from:[-2,-2,0],to:[-2,2,0]},{id:'RightTowerLadder',from:[2,-2,0],to:[2,1,0]}]),
  shapeStage(2,1,[[0,-2,0],[0,-1,0],[0,0,0],[0,1,0],[0,2,0],[-2,2,0],[-1,2,0],[1,2,0]],[0,0,0],[{id:'CenterLadder',from:[0,-2,0],to:[0,2,0]}]),
  shapeStage(3,1,[[-2,-2,0],[-2,-1,0],[-2,0,0],[-2,1,0],[-2,2,0],[-1,-2,0],[0,-2,0],[1,-2,0],[2,-2,0],[2,-1,0]],[0,-2,0],[{id:'LeftLadder',from:[-2,-2,0],to:[-2,2,0]},{id:'HookLadder',from:[2,-2,0],to:[2,-1,0]}]),
  shapeStage(4,2,[[-2,-2,0],[-2,-1,0],[-2,0,0],[-2,1,0],[-2,2,0],[1,-2,0],[1,-1,0],[1,0,0],[1,1,0],[1,2,0],[-1,-1,0],[0,-1,0]],[0,-1,0],[{id:'LeftLadder',from:[-2,-2,0],to:[-2,2,0]},{id:'RightLadder',from:[1,-2,0],to:[1,2,0]}]),
  shapeStage(5,2,[[-2,-2,0],[-2,-1,0],[-2,0,0],[-2,1,0],[-2,2,0],[-1,2,0],[0,2,0],[1,2,0],[-1,0,0],[0,0,0],[-1,-2,0],[0,-2,0],[1,-2,0]],[0,0,0],[{id:'SpineLadder',from:[-2,-2,0],to:[-2,2,0]}]),
  shapeStage(6,2,[[-2,2,0],[-1,2,0],[0,2,0],[1,2,0],[-2,1,0],[-2,0,0],[-1,0,0],[0,0,0],[1,0,0],[1,-1,0],[1,-2,0],[0,-2,0],[-1,-2,0],[1,-2,1]],[0,0,0],[{id:'LeftLadder',from:[-2,0,0],to:[-2,2,0]},{id:'RightLadder',from:[1,-2,0],to:[1,0,0]}]),
  shapeStage(7,3,[[-2,-2,0],[-2,-1,0],[-2,0,0],[-2,1,0],[-2,2,0],[2,-2,0],[2,-1,0],[2,0,0],[2,1,0],[-1,0,0],[0,0,0],[1,0,0],[-1,2,0],[0,2,0],[1,2,0]],[0,0,0],[{id:'LeftLadder',from:[-2,-2,0],to:[-2,2,0]},{id:'RightLadder',from:[2,-2,0],to:[2,1,0]}]),
  shapeStage(8,3,[[-2,2,0],[-1,2,0],[0,2,0],[1,2,0],[2,2,0],[2,1,0],[2,0,0],[2,-1,0],[1,0,0],[0,0,0],[-1,0,0],[-2,-1,0],[-2,-2,0],[-1,-2,0],[0,-2,0],[1,-2,0],[2,-2,0],[2,-2,1]],[0,0,0],[{id:'RightLadder',from:[2,-2,0],to:[2,2,0]},{id:'LeftLadder',from:[-2,-2,0],to:[-2,-1,0]}]),
  shapeStage(9,4,[[-2,-2,0],[-2,-1,0],[-2,0,0],[-2,1,0],[-2,2,0],[-1,2,0],[0,2,0],[1,2,0],[1,2,1],[-1,0,0],[0,0,0]],[0,0,0],[{id:'SpineLadder',from:[-2,-2,0],to:[-2,2,0]}]),
  shapeStage(10,5,[[-2,-2,0],[-2,-1,0],[-2,0,0],[-2,1,0],[-2,2,0],[-1,2,0],[0,2,0],[1,2,0],[1,1,0],[1,0,0],[1,-1,0],[1,-2,0],[-1,-2,0],[0,-2,0],[0,0,0],[-1,0,0],[0,0,1],[-1,0,1],[1,0,1]],[0,0,0],[{id:'LeftLadder',from:[-2,-2,0],to:[-2,2,0]},{id:'RightLadder',from:[1,-2,0],to:[1,2,0]}]),
  shapeStage(11,3,[[-2,0,0],[-2,1,0],[-2,2,0],[-1,1,0],[0,1,0],[1,1,0],[2,0,0],[2,1,0],[2,2,0],[2,3,0],[0,1,1],[1,1,1]],[0,1,0],[{id:'LeftTowerLadder',from:[-2,0,0],to:[-2,2,0]},{id:'RightTowerLadder',from:[2,0,0],to:[2,3,0]}]),
];

export const STAGES: readonly StageDefinition[] = [...stage1, ...stage2, ...stage3].map(stage=>({...stage,memo:extractMemoConfig(stage)}));
export const getStage = (numericId: number): StageDefinition => STAGES.find((stage) => stage.numericId === numericId) ?? STAGES[0]!;
