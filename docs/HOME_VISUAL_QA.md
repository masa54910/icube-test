# Home Visual Upgrade

Status: READY FOR USER QA

## 変更内容

- 意味を持たない上部1〜4とINVITE FRIENDSを削除。SHAREはComing soonの仮モーダルのみ。外部送信・SNS共有・Deep Linkは実装していない。
- 左UI＋右3D Sceneを維持。明るいブルーホワイトから青灰色への左パネル、Deep Navyの文字、シアンのアクセントに変更。
- 正式コピー「探索して、記憶して、見抜け。」「君の空間把握能力が試される。」をそのまま表示。新規コピーはHomeContent.tsへ集約。今回、新たな言語判定・翻訳処理は追加していない。
- SVGアイコン、光沢、Hover、Press、タッチ押下、キーボードFocusを統一。CONTINUEを主操作として強調。
- PLAYER PROGRESSに進捗バーと4つの数値を整理。既存の保存値を表示するだけで、保存方式は変更していない。
- Home専用の白い惑星、星空、左寄りの銀河、遠景の地球・Cube Buildingsを追加。Correct Sceneを流用・編集しない独立実装。
- 中央＋上下左右前後の7 Cube Crossを維持。軽い回転・上下移動、シアンの縁と地表のリング、淡い反射。
- 既存の透過キュービーPNGをHTML Overlayで共用。地面上の接地影、弱いシアン光、0.4%以内の呼吸と1°未満の傾き。顔・髪・服の画像加工なし。Crossと独立して配置。Waveは素材がないため省略。

## Responsive QA

| 対象 | サイズ | 結果 |
|---|---|---|
| Desktop | 1920 × 1080 | 2列、横溢れ・スクロールなし |
| Laptop | 1366 × 768 | 2列、横溢れ・スクロールなし |
| Tablet Landscape | 1024 × 768 | 2列、横溢れ・スクロールなし |
| Mobile Portrait | 390 × 844 | World→UI、縦スクロールで全操作へ到達 |
| Mobile Landscape | 844 × 390 | 左メニューを縦スクロール、右World固定、横溢れなし |

各サイズでSHARE、HOW TO PLAY、STAGE SELECTの開閉を確認。NEW GAME→探索、CONTINUE→探索、Hover/Press、キーボードFocus、Reduced Motionも確認。タッチエミュレーションで押下中の縮小・SHAREの起動を確認。

## 回帰・保護

- 型チェック＋85単体テスト：PASS（既存80件＋Home専用5件）。
- 本番ビルド：PASS。
- 本番ホームに保存データを与えた検証：8 / 31、BEST 01:01.2、TOTAL 02:31.2、NEXT STAGE 1-2を表示。CONTINUEでSTAGE 1-2開始。
- 本番でホーム→回答→正解表示：PASS。実行時エラーなし。
- 既存のJump、2D Cubie、720°正解演出、保存、Pause/Resume、正解画面の縦配置、Reduced Motion：ブラウザ回帰PASS。
- Game、PlayerController、Explorer、CameraController、WorldBuilder、SDK、Stage、CorrectPresentation、CorrectTimeline、元PNGを含む15ファイル：作業前とSHA256一致。証跡はhome-visual-qa/protected-files.json。
- Roblox版：変更していない。既存のHomeControllerの未コミット変更はそのまま保持。

## Performance

- Home 3Dは上限30fps、Pixel Ratio最大1.5。画面外・非表示時は描画を省略。Reduced Motionでは必要な更新時のみ描画。
- 1366 × 768 / Headless Edgeの測定：通常のRAF平均16.70ms、95%点17ms。Reduced Motion中とゲーム開始後、3秒間のHome追加描画はそれぞれ0回。
- 地球の地形マスクは実行時生成の512 × 256、遠景Buildingsは1 InstancedMesh。巨大テクスチャ・追加外部リクエストなし。
- 既存PNGは168 × 376 / 約99KBを共用。Homeに表示するため、以前はStage側で取得していた画像をHomeで取得する。配布画像の追加コピーはない。
- 最終JS：564.47KB / gzip 148.62KB。CSS：21.21KB / gzip 5.85KB。前Gate比で圧縮コード約5.38KB増。

## Remaining Issues / 次Gate

- 実際のShare、i18n、ブラウザ言語に応じたHome切替は次Gate。
- Cubieの元PNGは168 × 376。無断補正・再生成・高解像度化をしていないため、素材由来の解像度上限が残る。
- Waveは省略。顔や腕の再生成は行わない。
- 低性能スマートフォン実機のFPSと負荷は未測定。上記のデスクトップ測定だけで全端末の性能を保証しない。
- 既存のVite 500KBチャンク警告は継続。

## 確認画面

開発サーバー： http://127.0.0.1:5173/ （停止していません。再読み込みして確認してください。）

![Desktop](C:/Users/owner/Documents/Codex/2026-09-11/files-mentioned-by-the-user-gpt/outputs/icube-test-playables/docs/home-visual-qa/desktop.png)

![Mobile Portrait](C:/Users/owner/Documents/Codex/2026-09-11/files-mentioned-by-the-user-gpt/outputs/icube-test-playables/docs/home-visual-qa/mobile-portrait.png)
