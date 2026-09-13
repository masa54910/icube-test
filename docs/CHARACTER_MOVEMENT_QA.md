# Character + Roblox Movement Fidelity

Status: READY FOR USER QA

## 今回の変更

滑らかな頭・首・胸・腰と、肩／肘／膝を持つ自作人型へ置換。呼吸、骨盤の上下動と捻り、上半身・頭の連動、交互の腕脚運動、旋回時の踏み替えを追加しました。14,944三角形、外部アセット・テクスチャ追加なし。

第三者視点のA/D・左右矢印は平行移動ではなく、押している間の連続旋回。W／↑は身体基準の前進、W＋左右でカーブ。S／↓は押し始めに180°向き直り、完了後その方向へ前進します。押し続けても繰り返し反転しません。S＋左右も旋回できます。

通常旋回1.8 rad/s、反転5.5 rad/s。これは調整可能な初期値で、Roblox実機の測定値ではありません。参照したRobloxコードには明示的な旋回速度が見つからず、実ゲームの操作比較は未実施です。ユーザー指定の挙動を基準に実装しています。

PlayerControllerが移動・身体向きを所有し、Characterは状態を描画するだけです。カメラは身体Yawへ指数補間で追従。POVはカメラ基準の移動を維持し、第三者視点へ戻る時に向きを揃えます。

## 検証

- 型検査・58テスト PASS（既存48＋今回10）。60／120／144Hzの旋回量一致、左右カーブ、Sの反転・継続、S＋旋回、カメラ遅延、非Box造形と関節動作。
- Edgeブラウザ自動操作19項目 PASS。W／↑、A／←、D／→、左右360°、W+A/D、180°後W、S／↓・S+A/Dの進行整合、POVと復帰、両視点LOOK UP復帰、壁衝突と反転。詳細: [results.json](character-qa/results.json)。
- 梯子昇降・離脱、ジャンプ PASS。[記録](character-qa/ladder-results.json)。
- 回答地点への移動、10択、不正解後の試行回数と選択済み状態の保持、Stage1正解・演出から結果画面への遷移 PASS。
- 本番ビルド起動、視点切替、開発専用QAフックが本番にないこと PASS。ブラウザ実行時エラーなし。
- 本番ビルド成功。JSは546.76 kB（gzip142.23 kB）、Viteの500 kBチャンク警告あり。モバイル実機FPS・YouTube公式認証は今回の検証対象外です。
- Home UI／CSS／31問データ／SDKは変更前後SHA256一致。Roblox側への書き込みなし（既存HomeController変更は保持）。

## 画像

[背面](character-qa/character-back.png) · [方向転換中](character-qa/character-turn.png) · [反転後](character-qa/character-reversed.png) · [右カーブ後](character-qa/walk-d.png)

## ユーザー確認

1. キャラクターが十分自然になったか。
2. A/D・←/→の長押し旋回がRoblox版に近いか。
3. W＋左右キーで自然に曲がれるか。
4. S／↓で正面をこちらへ向けたまま後退する違和感がなくなったか。

自然さとRoblox版の操作感の最終判定はユーザーQA待ちです。
