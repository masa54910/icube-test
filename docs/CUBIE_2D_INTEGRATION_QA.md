# Cubie 2D Integration + Jump + Correct Transition

Status: READY FOR USER QA

## Changed

正式2Dキュービーと、ゲーム専用Helmet ON Explorerを分離。Home正式配置・SHARE機能は次Gateとし、今回は共通画像と正解表示に限定。

## Cubie 2D — 元画像の保持

- [透過PNG](../public/assets/cubie/cubie-correct.png)：168×376px、99,389 bytes。
- 提供シートの正面全身を切り抜き、輪郭のアルファマスクのみ作成。AI生成・顔の再描画・服の補正・色調補正・アップスケールなし。
- PNGのRGB値は切り抜き元と全画素一致。変更画素数0。髪先、手、持っているヘルメット、ブーツを含めて確認。
- [並列比較](cubie-2d-qa/cubie-source-comparison.png) / [シート内使用位置](cubie-2d-qa/sheet-and-cutout.png) / [抽出記録](cubie-2d-qa/extraction.json)。
- 元の背景色が混ざった輪郭画素も再着色せず保持しているため、暗い背景では薄い縁が見える箇所があります。

## Jump

CONFIG.jumpに独立設定：verticalSpeed 6.2、forwardSpeed 4.8、gravity 13。

方向入力付き床ジャンプは約4.5ユニット。方向入力なしはその場ジャンプ。離陸時の水平速度を保持し、着地時に解除。梯子ジャンプは身体方向へ移動し、即座に梯子状態を解除。空中で再吸着しません。

AIRBORNEでは脚を一定の軽い膝曲げ姿勢に固定し、LANDINGを経てJog／Idleへ復帰。短いSpace入力も記録し、押し続けによる自動連続ジャンプを防止。

## 3D Explorer

顔・髪・表情・ヘルメットを外す処理を削除。頭部には暗いバイザーのヘルメットのみ。Jog1.25倍、地上旋回、梯子左右・端旋回を維持。正解時はExplorer自体を非表示にします。

## Correct Transition

- 0–0.7秒：正解選択肢Glow。
- 0.7–1.05秒：白／シアンの光を増加。
- 1.05–2.65秒：HTML/CSSレイヤーが0→720°回転。3Dカメラは回さない。
- 2.65秒：惑星シーンへ切替。白い光を滑らかにフェードアウト。
- 3.05秒：2Dキュービーをフェード／スケール表示。
- 3.45秒：背後の正解形を表示。
- 4.15秒：既存結果UI・保存処理へ。

ゲームの非Pause時間で進行。連続した1回の光演出で高速点滅なし。OSのreduced motion設定では回転を省略し、光の最大強度を45%に抑制。画像読み込みを完了条件にしていないため、画像障害で白画面に無期限停止しません。

## Regression

- 型検査・74ユニットテストPASS。ジャンプ距離、床への着地、梯子から上階への着地、壁衝突、空中固定ポーズ、着地復帰、2回転タイムラインを含む。
- ブラウザで床ジャンプ、脚角度固定、着地、実Stage1梯子から上階の床へのジャンプを確認。
- 梯子上下・左右・端落下防止・端旋回を再確認。固定時間入力の初回試験はブラウザ並列実行負荷で梯子到達に失敗したため、状態待ち入力へ変更し再試験PASS。
- 正解中のSDK Pause／Resume、結果到達、保存、リトライ、reduced motionを確認。
- 本番バンドルでも正解シーケンス完了・透過PNG読み込み・開発専用QAフックの不在を確認。
- PC1440×900／縦長390×844で画像とボタンの非重複を確認。WebGL／ページ実行エラーなし。
- 31問・正解形・WorldBuilder・Voxel継ぎ目・SDKは今回変更なし。Roblox側への書き込みなし。

## Performance

Explorerは22,040→14,072三角形。共通PNG1枚、復号RGBA約247KiB。開始時に先読み。本番JSは約551kB、gzip約144kB、画像別送。Viteの500kBチャンク警告は継続。

## Remaining Issues

- 元シート内の像は168×376px。高DPI・大型表示向け高解像度単体画像は将来差替え可能。現画像を高解像度素材とは称していません。
- Home Visual Upgrade／SHAREは次Gate。
- YouTube／CrazyGames公式環境・モバイル実機認証と素材の公開利用権確認は別途必要。

## 実画面

[正解PC](cubie-2d-qa/correct-desktop.png) / [スマホ幅](cubie-2d-qa/correct-mobile.png) / [回転中](cubie-2d-qa/spin-cutin.png) / [ジャンプ](cubie-2d-qa/jump-airborne.png) / [梯子から着地](cubie-2d-qa/ladder-jump-land.png)
