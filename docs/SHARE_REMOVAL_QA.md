# Share機能削除 QA

2026-09-11 — YouTube向け。以前のShare Gate・Home資料にある共有仕様より本記録を優先する。

## 変更

- HomeをCONTINUE / NEW GAME / STAGE SELECT / HOW TO PLAYの4ボタンに変更。
- Shareアイコン・コピー・モーダル・サービス・SNS処理・クリップボード処理・Challenge URL生成／Landingを削除。
- ResultはNEXT STAGE / RETRY / STAGE SELECT。全問完了時は従来どおりNEXT STAGEなし。
- メニューを縦中央に配置し、PLAYER PROGRESSとの間隔を固定。正式日本語コピーは維持。
- 未完成Share専用のソース6ファイルとテスト1ファイルを削除。旧設計資料は保持。

## 確認結果

- 型検査・既存85テスト：PASS。
- 配布ビルド：PASS（既存の500 kBチャンク警告あり）。
- Edge自動ブラウザ検証：1920×1080 / 1366×768 / 1024×768 / 390×844 / 844×390。メニューと進捗間隔30 px以内。
- Home4ボタン、Hover / Press、Help、Stage Select：PASS。
- 旧stage/time/attemptsクエリで通常Home表示：PASS。
- NEW GAME → 探索 → 10択 → 正解 → Result3ボタン：PASS、実行時エラーなし。
- Home / Help / Stage Select / ResultのDOM：共有UI・リンク要素なし。
- src / distの共有API・SNS Intent・コピー・Challenge処理検索：該当なし。
- ゲーム・ステージ・SDK・正解演出・Cubie PNGなど15ファイル：保存済みSHA-256と一致。
- Roblox版は今回未変更。既存HomeControllerのユーザー変更はそのまま保持。
- YouTube SDKの外部スクリプトは必要なSDKロードとして維持。外部サイトへのクリック導線ではない。

実機モバイルでの手動QAは未実施（画面サイズはブラウザで検証）。

## 将来の方針

- YouTube：Share OFF。
- Standalone Web：Share optional。
- CrazyGames：Platform requirements確認後判断。

公開・SDK変更は行っていない。ローカルサーバーは継続稼働。
