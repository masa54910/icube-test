import type {StageDefinition,StageMemoConfig} from '../types';
import {memoCoordinates} from '../game/CubeMemo';
/** Rooms are integer voxel indices, not rendered world positions. Translation only; no rotation/mirroring. */
export function extractMemoConfig(stage:Pick<StageDefinition,'id'|'rooms'|'start'>):StageMemoConfig {
 const canonicalCubes=memoCoordinates(stage.rooms,stage.start);
 if(!canonicalCubes.length||canonicalCubes.some(p=>p.some(v=>!Number.isInteger(v)))||new Set(canonicalCubes.map(p=>p.join(','))).size!==stage.rooms.length||!canonicalCubes.some(p=>p.every(v=>v===0)))throw Error('Invalid memo geometry/origin: '+stage.id);
 return {enabled:true,origin:stage.start,canonicalCubes,hintLimit:1};
}
