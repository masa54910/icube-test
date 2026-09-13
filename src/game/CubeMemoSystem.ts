import type {StageDefinition} from '../types';
import {CubeMemoStore} from './CubeMemo';
/** Stage-keyed session data only. Never holds meshes, renderers or DOM listeners. */
export class CubeMemoSystem {
 private stores=new Map<string,CubeMemoStore>();
 get(stage:StageDefinition):CubeMemoStore {
  if(!stage.memo?.enabled)throw Error('Memo disabled: '+stage.id);
  let store=this.stores.get(stage.id);
  if(!store){store=new CubeMemoStore(stage.id,stage.memo.canonicalCubes,stage.memo.hintLimit);this.stores.set(stage.id,store);}
  return store;
 }
}
