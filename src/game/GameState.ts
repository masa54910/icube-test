export enum GameState {
  Boot = 'BOOT', Loading = 'LOADING', Title = 'TITLE', StageSelect = 'STAGE_SELECT',
  Exploration = 'EXPLORATION', MemoConfirm='MEMO_CONFIRM', Quiz = 'QUIZ', AnswerResult = 'ANSWER_RESULT', Reveal = 'REVEAL',
  StageResult = 'STAGE_RESULT', Complete = 'COMPLETE',
}

const transitions: Record<GameState, readonly GameState[]> = {
  [GameState.Boot]: [GameState.Loading],
  [GameState.Loading]: [GameState.Title],
  [GameState.Title]: [GameState.StageSelect, GameState.Exploration],
  [GameState.StageSelect]: [GameState.Title, GameState.Exploration],
  [GameState.Exploration]: [GameState.Title, GameState.StageSelect, GameState.Quiz,GameState.MemoConfirm],
  [GameState.MemoConfirm]: [GameState.Exploration,GameState.AnswerResult],
  [GameState.Quiz]: [GameState.Exploration, GameState.AnswerResult],
  [GameState.AnswerResult]: [GameState.Quiz, GameState.Exploration, GameState.Reveal, GameState.StageSelect, GameState.Title],
  [GameState.Reveal]: [GameState.StageResult],
  [GameState.StageResult]: [GameState.Exploration, GameState.StageSelect, GameState.Complete, GameState.Title],
  [GameState.Complete]: [GameState.StageSelect, GameState.Exploration, GameState.Title],
};

export class StateMachine {
  #state = GameState.Boot;
  get state(): GameState { return this.#state; }
  transition(next: GameState): void {
    if (!transitions[this.#state].includes(next)) throw new Error(`Invalid state transition: ${this.#state} -> ${next}`);
    this.#state = next;
  }
}
