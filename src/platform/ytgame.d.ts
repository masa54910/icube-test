interface YtGameApi {
  readonly IN_PLAYABLES_ENV?: boolean;
  readonly game: {
    firstFrameReady(): void;
    gameReady(): void;
    loadData(): Promise<string>;
    saveData(data: string): Promise<void>;
  };
  readonly engagement?: { sendScore(score: { value: number }): Promise<void> };
  readonly system: {
    getLanguage(): Promise<string>;
    isAudioEnabled(): boolean;
    onAudioEnabledChange(callback: (enabled: boolean) => void): () => void;
    onPause(callback: () => void): () => void;
    onResume(callback: () => void): () => void;
  };
  readonly health?: { logError(): void; logWarning(): void };
}
declare const ytgame: YtGameApi | undefined;

