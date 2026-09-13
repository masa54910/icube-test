import type { Locale } from '../types';
import {detectLanguage} from '../i18n/detectLanguage';

export interface SaveData {
  version: 1;
  completed: string[];
  bestTimesMs: Record<string, number>;
  bestAttempts: Record<string, number>;
  lastPlayed: string;
  memoRunId?:string;
}

const DEFAULT_SAVE: SaveData = { version: 1, completed: [], bestTimesMs: {}, bestAttempts: {}, lastPlayed: 'stage_1_1' };

const sdk = (): YtGameApi | undefined => typeof ytgame !== 'undefined' ? ytgame : undefined;
const inPlayables = (): boolean => Boolean(sdk()?.IN_PLAYABLES_ENV && sdk());

export class PlayablesSDK {
  #loaded = false;
  #paused = false;
  #audioEnabled = true;
  #locale: Locale = 'en';
  #save: SaveData = structuredClone(DEFAULT_SAVE);
  #unsubscribe: Array<() => void> = [];

  get paused(): boolean { return this.#paused; }
  get audioEnabled(): boolean { return this.#audioEnabled; }
  get locale(): Locale { return this.#locale; }
  get save(): SaveData { return this.#save; }

  async initialize(onPause: () => void, onResume: () => void, onAudio: (enabled: boolean) => void): Promise<void> {
    const api = sdk();
    if (api) {
      // The SDK's local/no-op audio subscription can emit false even though
      // isAudioEnabled() returns true. Only a real Playables host owns mute.
      if (inPlayables()) {
        this.#audioEnabled = api.system.isAudioEnabled();
        this.#unsubscribe.push(api.system.onAudioEnabledChange((enabled) => { this.#audioEnabled = enabled; onAudio(enabled); }));
      }
      this.#unsubscribe.push(api.system.onPause(() => { this.#paused = true; onPause(); }));
      this.#unsubscribe.push(api.system.onResume(() => { this.#paused = false; onResume(); }));
      try { this.#locale = detectLanguage([(await api.system.getLanguage())]); } catch { /* local/no-op SDK */ }
    } else {
      this.#locale = detectLanguage(navigator.languages);
    }
    let serialized = '';
    if (inPlayables()) {
      try { serialized = await api!.game.loadData(); } catch { serialized = ''; }
    } else {
      serialized = localStorage.getItem('icube-test-save') ?? '';
    }
    if (serialized) {
      try {
        const parsed = JSON.parse(serialized) as Partial<SaveData>;
        this.#save = { ...structuredClone(DEFAULT_SAVE), ...parsed, version: 1, completed: Array.isArray(parsed.completed) ? parsed.completed : [] };
      } catch { this.#save = structuredClone(DEFAULT_SAVE); }
    }
    this.#loaded = true;
  }

  markFirstFrame(): void { sdk()?.game.firstFrameReady(); }
  markReady(): void { sdk()?.game.gameReady(); }

  async persist(): Promise<void> {
    if (!this.#loaded) return;
    const data = JSON.stringify(this.#save);
    if (inPlayables()) { try { await sdk()!.game.saveData(data); } catch { sdk()?.health?.logWarning(); } }
    else localStorage.setItem('icube-test-save', data);
  }

  async completeStage(id: string, elapsedMs: number, attempts: number): Promise<void> {
    if (!this.#save.completed.includes(id)) this.#save.completed.push(id);
    if (this.#save.bestTimesMs[id] === undefined || elapsedMs < this.#save.bestTimesMs[id]!) this.#save.bestTimesMs[id] = elapsedMs;
    if (this.#save.bestAttempts[id] === undefined || attempts < this.#save.bestAttempts[id]!) this.#save.bestAttempts[id] = attempts;
    this.#save.lastPlayed = id;
    await this.persist();
    try { await sdk()?.engagement?.sendScore({ value: this.#save.completed.length }); } catch { /* optional API */ }
  }

  setLastPlayed(id: string): void { this.#save.lastPlayed = id; void this.persist(); }
  dispose(): void { this.#unsubscribe.forEach((unsubscribe) => unsubscribe()); this.#unsubscribe = []; }
}
