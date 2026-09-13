# i CUBE TEST — YouTube Playables Edition

最新Gate: Cubie 2D Integration + Jump + Correct Transition — READY FOR USER QA。
正式キュービーは提供画像を再生成せず切り抜いた2D画像、ゲームプレイは顔・髪のない常時Helmet ON Explorerです。`docs/CUBIE_2D_INTEGRATION_QA.md` に検証記録と比較画像があります。以前の3D顔再現方針と未完了Gateの記録は履歴です。

Roblox版の31ステージ構成を参照し、Three.js + TypeScript + Vite で再実装した独立Web版です。Robloxプロジェクトのファイルは変更していません。

## 実行

`index.html` を直接ダブルクリックするのではなく、同じフォルダーの `serve.cmd` をダブルクリックしてください。Viteサーバーが起動し、ブラウザで `http://127.0.0.1:5173/` を開きます。

```bash
npm install
npm run dev
```

本番ビルドは `npm run build`、型チェックとユニットテストは `npm run check` です。

## Roblox Fidelity + Player Controller

Status: READY FOR USER QA

ホームをRoblox版の白い左メニュー＋右側7キューブに更新しました。
NEW GAMEで第三者視点から開始します。Vまたは右上ボタンでPOVと切替できます。
第三者視点ではW／↑で前進、A/D・←/→で連続旋回、S／↓で反対方向へ向き直ってから前進します。W＋左右キーでカーブします。POVではWASD／矢印でカメラ基準の移動です。ドラッグで向きを変更、Q／Rでも左右回転、Spaceでジャンプ、E／Fで回答します。
LOOK UPは押している間だけ上を向き、離すと元の視点に戻ります。
スマホは左側ドラッグで移動、右側ドラッグで見回し、画面ボタンで視点切替・ジャンプができます。

比較画像は `docs/FIDELITY_COMPARISON.html`、検証詳細は `docs/FIDELITY_QA.md` にあります。

## 構成

宇宙服キャラクター・梯子横移動・宇宙の正解演出の更新は `docs/SPACE_UPDATE_QA.md` を参照してください。梯子上では左右キーでつかまったまま横移動し、端で停止します。ジャンプで離脱できます。

最新のキャラクター・操作修正の検証記録は `docs/CHARACTER_MOVEMENT_QA.md` です。

- `src/stages/stage-data.ts` — 31ステージ（文字10・数字10・形状11）
- `src/game/WorldBuilder.ts` — 部屋、梯子、回答ポイント、正解形状の生成
- `src/game/PlayerController.ts` — WASD/矢印、マウス・タッチ、ジャンプ、梯子
- `src/platform/PlayablesSDK.ts` — YouTube Playables SDK の保存・一時停止・音声・準備通知
- `docs/` — Roblox監査、ゲーム仕様、移行表、Playables要件、ライセンス、QA記録

本番公開前には、YouTube Playables の公式認証テスト、Android/iOS実機、メモリ・通信・アクセシビリティ計測が必要です。

## Vercel / Supabase Analytics

このリポジトリはVercelのNew ProjectからそのままImportできます。Framework PresetはVite、Build Commandは`npm run build`、Output Directoryは`dist`です。`api/` 配下はVercel Serverless Functionsとしてデプロイされます。

本番環境変数（Vercel Project Settings → Environment Variables）:

```text
VITE_ANALYTICS_URL=https://xrfrnmocrvgecebpklwt.supabase.co
VITE_ANALYTICS_ANON_KEY=<public anon or publishable key>
SUPABASE_URL=https://xrfrnmocrvgecebpklwt.supabase.co
SUPABASE_ANON_KEY=<public anon or publishable key>
SUPABASE_SERVICE_ROLE_KEY=<server-only secret>
```

`SUPABASE_SERVICE_ROLE_KEY` はServerless API専用です。`VITE_` prefixを付けたり、Gitへコミットしたりしないでください。Admin Dashboardは`/admin/analytics/`、APIは`/api/admin/analytics`です。管理者UUIDはSupabaseの`admin_users` allowlistへ登録します。
