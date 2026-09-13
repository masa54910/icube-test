# ROUTE 1 Geometry Variety + Boost Distance Adjustment

Status: READY FOR USER QA — 全8工程COMPLETE

## Geometry

以前の共通X往復＋Z前進テンプレートを、Stageごとの明示的な方向列へ置換。STANDARDのデータ、PlayerController、Camera、Boostの加速・速度・演出、Memo Engine、保存処理は変更していません。

|Stage|Theme|Cubes|Horizontal turns|Floors|Vertical transitions|Answer points|Boost pads|Correct choice|
|---|---|---:|---:|---:|---:|---:|---:|---:|
|1-1|THREE TURNS|17|3|2|1|2|0|5|
|1-2|TALL ROUTE|22|4|5|4|2|0|3|
|1-3|LONG + TALL|26|4|5|4|2|1|6|
|1-4|S ROUTE|23|5|2|2|3|0|8|
|1-5|SPIRAL / WHIRL|26|5|2|1|3|0|5|
|1-6|U-TURN STACK|28|4|3|2|3|2|6|
|1-7|VERTICAL SNAKE|29|7|5|4|3|0|8|
|1-8|CORKSCREW|29|5|6|5|3|0|9|
|1-9|WIDE + TALL|28|4|4|3|3|2|6|
|1-10|PURE ROUTE FINAL v2|36|8|5|5|4|1|2|

正解番号はnumericId seedによる本番の実際の並びと、Canonical normalized hash完全一致で照合。10問すべてexact match 1、9誤答、回転同一形も含め重複0。QAページのみ正解を緑枠で表示します。

## Boost

旧有効距離3Cube → 4Cube（18 → 24 world units）。Padは8Cubeの直線内に配置し、終了後2Cubeの余裕を保持。短い直線のStageには置かず、全6Pad。1-3 / 1-6 / 1-9 / 1-10で実ブラウザの踏み込み・距離終了・接地を確認。計測はフレーム間のサンプリングで約23.58〜23.93、物理上の設定距離は24。開始検出の遅れを含みます。

## Verification

- Automated: 328 tests / 27 files PASS。Production Build PASS（既存のchunkサイズ警告あり）。
- 全10Stageが整数・重複なし・Face-connected、両端degree 1、中間degree 2。突出／分岐／余分なDead Endなし。
- 全31梯子の上階床、出口支持、経路障害物、Answer Point／Boost干渉の自動監査PASS。
- 1-2 / 1-3 / 1-7 / 1-8は全梯子を通り、STARTから探索・Memo・回答・Resultまで実キーボード操作。
- 1-5もSTARTからResultまで通し操作。
- 1-10：最終版で全5上下移動（上り4・下り1）、Boost、Memo、Answer、Resultまで通し操作PASS。追加Jumpなし。
- Memo：IncorrectによるHint解放、正しい位置だけGlow、Retry、Reload、別Stage隔離を実ブラウザ確認。
- 上階からのJump Catch：1-1 / 1-5 / 1-10 / Standard代表で保持・下り確認。
- Standard代表：Move / Jump / POV / LOOK UP / Memo / Answer / Correctをブラウザで確認。
- Mobile portrait 390×844 / landscape 844×390：1-8でTouch移動、HUD、Mini／Full Memo。物理端末は未確認。

## QA method and limitations

EdgeをPlaywrightで操作。通しプレイはStage開始以外の位置変更なし。Boost・Jump Catch単体試験のみ開始位置fixtureを使用。製品の関数やPhysicsを差し替えていません。ブラウザテスト専用のインスタンス参照は配信レスポンスへ一時追加し、Productionファイルには残しません。

1-10の試作配置では下りへWで進入すると上端退出補助へ戻るケースを検出。最後の区間の方向を変更し、下りへ反対側から入る配置に修正しました。下り後はSを離してWで梯子から一歩離れ、それから旋回する通常入力手順で確認します。Sを地上で保持し続けると既存の反転移動へ切り替わるため、下り入力と地上移動を分けています。

旧形状のMemoはユーザーのメモとして保持。新しい正解形へ自動変換はしません。読み込み時に旧Hintの誤ったGlowが除外されることをテストしました。進行状況・Hint使用回数を勝手にリセットしません。

難度の体感、各Stageの印象差、実機の操作感はUser QA対象です。同一縮尺のシルエット・10択・正解番号・構成値は `ROUTE1_ANSWER_QA.html` で確認できます。

記録：`route-variety-qa/audit.json`（正解・構成）、`full-103-105-108-110.json`（最初の3問）、`full-102-107.json`（縦長2問）、`full-110.json`（最終版1-10）、`extra.json`（BOOST・Mobile）、`memo.json`（Memo保存・Hint）。
