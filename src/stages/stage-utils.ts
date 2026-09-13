import {buildRouteChoices} from './route-choices';
import type { ShapeChoice, StageDefinition, Vec3Tuple } from '../types';
import { DIGIT_SHAPES, LETTER_SHAPES } from './stage-data';

export const coordKey = (voxel: Vec3Tuple): string => voxel.join(':');

export function normalizeVoxels(voxels: readonly Vec3Tuple[]): Vec3Tuple[] {
  if (!voxels.length) throw new Error('Shape must contain at least one voxel');
  const seen = new Set<string>();
  voxels.forEach((voxel) => { const key = coordKey(voxel); if (seen.has(key)) throw new Error(`Duplicate voxel: ${key}`); seen.add(key); });
  const minX = Math.min(...voxels.map((voxel) => voxel[0]));
  const minY = Math.min(...voxels.map((voxel) => voxel[1]));
  const minZ = Math.min(...voxels.map((voxel) => voxel[2]));
  return voxels.map(([x, y, z]) => [x - minX, y - minY, z - minZ] as const).sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
}

export const shapeKey = (voxels: readonly Vec3Tuple[]): string => normalizeVoxels(voxels).map(coordKey).join('|');

const directions: readonly Vec3Tuple[] = [[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]];
const add = (a: Vec3Tuple, b: Vec3Tuple): Vec3Tuple => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

export function isConnected(voxels: readonly Vec3Tuple[]): boolean {
  if (!voxels.length) return false;
  const lookup = new Map(voxels.map((voxel) => [coordKey(voxel), voxel]));
  const queue = [voxels[0]!]; const visited = new Set([coordKey(voxels[0]!)]);
  while (queue.length) {
    const current = queue.shift()!;
    directions.forEach((direction) => { const neighbor = add(current, direction); const key = coordKey(neighbor); if (lookup.has(key) && !visited.has(key)) { visited.add(key); queue.push(lookup.get(key)!); } });
  }
  return visited.size === voxels.length;
}

const seeded = (seed: number): (() => number) => {
  let value = seed >>> 0;
  return () => { value = (value * 1664525 + 1013904223) >>> 0; return value / 4294967296; };
};

export function shuffle<T>(items: readonly T[], seed: number): T[] {
  const random = seeded(seed); const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) { const j = Math.floor(random() * (i + 1)); [copy[i], copy[j]] = [copy[j]!, copy[i]!]; }
  return copy;
}

function decoys(correct: readonly Vec3Tuple[], seed: number): Vec3Tuple[][] {
  const source = normalizeVoxels(correct); const result: Vec3Tuple[][] = []; const seen = new Set([shapeKey(source)]);
  const candidates: Vec3Tuple[][] = [];
  source.forEach((_voxel, index) => candidates.push(source.filter((_, candidateIndex) => candidateIndex !== index)));
  source.forEach((voxel) => directions.forEach((direction) => {
    const candidate = [...source, add(voxel, direction)];
    candidates.push(candidate);
  }));
  const random = seeded(seed);
  for (let pass = 0; pass < 4 && result.length < 9; pass += 1) {
    for (const candidate of shuffle(candidates, Math.floor(random() * 0xffffffff))) {
      if (candidate.length < Math.max(2, source.length - 2) || candidate.length > source.length + 2 || !isConnected(candidate)) continue;
      const normalized = normalizeVoxels(candidate); const key = shapeKey(normalized);
      if (seen.has(key)) continue;
      seen.add(key); result.push(normalized);
      if (result.length === 9) break;
    }
  }
  if (result.length < 9) {
    let offset = 1;
    while (result.length < 9) {
      const candidate = normalizeVoxels([...source, [source[0]![0] + offset, source[0]![1], source[0]![2]]]);
      const key = shapeKey(candidate); if (!seen.has(key) && isConnected(candidate)) { seen.add(key); result.push(candidate); }
      offset += 1;
    }
  }
  return result;
}

export function buildChoices(stage: StageDefinition, seed = stage.numericId): ShapeChoice[] {
  if(stage.stageType==='route')return buildRouteChoices(stage);
  let shapes: readonly (readonly Vec3Tuple[])[];
  let ids: readonly string[];
  if (stage.choiceFamily === 'letters') {
    const letters = ['C','E','F','H','I','L','O','P','T','U'];
    shapes = letters.map((letter) => LETTER_SHAPES[letter] ?? []);
    ids = letters.map((letter) => `letter-${letter}`);
  } else if (stage.choiceFamily === 'digits') {
    ids = Array.from({ length: 10 }, (_, index) => `digit-${index}`);
    shapes = DIGIT_SHAPES;
  } else {
    ids = ['correct', ...Array.from({ length: 9 }, (_, index) => `decoy-${index + 1}`)];
    shapes = [stage.rooms, ...decoys(stage.rooms, seed)];
  }
  const correctId = stage.choiceFamily === 'letters' ? `letter-${lettersForStage(stage)}` : stage.choiceFamily === 'digits' ? `digit-${stage.level - 1}` : 'correct';
  return shapes.map((voxels, index) => ({ id: ids[index]!, voxels: normalizeVoxels(voxels), correct: ids[index] === correctId }));
}

function lettersForStage(stage: StageDefinition): string {
  return ['C','E','F','H','I','L','O','P','T','U'][stage.level - 1] ?? 'C';
}

export function makeDecoyChoices(correct: readonly Vec3Tuple[], seed: number): ShapeChoice[] {
  return [{ id: 'correct', voxels: normalizeVoxels(correct), correct: true }, ...decoys(correct, seed).map((voxels, index) => ({ id: `decoy-${index + 1}`, voxels, correct: false }))];
}
