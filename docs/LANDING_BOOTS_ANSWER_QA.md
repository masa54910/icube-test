# Gameplay Visual Fidelity — Landing / Boots / Answer Prompt

Status: READY FOR USER QA

## Landing

- 圧縮140ms＋回復260ms、合計400ms。
- 両膝、股関節、足首、腰の沈み、上半身前傾、肘のバランス動作を追加。
- 位置・速度・重力へ書き込まない描画Pose。移動中はJogと重ね、入力をロックしない。
- 既存Airborne→Ground接触を起点にし、既存Rippleは変更せず維持。
- 通常Jump、Forward Jump、高所落下、Landing中W、梯子から上階へのJump→Landingをブラウザで確認。
- 落下高さ別の強弱は今回は追加せず、控えめな共通圧縮を使用。

## Boots / 白い宇宙服

- 足首の柔らかいカフ、白い甲シェル、丸いToe、Heel、厚い灰色Sole、Cyan側面ライン。
- 全部品を既存足首ノードの子として保持。Jog / Airborne / Landing / Ladderの足首回転へ追従。
- ソール最下端は従来と同じ高さ。物理形状と移動ルールは変更なし。
- Front / Side / Backの撮影確認。
- 宇宙服のFabricを `#f5f6f4` の白地に変更。粗い布の質感と硬質パネルの差は維持。
- Characterは24,856 triangles（従来22,472、3万以内）。

## Answer Prompt

- `game.answerPrompt` / `game.answerTouch` を既存 `t()` に接続。
- 日本語: 「回答：Eを押す」。EはDOMのkbd要素。
- en / ja / ko / zh-CN / zh-TW / es / pt / de / frを実際のPromptで確認。
- 回答範囲内のままLocaleを変更し、Reloadなしで次フレームに更新。
- coarse pointer端末は各言語の「回答」相当のみ。Eキー案内なし。Tapで既存回答UIへ。
- 範囲外で非表示、回答UI表示中も非表示。E/Fの入力処理や回答判定は変更しない。

## Tests / Regression

- TypeScript / 121テスト PASS（既存117＋新規4）。
- 旧着地0.12秒を前提とした既存テスト1件は、今回の400ms回復仕様へ更新。
- 通常ジャンプ距離2.28、高さ・重力・梯子Jump Assistの既存テストを維持。
- 本番Build PASS。既存500KBチャンク警告は継続。
- ブラウザのpageerrorなし。
- PlayerController、Camera、WorldBuilder、Stage、Quiz、Correct Scene、Home/Showcase、Save、SDK、Roblox未変更。
- モバイルはPC上のタッチ端末エミュレーション。スマートフォン実機では未検証。

## Evidence

- `landing-boots-qa/results.json`: 9言語の実際のPrompt。
- `landing-boots-qa/landing-compression-side.png`: 着地圧縮時の横姿。
- `landing-boots-qa/boots-front.png` / `boots-side.png` / `boots-back.png`: ブーツ・白い胴体。
- `landing-boots-qa/prompt-ja.png` / `mobile-prompt.png`: PCとTouch案内。
