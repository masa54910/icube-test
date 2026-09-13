import type {StageDefinition} from '../types';
/** New games use fresh storage keys without deleting previously authored notes. */
export function memoStageForRun(stage:StageDefinition,run:unknown):StageDefinition {
 if(stage.section==='test'||typeof run!=='string'||!run)return stage;
 return {...stage,id:`${stage.id}@memo-${run}`};
}
