import { describe, expect, it } from 'vitest';
import { aggregateCubeTestFunnel } from '../src/lib/admin/funnel';

const event = (event_name: string, anonymous_player_id: string, payload: Record<string, unknown> = {}) => ({ event_name, anonymous_player_id, payload });

describe('CUBE TEST funnel aggregation', () => {
  it('deduplicates repeated question completions by player', () => {
    const result = aggregateCubeTestFunnel([
      event('cube_test_start', 'a'), event('cube_test_start', 'a'), event('cube_test_start', 'b'),
      event('cube_test_question_complete', 'a', { questionNumber: 1 }),
      event('cube_test_question_complete', 'a', { questionNumber: 1 }),
      event('cube_test_question_complete', 'b', { questionNumber: 1 }),
    ]);
    expect(result.starts).toBe(2);
    expect(result.questionFunnel[0]?.completes).toBe(2);
  });

  it('uses stage_complete stageId as a legacy question fallback', () => {
    const result = aggregateCubeTestFunnel([
      event('cube_test_start', 'a'),
      event('stage_complete', 'a', { stageId: 'test-set-a-q1@run-1' }),
      event('stage_complete', 'a', { stageId: 'test-set-a-q2@run-1' }),
      event('stage_complete', 'a', { stageId: 'test-set-a-q2@run-2' }),
      event('cube_test_complete', 'a'),
    ]);
    expect(result.questionFunnel.map(item => item.completes)).toEqual([1, 1, 0, 0, 0]);
    expect(result.completes).toBe(1);
  });

  it('supports zero-based questionIndex and keeps each stage monotonic per player', () => {
    const result = aggregateCubeTestFunnel([
      event('cube_test_start', 'a'), event('cube_test_start', 'b'),
      ...[0, 1, 2, 3, 4].map(questionIndex => event('cube_test_question_complete', 'a', { questionIndex })),
      event('cube_test_question_complete', 'b', { stageId: 'test-set-a-q1@run' }),
    ]);
    expect(result.questionFunnel.map(item => item.completes)).toEqual([2, 1, 1, 1, 1]);
  });
});
