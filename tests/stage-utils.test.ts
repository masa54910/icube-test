import { describe, expect, it } from 'vitest';
import { STAGES } from '../src/stages/stage-data';
import { buildChoices, isConnected, normalizeVoxels, shapeKey } from '../src/stages/stage-utils';
import { GameState, StateMachine } from '../src/game/GameState';

describe('i CUBE TEST stage data', () => {
  it('contains the complete 31-stage catalog', () => {
    expect(STAGES).toHaveLength(31);
    expect(STAGES.at(0)?.id).toBe('stage_1_1');
    expect(STAGES.at(-1)?.id).toBe('stage_3_11');
  });

  it.each([0, 9, 10, 19, 20, 30])('builds ten deterministic choices for stage index %i', (index) => {
    const stage = STAGES[index]!;
    const choices = buildChoices(stage);
    expect(choices).toHaveLength(10);
    expect(choices.filter((choice) => choice.correct)).toHaveLength(1);
    expect(new Set(choices.map((choice) => shapeKey(choice.voxels))).size).toBe(10);
    choices.forEach((choice) => expect(isConnected(choice.voxels)).toBe(true));
  });

  it('normalizes voxel coordinates without changing topology', () => {
    expect(normalizeVoxels([[4, 2, -1], [5, 2, -1]])).toEqual([[0, 0, 0], [1, 0, 0]]);
  });
});

describe('state machine', () => {
  it('allows the exploration to quiz to reveal path', () => {
    const machine = new StateMachine();
    machine.transition(GameState.Loading); machine.transition(GameState.Title); machine.transition(GameState.Exploration); machine.transition(GameState.Quiz); machine.transition(GameState.AnswerResult); machine.transition(GameState.Reveal); machine.transition(GameState.StageResult);
    expect(machine.state).toBe(GameState.StageResult);
  });
});
