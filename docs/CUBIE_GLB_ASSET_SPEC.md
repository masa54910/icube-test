# Cubie正式Rigged GLB — 納品・受け入れ仕様

Status: BLOCKED — FORMAL CUBIE GLB REQUIRED

## 今回の調査

2026-09-12、現行ワークスペース／プロジェクトの `.glb`、`.gltf`、`.fbx`、`.blend` およびcubie／character／astronaut／explorer／player関連ファイルを検索。正式3Dモデルは未検出。既存のCubie PNG／WebPとProcedural Characterのみ。

外部モデルのダウンロード、ProceduralのGLB書き出し、簡易形状による代替「正式モデル」作成はしていません。

## ご提供いただくもの

1. `cubie-explorer.glb`：Helmet ON、髪／顔は外から表示しない。白い宇宙服、シアン、ブーツ、手袋、コンパクトなバックパック。
2. 出典、作者／制作サービス、利用規約・購入ライセンス、YouTube公開・商用利用・ゲームへの同梱可否の証拠。ライセンス不明の場合は採用しません。
3. Bone名と階層、Clip名一覧、正面方向、単位、推奨表示身長。
4. 必要ならテクスチャ原本、制作元ファイル。ゲーム用GLBはテクスチャ／バッファを内包してください。

## 形状・Rig

- Stylized Realistic Astronaut。正式2D Cubieの体型／装備／シルエットを正本とします。
- Y-up、足裏を原点、X/Zは身体の中央。表示は既存Colliderに合わせ、Colliderをモデルに合わせて変更しません。
- Viewer初期表示身長1.42ワールド単位。実素材のQAで調整可能。正面は既存Explorerの-Z方向。
- 必須：Root、Hips、Spine、Chest、Head、左右UpperArm／LowerArm／Hand／UpperLeg／LowerLeg／Foot。別名は`boneNames`で対応付け。
- Shoulder／Neck／Toeは推奨。負スケール、反転手足、裂けたウェイト、分離した足首などをViewerで確認。
- 目安20k–50k triangles。現行Explorer **22,464 triangles**、ゲーム描画総数の前回標本は**26,068**。両者を混同せず比較します。

## Animation

表示状態：IDLE、JOG、TURN_LEFT、TURN_RIGHT、JUMP、AIRBORNE、LAND_LIGHT、LAND_NORMAL、LAND_STRONG、LADDER_IDLE、LADDER_CLIMB。

- 最低Idle／Jog／Jump／Land／Ladder。原則in-place。Root Motionで視覚とColliderが離れないこと。
- Jog：肘・膝曲げ、骨盤と肩の逆位相、接地。着地：強弱、腰の沈み、足首、上体、約0.58秒の圧縮・踏ん張り・回復。
- 着地3強度、梯子の静止／移動、左右旋回、空中、Idle variation 2–3種は、Clipの不足を確認して追加制作／適切なSkeleton Animationの方針を決めます。
- 現行Proceduralの部位回転をGLBへ直接当てません。Clip不足は報告し、動いたように偽装しません。
- 各モデル固有のClip名をViewerの`clips` JSONへ明示。AnimationMixer／0.15秒Cross Fadeを用意済み。

## Materials / Texture

- Fabric、Hard Shell、Flexible Joint、Visor、Gloves、Boots、Backpack、Cyan Accentを識別可能に。
- 布地は白、高roughness。灰色胴体不可。硬質シェルは白・低めroughness。Visorは不透明の青黒、反射とFresnel、シアン縁。
- テクスチャ1K中心、2Kは必要箇所のみ。4Kは自動採用しない。
- 初回は外部依存のない非圧縮GLBを推奨。Draco／Meshopt／KTX2は、正式モデルを調査してローカルdecoderと互換性を確認してから導入します。現在のViewerはそれらのdecoderを未設定です。

## 受け入れ順序

Import → Validate → Viewer → Rig / Material / Animation QA → Performance → Side-by-side → **User QAで停止**。

承認前にGameplayの既定キャラクターを切り替えません。Viewerのプレビュー操作は正式採用ではありません。

比較：正面／背面／側面／3/4／Jog／Jump／Deep Landing／Ladder／Terminal／White corridor。FPS、三角形、Draw Calls、テクスチャメモリ、GLB転送サイズ／圧縮サイズ、ロード時間、Animation CPUを測定。Mobileエミュレーションの後に実機QA。

## 実装済み基盤と未完了部分

- `src/game/glb/GLBCharacterVisual.ts`：GLTFLoader、ローカル自己完結GLB、Rig/Clip/Textureレポート、サイズ／足裏正規化、AnimationMixer、リソース解放。
- `AnimationState.ts`：11状態、着地3強度、回復中のJog移行。Physicsへの書き込みなし。
- `CharacterVisualSlot.ts`：既存CharacterVisualAdapterと互換の安定Root、同時preload集約、失敗／タイムアウト時fallback、明示的Viewer切替、候補破棄。
- `docs/CUBIE_GLB_VIEWER.html`：正面／側面／背面／3/4、Wireframe、Skeleton、状態再生、検査情報、同一照明の左右比較用shell。
- ローカル開発サーバーで使用するQA専用Viewerです。HTMLの直接ダブルクリックやdist単体の配布ページではありません。
- Game／PlayerControllerには接続していません。Home初期ロード・本編・Save・SDK・2D Cubieへの影響なし。
- 正式モデル不在のため、実Skinned Meshのロード成功、ウェイト、見た目、Clipの品質、接地、強弱着地、Idle variation、実モデルの性能・メモリ反復試験は未実施。
- テストのGLB fixtureは空のコンテナで、パーサー／不足検出の検証専用です。正式キュービーではなく、モデル品質PASSとは扱いません。

## 次の作業開始条件

正式GLBと利用権情報をご提供ください。提供後はViewerでのUser QAまで進め、承認を待ってからDefault Gameplay Characterを変更します。
