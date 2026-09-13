# Home Showcase Rotation

Status: READY FOR USER QA

## 実装

- 01 BRAND: 既存 HomePreview / HomeWorld、Cube Cross、Home用キュービーを維持。
- 02 EXPLORE: Stage 1-1 の実際の内部通路と既存 Explorer の小走りポーズ。
- 03 CLIMB: 同ステージの既存梯子・上階開口・登攀ポーズ。
- 04 SOLVE: 既存 Answer Terminal、7 Cube Cross モニター、端末を見る Explorer。
- 05 CORRECT: 既存 CelebrationScene の地球プリセット、Stage 1-1 の完成形、既存の手を振る2Dキュービー。
- 01を初期表示。10秒間隔で順序切替。1.1秒クロスフェードと控えめなシアンのスイープ。
- 5個の44pxボタンで直接選択。選択後に10秒タイマーをリセット。
- 画像は初期Home表示後、650msずつ間を置いて1枚ずつ遅延ロード。失敗した画像は抽選順から除外。全失敗でも01とメニューは利用可能。
- document.hidden / pause中は時計・CSS装飾を停止。非表示時の次回プリロード予約も解除。
- Home離脱時はイベント登録、プリロード予約、進行中の画像ハンドラーを解除。Home復帰は01から。
- 画像表示中は、クロスフェード終了後にHome用WebGLレンダリングを停止。新しい3D Sceneは追加しない。
- Reduced Motionではパンとスイープなし、フェード160ms。モバイルではパンなし。

## 素材

実ゲームのクラスと素材をブラウザで撮影。生成AI、顔の再生成、新しい部屋・梯子・端末は不使用。撮影用の配置・カメラ指定は検証環境内だけで、本編コードには反映していない。

| ファイル | 解像度 | bytes |
|---|---:|---:|
| explore.webp | 1200 × 900 | 16,068 |
| climb.webp | 1200 × 900 | 28,506 |
| solve.webp | 1200 × 900 | 26,894 |
| correct.webp | 1200 × 900 | 39,584 |
| 合計 | | 111,052 |

4:3画像をcontain表示し、キャラクターと形が切れないようにする。余白はネイビー背景で処理。ラベルとインジケーターはDOM。

## 検証

- 実ブラウザ Edge headlessで実時間の自動2周: 0,1,2,3,4,0,1,2,3,4,0。
- 全5ボタンの直接操作、手動後の9秒維持→次の切替を確認。
- 静止画中のHomeレンダラー呼び出し増分0を確認。
- CDPによるページ凍結・復帰、Home→How To Play→Home、Home→本編→Homeを確認。
- Home離脱後のactive=false、イベント登録null、ロード予約null、進行中ロードnullを確認。
- 画像4枚の通信を失敗させても01を維持、左4メニュー利用可能。
- 1920×1080、1366×768、1024×768、390×844、844×390で右側と全インジケーターを確認。
- Reduced Motionの画像animation=noneを確認。
- TypeScript / 114テスト PASS。本番ビルド PASS。ブラウザpageerrorなし。

## パフォーマンス実測

ローカル配信・デスクトップEdge headless、3秒サンプル。端末実機の性能保証ではない。

- 本番Homeインジケーター表示: 804ms。
- 追加画像リクエスト開始: 1166 / 1851 / 2530 / 3214ms（Home表示より後）。
- BRAND中RAF: 56.1fps、p95 17.0ms。
- 静止画中RAF: 60.1fps、p95 17.1ms。
- 切替中RAF: 60.3fps、p95 16.9ms。
- モバイルサイズエミュレーション: 縦60.3fps / 横60.2fps。
- JS gzip: 前Gate160.17KB → 161.58KB。既存500KB chunk警告は継続。
- 旧版との同条件初期ロード比較・実機モバイル・実際のOSタブ切替は未測定。画像非表示時の描画停止とコードのvisibility分岐を検証。

## 変更範囲と既存課題

変更はHome専用Showcaseクラス・CSS・時計・UIControllerへのライフサイクル接続、画像、テスト。HomePreview / HomeWorld、PlayerController、Camera、Stage、Quiz、CorrectScene/randomizer、Save、SDK、Robloxは未変更。

モバイル390pxでは既存の左UIのタイトルと言語セレクターに重なりがある。今回の変更対象外という指定に従い未修正。右側Showcaseの画像・操作対象には重なりなし。

実測データ: `home-showcase-qa/results.json`、`home-showcase-qa/production.json`。
最終画像: `home-showcase-qa/desktop-final-correct.png`、`home-showcase-qa/final-390.png`、`home-showcase-qa/final-844.png`。
