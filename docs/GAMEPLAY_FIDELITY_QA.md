# Gameplay Visual Fidelity Upgrade — Phase A

Status: READY FOR USER QA

## Visual Root Causes

均一で強い環境照明、ほぼ共通の粗さを使う部位マテリアル、投影影と接触影の欠如、鋭いBoxエッジ、反射環境なしが主因。キャラクターのモデル形状そのものの制約はPhase Bに残る。

## 実装

- `GameplayVisuals` はGameplay中だけ有効な描画層。物理・移動入力・回答・Saveを所有しない。
- 壁・床: オフホワイト、roughness .64、metalness .015。実際の面の端だけに薄いAO近似。面内部のグリッドは追加しない。
- Bevel: 厚みのある既存Boxへ最大.018の微小丸み。同サイズGeometryを共有。物理用Boxを確定した後の描画Geometryだけを置換。
- Lighting: Hemisphere、白いKey、寒色Fill、弱いCyan Rim。部屋の既存Point Lightは弱める。
- Shadow: Character・梯子・端末が局所Key Shadowを投影。PCF Soft Shadow。大きな天井が照明リグを全面遮蔽しないよう、室内シェルは受影専用。
- Contact: 足元、端末下、梯子の足元と背面に薄い解析的な影。足元影は床面と空中距離に追従し、遠い床／穴へ浮いた影を置かない。
- Character: 布、シェル／バックパック、ジョイント／トリム、手袋／ブーツ、ヘルメット、バイザー、シアンを質感分離。Mesh形状、頭身、関節、アニメーションロジックは維持。
- Visor: Deep Navy、roughness .09、clearcoat 1、標準Physical MaterialのFresnel。64pxキューブ相当から作った共有PMREM反射。顔、髪、GLBは追加しない。
- Ladder: 艶を抑えた金属、metalness .72、roughness .4、微小Bevel。
- Terminal: セラミック調の台座、低粗度モニター枠、既存emissiveと起動制御を維持。床ゾーンは透過を弱め、薄い青い反射に整理。
- Rendering: GameplayのみACES、exposure 1.04。既存WebGL MSAAを維持。SSAO、Bloom、SSR、Fog、DOF、Motion Blur等の追加ポストプロセスなし。
- Quality: 通常DPR上限1.5／Shadow1024。coarse pointer端末ではDPR1.25／Shadow512。追加設定UIなし。
- Home・Showcaseは未変更。正解シーンでは元の照明可視性・Tone Mapping・Exposure・環境・DPRへ復帰。

## Before / After

`GAMEPLAY_FIDELITY_COMPARISON.html` に7組。後方・側面・梯子・回答端末・通路・着地・バイザー。

撮影専用のGameインスタンスで進行を止め、同じ位置・Quaternion・Poseを使用。最終Beforeは、このGateで追加した描画層の接続だけをブラウザの配信レスポンスから外し、変更していない従来照明・WorldBuilder・Characterマテリアルを再現して撮影。本番ファイルを巻き戻していない。動作中の別画像は `runtime-landing.png`、`runtime-ladder.png`。

## Performance

Edge headless / ローカルVite / 1280×800。FPSは3秒RAFサンプル。ソフトウェア／PC環境の実測で、スマートフォン実機保証ではない。

| 指標 | Before | After |
|---|---:|---:|
| FPS | 60.25 | 60.27 |
| p95 frame interval | 16.9ms | 16.9ms |
| メイン描画calls（7構図） | 109–232 | 111–233 |
| メイン描画triangles（7構図） | 21,572–24,356 | 24,036–31,366 |
| renderer.info textures | 0 | 2 |
| JS heap sample | 34.66MB | 36.60MB |
| QA起動→初回Stage確認（Home/import/click/300ms待機を含む） | 1244ms | 2178ms |

Draw calls/trianglesは`renderer.info.render`の値。シャドウ用描画の総量を含むGPUハードウェアカウンターではない。

追加テクスチャはPMREM 336×256 Half Float（色データ約0.66MiB）とShadow1024² RGBA（約4MiB、Lowは512²で約1MiB）。別途深度バッファ・ドライバー領域があり、実VRAM使用量の厳密測定ではない。画像ダウンロードは追加なし。

初回反射生成／シェーダー準備に起因する約0.9秒の起動増加を観測。純粋なGPU初回render時間を分離した測定ではない。定常FPSは維持したが、初回コストの増加は残る。反射環境はセッションで1回生成し再利用。

タッチ端末相当（DPR3入力→描画1.25、Shadow512）: 390×844で60.27fps、844×390で60.37fps。実機Mobile QAは未実施。

Bundle gzip 161.58KB → 165.35KB。500KB chunk警告は既存から継続。

## Regression

- TypeScript、117 Unit Tests PASS。
- 全31ステージでCollider座標、部屋、梯子、回答位置の不変を自動比較。
- キャラクター全MeshのGeometry参照・Position・Scale不変を自動確認。
- 実ブラウザ: 移動、旋回、通常Jump、着地、2FからLadder Catch、保持、端操作、POV、LOOK UP、連続視点切替、回答、不正解→正解、RETRY、NEXT STAGE、Home復帰 PASS。
- 青い球／内部Meshの可視性違反なし。117件の既存＋追加テストでJump距離・Ladder挙動の回帰なし。
- CorrectでNoToneMapping / environment=null / gameplay rig非表示への復帰を確認。
- Homeは01 BRANDへ戻り、既存Showcaseを維持。
- Browser pageerrorなし。本番ビルドPASS。
- Roblox、PlayerController、CameraController、Stage data、Quiz、Save、SDK、i18n、Home/Showcase、CorrectScene/randomizerは未変更。

## Phase B Readiness / 残る制約

`CharacterVisualAdapter` を追加し、通常フレームのアニメーション更新を描画ポート経由にした。将来のMixer/AnimationClip実装の入口で、GLBロード・Skeleton・LODは未実装。現在のGameはIdleコンテキストや診断用関節値をprocedural Characterから取得するため、Phase Bではその互換ラッパーも必要。

形状維持の指定に従い、現行Helmetのポリゴン由来の輪郭とバイザー境界の段差は残る。反射／質感は改善したが、正式GLB相当の人物品質ではない。初回起動コスト、スマートフォン実機負荷、見た目の最終判断はUser QA対象。
