import type {PlayerController} from '../src/game/PlayerController';
/** Explicit Jump command for tests that traverse a complete ladder and dismount. */
export const atLadderTop=(p:PlayerController)=>!!p.ladder&&p.position.y>=p.ladder.to[1]*6-2.941;
