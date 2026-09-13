# 惑星・地平線の配置修正

- 惑星本体・リング・大気を含むBoundsを画面へ投影し、下端を地平線より上、上端を画面上端より内側へ収める共通配置処理を追加。
- PCでは惑星を右側へ配置し、正解形に隠れすぎないよう調整。画面サイズ変更時に元スケールから再計算。
- 地面を不透明・Depth Write有効の前景にし、後方の宇宙が透ける状態を解消。
- 8背景×3画面比率の地平線Boundsテストを追加。全110テストPASS、本番ビルドPASS。
- 実ブラウザで8背景を再描画。Laptop／縦横モバイルの人物・正解形・Resultの重なりチェックもPASS。
- 最新確認画像: `scene-variants-qa/all-presets.png`
- 最新実行記録: `scene-variants-qa/horizon-results.json`（1回のクリア後、全8Presetを表示するレイアウト検証）。前Gateの8連続抽選結果は `CAMERA_SCENE_VARIANTS_QA.md` の表に記録。
- Stage、Quiz、Player、Cubie素材、Save、SDKは変更なし。
