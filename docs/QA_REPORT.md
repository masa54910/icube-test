# QAレポート

## ローカル検証

| 項目 | 結果 | 証跡 |
|---|---|---|
| TypeScript 型チェック | PASS | `npm run check` 内の `tsc --noEmit` |
| ステージ/状態ユニットテスト | PASS | 9 tests passed |
| Vite 本番ビルド | PASS | `dist/index.html` と `dist/assets/game-*.js` を生成 |
| 初期画面 | PASS | タイトル、PLAY、STAGE SELECT、HOW TO PLAY、進捗表示 |
| 画面遷移 | PASS | HOW TO PLAY → BACK、STAGE SELECT → STAGE 1-1 |
| 3D探索画面 | PASS | WebGLキャンバス、部屋、回答パッド、HUD、タイマーを確認 |
| Roblox参照ページ | PASS（ログイン後） | プレイクリックでRobloxダウンロードダイアログまで確認 |
| `index.html` 直接表示 | 想定どおり案内表示 | `file://` のESモジュール制限を検知し、`serve.cmd` の起動案内を表示 |

## 未完了の外部ゲート

- Robloxクライアントの実起動、StudioのPlay Solo、サーバー接続はOS側クライアント導入が必要なため、この環境では実施していません。
- YouTube Playablesの審査ポータル、公式認証スイート、Android/iOS実機、低速回線・メモリプロファイルは外部環境で実施してください。
- WebGLコンテキストや端末固有の入力差異は、対象端末での実機確認が必要です。

## 実行ログ（日本語）

2026-09-11: Robloxページはログイン済み。プレイボタン押下後、「Robloxをダウンロードして何百万本もあるバーチャル空間をプレイしよう！」ダイアログを確認。Web版はローカルViteで起動し、タイトル、遊び方、ステージ選択、1-1探索画面をブラウザで確認。
