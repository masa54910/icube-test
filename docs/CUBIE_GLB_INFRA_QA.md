# Gate: Cubie 3D Character Replacement — Integration Infrastructure

Status: **BLOCKED — FORMAL CUBIE GLB REQUIRED**

2026-09-12。正式モデルはプロジェクト内に未検出。ProceduralからのGLB生成、外部モデル採用、Gameplay既定モデルの変更はしていません。

## 完了した基盤

- 既存CharacterVisualAdapter互換のGLBCharacterVisual／CharacterVisualSlot。
- GLTFLoaderによる自己完結GLB読み込み。外部リソース要求を拒否。Clip・Rig・材料・テクスチャ・trianglesの不足／予算レポート。
- 11状態のAnimation interface、AnimationMixer、Cross Fade。欠損Clipは明示し、自動生成しない。
- preloadの同時要求集約、取得タイムアウト、失敗時fallback、明示的な候補プレビュー、破棄時のGeometry／Material／Texture／Skeleton／Mixer解放。
- QA専用Viewer shell：同一Camera／Lighting、Front／Side／Back／3/4、Wireframe、Skeleton、状態選択、ファイル検査表示。
- [モデル納品仕様と受け入れ手順](CUBIE_GLB_ASSET_SPEC.md)。

## 検証

- `npm run check`：既存124＋新規5＝129テストPASS。
- GLBコンテナのparse、不足Rig／Clip検出、無効GLBのfallback、preload集約、明示的switch／破棄、取得タイムアウト、Animation state mappingを確認。
- 空GLB fixtureはテスト専用です。正式Skinned Cubieのロード／リギング品質検証を代替しません。
- Viewer TypeScript単独型チェック：PASS。
- Edge実ブラウザ：Viewer起動、4視点、Wireframe／Skeleton UI、Jog選択、Pause、不正ファイル後の安全な失敗、ページ再表示PASS。pageerrorなし。
- `npm run build`：PASS。出力 `game-CyKyrp_y.js`／621.56KB／gzip167.66KBは前Gateと同一。GLB基盤はGameから未参照のため、本編の初期ロード／描画負荷は増えていません。
- 既存500KB超chunk警告は継続。今回新設のエラーではありません。

## 未実施・停止理由

正式GLB、権利情報、実際のRig／Clipがありません。そのため実Skinned Meshのウェイト、関節破綻、素材忠実度、強弱着地／Idle variation、梯子接地、モデル固有のメモリ／圧縮／性能、正式Side-by-side品質評価は未実施です。

PlayerController、物理、Camera、Stage、Answer／Correct、2D Cubie、Home／Showcase、i18n、Save、YouTube SDK、Roblox版は未変更。Gameplayの既定キャラクターはProcedural v2のままです。

正式GLBと利用権情報の提供後、Viewer／比較のUser QAまで進めます。承認後のみGameplayのDefault切替を実施します。
