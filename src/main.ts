import './styles.css';
import { Game } from './game/Game';

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
const root = document.querySelector<HTMLElement>('#ui-root');
const loading = document.querySelector<HTMLElement>('#loading');

if (!canvas || !root || !loading) throw new Error('必要なゲーム要素が見つかりません。');

const game = new Game(canvas, root, loading);
if(import.meta.env.DEV&&new URLSearchParams(location.search).has('audioDebug'))void import('./audio/AudioDiagnostics').then(m=>m.attachAudioDiagnostics(game.audio));
if(import.meta.env.DEV) Object.defineProperty(window,'icubeQA',{value:()=>game.snapshot()});
void game.init().catch((error: unknown) => {
  console.error('ゲーム初期化エラー', error);
  loading.textContent = '読み込みに失敗しました。ページを再読み込みしてください。';
  loading.classList.remove('hidden');
});
