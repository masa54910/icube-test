# Gameplay Visual Fidelity v2 + Strong Landing + Shift LOOK UP

Status: READY FOR USER QA

実施日：2026-09-12。ブラウザ検証：ローカルEdge／Playwright。正式なRigged GLBへの置換は行っていません。

## Character Silhouette / Torso White / Suit Details

- 胸に幅、腰に絞りを持つLathe輪郭へ変更。白い胸部シェル、傾斜した肩キャップ、独立した膝パッド、グレーの関節を分離。
- 胴体の布地ベース色は `#f4f7f8`。陰影によって暗くなる部分は残し、壁と服の立体感を保持。
- 手首カフ、親指／手袋、バックパック側面モジュール、シアン表示を整理。
- 既存CharacterVisualAdapterを維持。物理・衝突形状とキャラクターの描画は分離したまま。

## Boots

- 甲から爪先へ連続する専用曲面を追加。足首カフ、白いシェル、厚いグレーソール、ヒール、シアン縁、低負荷の靴底トレッド。
- 全パーツは既存の足首ノードに接続。最下部の靴底位置は維持。
- 正面・側面・背面・接写と、Jog／空中／着地／梯子ジャンプを確認。

## Helmet / Visor

- 交差する楕円球のバイザーを、シェル外面に沿う専用曲面へ変更。
- シアンのガスケット、側面モジュール、首のシールを維持・調整。
- 既存Physical Material／PMREM反射に青黒い縦方向グラデーションと上部ハイライトを追加。巨大テクスチャは追加なし。

## Landing Compression / Landing Strength

- 0–80ms：接触、80–220ms：圧縮、220–280ms：踏ん張り、280–580ms：回復。
- 表示位置のフレーム間変化から落下速度を計測し、膝角度を約37–68°に連続調整。通常ジャンプの実測例：約50°、高所落下：約65°。
- 腰の沈みは脚の曲がりから計算。足首は合計角度を相殺して靴底を接地。上半身を約6–14°前傾、肘でバランスを取り、ヘルメットは小さく遅れて追従。
- 波紋は接触から約80ms後の圧縮開始に同期。高所では半径を最大18%増加。接触影も圧縮中のみわずかに強化。
- 入力ロックなし。着地直後からW入力を受け付け、回復中にJogへブレンド。
- ブラウザ実測：通常／前進／高所／梯子から／着地直後Wの5ケース。接地のユニットテストも追加。

## Shift LOOK UP

- ShiftLeft／ShiftRight：押している間LOOK UP、離すと復帰。
- 両Shift同時入力では片方を離しても継続。LOOK UPボタンとキーボード入力は別ソースとして管理。
- Blur、非表示タブ、入力無効化、Home／回答画面への移動、既存SDK Pause経路で解除。
- 実ブラウザでThird-person／POVの両Shift、W＋Shift、梯子中、両Shift、Blur／Menu解除を確認。カメラMode／FOV／角度復帰を検証。
- ShiftをSprintには使用しない。↑は従来どおり移動。CameraController自体は未変更。

## How To Play / i18n / Answer Prompt

- LOOK UPの操作行にShift Keycapを追加。「ボタンまたはShiftを押している間、真上を見る」を9言語へ反映。
- en／ja／ko／zh-CN／zh-TW／es／pt／de／fr：開いたまま実際のセレクタで即時切替を確認。
- Desktop 1920×1080、Laptop 1366×768、Tablet 1024×768、Mobile 390×844／844×390の本番ビルドで9言語ずつ確認。操作行の横はみ出しなし。
- 既存「回答：Eを押す」、9言語Keycap、接近時のみ表示、Eから回答画面、モバイルの「回答」（Eなし）を再検証。

## Performance

| 同一Desktop条件の短時間計測 | Before | After |
|---|---:|---:|
| FPS | 60.1 | 60.8 |
| Character triangles（インスタンス込み） | 24,856 | 22,464 |
| Draw calls | 175 | 178 |
| Renderer textures | 2 | 2 |
| ゲーム描画triangles | 28,460 | 26,068 |
| JS heap参考値 | 約13.7MB | 約16.0MB |

- 反復する胸／背面インジケーターと靴底トレッドをInstancedMesh化。
- Mobile相当：390×844、Touch、512px Shadow、DPR 1、約60.1fps。実機モバイルの長時間性能は未確認。
- FPSは短時間標本であり、全端末・全ステージの保証ではありません。JS heapはGCタイミングで変動します。
- 本番JS：621.56KB、gzip 167.66KB。前Gate 616.90KB／gzip 166.11KBに対し小幅増加。CSSは変更なし。
- 既存の500KB超chunk警告は継続。Buildは成功。QA画像はdocs内のみでゲームBundleへ同梱しません。

## Before / After

- [比較ページ](GAMEPLAY_FIDELITY_V2_COMPARISON.html)：正面／側面／背面／ブーツ／ヘルメットの同位置比較。
- 着地は5ケースの空中・接触・圧縮・回復・IDLE/JOGの連続フレーム。
- 元画像や2D Cubieの再生成・補正はしていません。

## Tests / Regression

- `npm run check`：型チェック、124テストPASS。
- `npm run build`：PASS。
- 新規：着地強度と圧縮ホールド、足首と靴底の接地、9言語Shift説明、バイザー外向き法線／装備接続。
- 旧400msの着地テストは今回の正式580ms仕様へ更新。ジャンプ距離テストは変更せず、現行2.28／旧基準4.56を維持。
- 実ブラウザ回帰：移動、左右旋回、ジャンプ、梯子Catch／端、POV、LOOK UP、連続視点切替時の内部Mesh非表示、回答、正解、リトライ、次ステージ、Home復帰PASS。
- PlayerController、Stage／31問、回答ロジック、Correct、Home／Showcase、Save、YouTube SDK実装、Robloxファイルは変更なし。

## Remaining User QA

- 外観の最終的な好みと、普段の実機・操作環境での着地感をご確認ください。
- 正式GLBの人物品質は今回の対象外です。低性能実機での長時間性能確認は残っています。

証跡：`fidelity-v2-qa/runtime.json`、`responsive.json`、`before/metrics.json`、`after/metrics.json`、`mobile/metrics.json`。前Gateの回答案内・回帰スクリプトも現行コードで再実行しました。
