import {STAGES} from './stage-data';
import {ADVANCED_STAGES} from './advanced-route';
import {PURE_ROUTE_STAGES} from './pure-route';
import {TEST_STAGES} from '../test-mode/test-stages';
export const PROTOTYPE_ARCHIVE=ADVANCED_STAGES;
export const ALL_STAGES=[...STAGES,...PURE_ROUTE_STAGES];
export const catalogStage=(id:number)=>ALL_STAGES.find(s=>s.numericId===id)??TEST_STAGES.find(s=>s.numericId===id)??PROTOTYPE_ARCHIVE.find(s=>s.numericId===id)??STAGES[0]!;
