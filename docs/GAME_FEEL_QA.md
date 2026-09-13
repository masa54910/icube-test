# Game Feel / Juice + Character Motion Polish

Status: READY FOR USER QA

## 実装

- Voxel seam: 通過した既存境界だけを0.24秒Cyan発光。0.8秒Cooldown。面内グリッド追加なし。
- Terminal: 3.5以内でSoft Wake、離れて1.2秒後からSoft Fade。回答中は点灯維持。
- Answer: Hover浮遊・6度回転、選択は強いCyan、不正解は短い揺れ、正解は既存720度演出へ接続。
- Landing: 0.22秒以上のAirborne後、0.34秒の小さな波紋。
- Catch: 空中から梯子へ遷移したとき、近傍の横桟のみ0.28秒発光。既存吸着処理を維持。
- Idle: 4秒後から短い仕草。Terminalを見る、梯子を見上げる、見回す、手首・Stretch。入力で解除。
- Jump: 通常水平速度4.8から2.4。垂直速度6.2・重力13は維持。梯子離脱時は4.8を維持。
- Jog: 上腕・前腕、腿・膝・足首を独立動作。肘約74–99度、膝の屈曲、胴体の小さなLeanとCounter Rotation、Pose Blend。
- Reduced motion: 装飾回転・Idleを抑制、発光・波紋を弱める。

## 検証

- TypeScript・Unit: 11ファイル / 91テストPASS。
- ジャンプ水平距離: Before 4.560 / After 2.280 world units。同じ積分条件で50%。最高位置は双方 -1.48709で一致。
- 既存の梯子上端から床へのJump、2F/3F CatchテストPASS。
- Edge実ブラウザ: 境界通過、Terminal Wake、Idle開始と解除、Hover/Select/Incorrect/Correct、既存Result表示、Landing、2F Jump Catch・高さ維持・二重発火なしを確認。
- タッチエミュレーション390×844: Tap選択・選択変更PASS。
- 本番dist: 起動、NEW GAME、V、Jumpでページ例外なし。
- 実ブラウザの再現用Fixtureでは開始位置だけを設定し、実際のGame更新とキーボード入力で検証。製品コードにテスト用位置変更APIは追加していない。
- Front/Back/SideのJog画像確認済み。

## 負荷

- キャラクター22,472 triangles、モデルGeometry増加なし。
- 追加波紋とCatch表示: Geometry2個、Texture0、同時表示2 draw calls / 76 triangles。
- 100回表示切替前後でGeometry・Texture数不変。
- Seamは既存GeometryのMaterialを一時交換し復元。
- ビルド成功: JS 585.22 kB / gzip 156.11 kB。Viteの500 kBチャンク警告あり。
- 実機スマートフォンやYouTubeホスト内のFPS測定は未実施。上記は描画量・再利用検証であり、全端末の性能保証ではない。

## 変更範囲

Home、i18n、Stageデータ、10択・2回答ルール、720度Correct Timeline、2D Cubie、Save、YouTube SDK、Robloxファイルは本Gateで編集していない。

画像: game-feel-qa/seam.png、answer-selected.png、landing.png、catch.png、jog-three-views.png。
