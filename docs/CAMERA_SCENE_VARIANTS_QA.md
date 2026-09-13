# Camera Transition + Correct Scene Variations

Status: READY FOR USER QA

## Camera Root Cause / Fix

旧表示条件は `third-person && !lookingUp` のみで、壁によるCamera押し出しやCharacter内部への接近を検査していなかった。表示判定もCamera更新前だった。

- Camera更新後、Explorer全体の親Groupを表示・非表示。
- モード変更中0.24秒は完全非表示。POVでは非表示を維持。
- Helmet・四肢・Backpackを覆う安全Volume内、および前フレームからのCamera経路がVolumeを横切る場合は非表示。
- 安全位置が0.08秒続いてから再表示。部分的なMesh残留なし。
- 視点位置をSmoothstepで補間し、壁判定を適用。連続切替は現在Camera位置から再開。
- LOOK UP中は補間を進めず、保存Snapshotへ正確に戻ってから続行。
- Player位置・Physics・Animation・Ladder状態は表示制御から変更しない。

## Background Presets

A Earth + Milky Way / B Blue Planet + Light Ring / C Sunset Planet / D Moon + Asteroids / E Cyan Nebula / F Spiral Galaxy / G Planet Dawn / H Ringed Planet。

共通SceneクラスにPresetを渡す方式。惑星Shader・星空・リング・衛星・小惑星・Lightingを組み合わせる。Correct Shapeは現在Stageから生成し、遠景は小さく低コントラストに保つ。正解形と人物・Resultの配置を画面比率ごとに調整。

## Cubie Poses

01 基本 / 02 手を振る / 03 ピース / 04 ヘルメットを抱える / 05 片足上げ / 06 上を見る / 07 座る / 08 背面。

提供シートの元RGBを保持する輪郭マスクのみで透過。全8枚のlossless WebPを再デコードし、元RGBとの変更画素数0を確認。座りポーズのキューブは座面として保持。Pose別Scale・Offset・Anchor・接地Shadowあり。

元解像度は各192×358px。高解像度化や顔の再生成はしていないため、大画面での精細さは元シートの制限を受ける。詳細は `CUBIE_VARIANTS_ASSETS.md` と `scene-variants-qa/asset-provenance.json`。

## Randomizer / Duplicate Avoidance

`CorrectSceneVariantService` が背景・Poseを独立抽選し、それぞれ直近2件を除外。セッション中だけ保持しSaveには書き込まない。正解確定時に選択し、既存Spin中に選択画像のみDecode。720度Timeline・Quiz処理は変更していない。

ブラウザ8連続クリアの実測:

| Clear | Background | Pose |
|---|---|---|
| 1 | E | 01 |
| 2 | G | 04 |
| 3 | H | 07 |
| 4 | E | 01 |
| 5 | A | 04 |
| 6 | F | 05 |
| 7 | G | 07 |
| 8 | B | 06 |

双方とも直近2件と重複なし。別途全8背景×対応8Poseを描画確認。Unitでは200回の独立抽選・重複除外を検証。

## Browser / Mobile

- Edgeブラウザで実Gameを使った検証Fixture。開始位置だけ設定し、実キーボード・回答ボタンで進行。
- 連続V切替、壁際、梯子端旋回・切替で、危険位置／Transition中にExplorerが描画されたフレームは0。
- 8回のAnswer → Correct → Spin → Result → Retryを確認。
- 1366×768、390×844、844×390で全8Poseを確認。人物／正解形／ResultパネルのBounding Box重なりなし、正解形の左右クリップなし。
- Reduced Motionでは既存720度Timelineの縮小モードを維持し、Cubie装飾Idleを抑制。背景は静止。
- 本番distでNEW GAME、V連続切替、Jumpの起動Smoke PASS。
- Browser Fixtureでは開発用Vite HMR WebSocketにLocal Network Access警告あり。ゲームのページ例外・Shaderエラーとは区別して記録。本番distにはHMRなし。

## Performance

- 追加WebP8枚合計665,192 bytes。初期に全8枚をロードしない。
- 背景画像テクスチャ0。背景はGeometry・Shaderのみ。
- 同じ1200×800で変更前6,994 triangles / 48 calls。変更後5,922〜6,802 triangles / 48〜51 calls。
- 遠景小惑星はInstancedMesh。衛星Geometry共有。連続クリアで主RendererのGeometry数が蓄積しないことを確認。
- ローカル描画ベンチは変更前中央値0.4ms、最終各Preset0.1〜0.3ms。ただし短時間のブラウザ計測であり、実機GPU時間・全端末FPSを保証する値ではない。
- JS build約595.27kB / gzip159.81kB。従来からの500kB chunk警告あり。
- スマートフォン実機およびYouTubeホスト内のFPS測定は未実施。

## Regression

102 Unit tests PASS、TypeScript PASS、Production build PASS。

Stageデータ、31問、10択・2回答、Jump/Jog/LadderのPhysics、How To Play、i18n、Home、Save、SDK、Roblox版ファイルは編集していない。既存2D Cubie原本も保持。

## Evidence

- `scene-variants-qa/all-presets.png`
- `scene-variants-qa/source-and-cutouts.png`
- `scene-variants-qa/browser-results.json`
- `scene-variants-qa/render-cost.json`
- `scene-variants-qa/mobile-390-pose-7.png`
- `scene-variants-qa/mobile-844-pose-8.png`
