# Gate: Roblox Fidelity + Player Controller

Status: READY FOR USER QA

## Root Cause

- 旧isNavigableは各部屋の幅からプレイヤー半径を両側で引いていた。横につながる部屋にも幅0.68の通れない隙間が生まれ、最初の部屋境界で停止した。
- XZを一括で採否判定していたため、壁への斜め入力は両方向とも止まり、壁沿いに進めなかった。
- カメラpitchを毎フレーム古いsnapshotへ補間しており、通常の見回し入力と競合した。
- キー状態自体は長押し式だったが、カメラ操作・入力・梯子・移動が同じクラスに混在。タッチの符号とpointerの所有管理にも問題があった。
- ステージ切替時に破棄したメッシュをシーンから外していなかった。旧メッシュが残る問題も修正した。

## UI Changes

- 提供されたHOW TO PLAY画像とGPT_HISTORYをVisual Source of Truthにした。ホームの隠れた部分は現行HomeController.client.luaのレイアウト・色・7キューブ定義で補完した。
- 全面濃紺、巨大タイトル、横並びPLAY、抽象的なロゴを廃止。
- 白い左パネル35%、右側60%、間隔5%、角丸20px、56pxボタン、8px間隔、46px上限タイトルへ変更。
- CONTINUE / NEW GAME / STAGE SELECT / HOW TO PLAY / INVITE FRIENDSを縦に配置。後期指示に合わせて全ボタン白背景。
- PLAYER PROGRESS、タグライン、青アクセント、薄い影、7キューブのWebGLプレビュー。
- Stage SelectとHow To Playは白いモーダル。回答は白いダイアログ内の10枚の暗色カードと輪郭付き白Voxel。
- INVITE FRIENDSは見た目を再現し、押すとWeb版ではRoblox招待が利用できないことを表示。外部共有は実行しない。

## Player Changes

- InputController → PlayerController → Character → CameraControllerの役割分離。
- 単一の移動処理をThird-person / POVで共有。
- オリジナルのGeometry人型、歩行時の手足、進行方向へのスムーズな回転、梯子姿勢、正解時のジャンプと腕上げ。
- プレイヤー身長1.52、半径0.34、歩行速度3。小刻みな物理更新で低フレーム時のすり抜けを抑止。

## Camera Changes

- 初期Third-person、V/HUDボタンでPOVと往復。
- Yaw/Pitch、追従距離2.8。カメラから実際の壁・床・天井にレイを飛ばし、0.16の余裕を持って距離を短縮。
- LOOK UPの前後でmode / yaw / pitch / distance / FOVを保存復元。
- Q/Rで左右回転を補助。既存のE回答と競合させず、E/Fを回答に割当。

## Movement Fix

- 実際に存在する壁・床・天井のBoxColliderを使い、共有通路に不可視の境界を生成しない。
- 各軸の衝突解決で壁沿いに移動。ジャンプ、床・天井、ハッチを同じ物理処理で扱う。
- はしごは上下入力で昇降、左右/ジャンプで離脱。終端では階の床へ降りる。
- keydown/keyupの状態を各フレーム読み、矢印・Spaceのページスクロールを抑制。Blur、Pause、Quizで入力をリセット。
- Touchの移動と見回しをpointerIdごとに管理。

## Regression

- 31ステージのデータは変更なし。全ステージで10択、唯一の正解、正解形状と探索形状の一致を確認。
- 誤答後に探索して再回答しても、使用済み候補を復活させない。2回誤答→リトライ、正解→Reveal→Stage Clear→次へをブラウザで確認。
- 正解演出の進行をフレーム時間で制御し、SDK Pause中にフラッシュやゲーム時計が勝手に進まない構造に変更。
- SDKの保存・音声フックは維持。SDK mockでPause/Resumeの移動・時計停止を確認。
- Robloxファイルへの書き込みなし。Roblox git statusには事前から存在するHomeController.client.luaの変更のみ。

## Tests

- npm run check: 型チェック成功、48 tests passed。
- npm run build: 成功。
- Edge実ブラウザ、1440×900:
  - Home → NEW GAME → Third-person開始。
  - Third-person / POV双方で↑10秒、停止、←、→、↓、180°回転、逆方向前進、360°回転。
  - 閉じたステージの外壁では正常に停止。部屋境界を通過することを実ブラウザで確認し、8室の検証用通路では10秒で30移動することをユニットテストで確認。
  - マウスドラッグ、V切替、LOOK UPを保持してから離す。
  - 梯子に実際に歩いて接近し、昇降・離脱、Spaceジャンプと着地。
  - 誤答2回、再探索、正解、フラッシュ解除、次ステージ。
  - JS実行エラー0件。
- モバイルエミュレーション390×844 / 844×390:
  - 実タッチイベントで左スティック＋右カメラドラッグを同時操作。
  - Third-person / POVボタン、縦横リサイズで座標を保持。
- 両視点のLOOK UP復帰を20回繰り返し、カメラ行列一致をユニットテスト。
- スクリーンショットと数値証跡: docs/qa/。ブラウザ試験スクリプトは作業フォルダーwork/fidelity-*.cjs。

## Remaining differences from Roblox

- Robloxクライアント内のHome/HUD/演出は、この環境のネイティブアプリ操作では直接確認できない。ログイン済みのWebページから起動するとダウンロード案内まで進んだ既存の確認記録を引き継ぐ。
- 今回参照できるUIモックアップ/デザインガイド/修正指示はGPT_HISTORYに統合された要約と提供済み画像。別ファイルのガイドは参照フォルダー内に存在しなかった。
- アバター、髪、服、影、How To Playの図はオリジナルの簡易形状。Robloxのアセット・フォント・Trussの物理挙動そのものではない。
- Stage Selectは現行31問の分類を維持。招待は機能しない案内行。
- 実機スマホやRobloxとの移動感の一致は、Makoの比較QAに残す。忠実再現の最終PASSはまだ宣言しない。

## Mako確認（3点のみ）

1. Home/UIがRoblox版に十分似ているか。
2. Third-person / POVが意図どおりか。
3. 移動感がRoblox版に近いか。

