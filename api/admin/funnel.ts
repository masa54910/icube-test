type FunnelPayload = Record<string, unknown>;
export type FunnelEvent = { event_name: string; anonymous_player_id: string; payload: FunnelPayload };

const asQuestionNumber = (payload: FunnelPayload): number | null => {
  const numbered = payload.questionNumber;
  const numberedValue = Number(numbered);
  if (Number.isInteger(numberedValue) && numberedValue >= 1 && numberedValue <= 5) return numberedValue;
  const indexed = payload.questionIndex;
  const indexedValue = Number(indexed);
  if (Number.isInteger(indexedValue) && indexedValue >= 0 && indexedValue <= 4) return indexedValue + 1;
  if (Number.isInteger(indexedValue) && indexedValue >= 1 && indexedValue <= 5) return indexedValue;
  const question = String(payload.question ?? '');
  const questionMatch = question.match(/^(?:q(?:uestion)?[-_ ]?)?([1-5])$/i);
  if (questionMatch) return Number(questionMatch[1]);
  const stageId = String(payload.stageId ?? '');
  const stageMatch = stageId.match(/(?:^|[-_])q([1-5])(?:@|$|[-_])/i);
  return stageMatch ? Number(stageMatch[1]) : null;
};

const uniquePlayers = (events: FunnelEvent[]) => new Set(events.map(event => event.anonymous_player_id).filter(Boolean));

/** Counts reached TEST stages by anonymous player, with legacy stage_complete fallback. */
export function aggregateCubeTestFunnel(events: readonly FunnelEvent[]) {
  const starts = uniquePlayers(events.filter(event => event.event_name === 'cube_test_start'));
  const completes = uniquePlayers(events.filter(event => event.event_name === 'cube_test_complete'));
  const questionEvents = events.filter(event => event.event_name === 'cube_test_question_complete');
  const legacyQuestionEvents = events.filter(event => event.event_name === 'stage_complete' && /^test-set-[^-]+-q[1-5](?:@|$)/i.test(String(event.payload.stageId ?? '')));
  const questionFunnel = [1, 2, 3, 4, 5].map(question => {
    const reached = uniquePlayers([...questionEvents, ...legacyQuestionEvents].filter(event => asQuestionNumber(event.payload) === question));
    return { question, completes: reached.size };
  });
  return { starts: starts.size, completes: completes.size, questionFunnel };
}
