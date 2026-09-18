# 全ステージ正解形の実ステージ直結

正本: WorldBuilderが使用するstage.rooms。SPECIALはstage.colorsを同じ添字で保持。正解ID・シャッフルseedは変更なし。

## 結果

64件（現行・アーカイブ・CUBE TEST旧バージョン別）で一致選択肢は1つ、正解指定と一致。既存の回転同値重複監査もPASS。770 tests / 56 files PASS。

SPECIAL 3・4の元データは既にrooms由来で、今回データ不一致を再現していません。ユーザー報告の見た目の不一致が解消したとは未判定です。描画・実プレイ確認は未完了。

## 変更

共通getStageCanonicalShapeを追加。正解スロットはステージ座標から再設定。NORMALの文字／数字テンプレート、ROUTEのmemoキャッシュを正解の正本にしない。SPECIALの位置と色の対応を維持。24回転・平行移動・重複検査は既存比較エンジンを使用。

## 全対象正解一覧

表示番号はGame.tsと同一numericId seedでのシャッフル後、1始まり。

| 系統 | Stage | 正解ID | 表示番号 | Cube数 | 実形一致 | 色一致 |
|---|---|---|---:|---:|---|---|
| catalog | stage_1_1 | letter-C | 6 | 13 | PASS | 対象外 |
| catalog | stage_1_2 | letter-E | 8 | 17 | PASS | 対象外 |
| catalog | stage_1_3 | letter-F | 10 | 13 | PASS | 対象外 |
| catalog | stage_1_4 | letter-H | 5 | 13 | PASS | 対象外 |
| catalog | stage_1_5 | letter-I | 6 | 13 | PASS | 対象外 |
| catalog | stage_1_6 | letter-L | 1 | 12 | PASS | 対象外 |
| catalog | stage_1_7 | letter-O | 7 | 16 | PASS | 対象外 |
| catalog | stage_1_8 | letter-P | 3 | 14 | PASS | 対象外 |
| catalog | stage_1_9 | letter-T | 7 | 13 | PASS | 対象外 |
| catalog | stage_1_10 | letter-U | 4 | 13 | PASS | 対象外 |
| catalog | stage_2_1 | digit-0 | 7 | 12 | PASS | 対象外 |
| catalog | stage_2_2 | digit-1 | 3 | 4 | PASS | 対象外 |
| catalog | stage_2_3 | digit-2 | 10 | 11 | PASS | 対象外 |
| catalog | stage_2_4 | digit-3 | 8 | 11 | PASS | 対象外 |
| catalog | stage_2_5 | digit-4 | 5 | 8 | PASS | 対象外 |
| catalog | stage_2_6 | digit-5 | 4 | 11 | PASS | 対象外 |
| catalog | stage_2_7 | digit-6 | 4 | 12 | PASS | 対象外 |
| catalog | stage_2_8 | digit-7 | 2 | 6 | PASS | 対象外 |
| catalog | stage_2_9 | digit-8 | 6 | 13 | PASS | 対象外 |
| catalog | stage_2_10 | digit-9 | 7 | 12 | PASS | 対象外 |
| catalog | stage_3_1 | correct | 2 | 12 | PASS | 対象外 |
| catalog | stage_3_2 | correct | 6 | 8 | PASS | 対象外 |
| catalog | stage_3_3 | correct | 2 | 10 | PASS | 対象外 |
| catalog | stage_3_4 | correct | 1 | 12 | PASS | 対象外 |
| catalog | stage_3_5 | correct | 6 | 13 | PASS | 対象外 |
| catalog | stage_3_6 | correct | 5 | 14 | PASS | 対象外 |
| catalog | stage_3_7 | correct | 2 | 15 | PASS | 対象外 |
| catalog | stage_3_8 | correct | 6 | 18 | PASS | 対象外 |
| catalog | stage_3_9 | correct | 3 | 11 | PASS | 対象外 |
| catalog | stage_3_10 | correct | 5 | 19 | PASS | 対象外 |
| catalog | stage_3_11 | correct | 9 | 12 | PASS | 対象外 |
| catalog | advanced-route1-1 | correct | 5 | 17 | PASS | 対象外 |
| catalog | advanced-route1-2 | correct | 3 | 22 | PASS | 対象外 |
| catalog | advanced-route1-3 | correct | 6 | 26 | PASS | 対象外 |
| catalog | advanced-route1-4 | correct | 8 | 23 | PASS | 対象外 |
| catalog | advanced-route1-5 | correct | 5 | 26 | PASS | 対象外 |
| catalog | advanced-route1-6 | correct | 6 | 28 | PASS | 対象外 |
| catalog | advanced-route1-7 | correct | 8 | 29 | PASS | 対象外 |
| catalog | advanced-route1-8 | correct | 9 | 29 | PASS | 対象外 |
| catalog | advanced-route1-9 | correct | 6 | 28 | PASS | 対象外 |
| catalog | advanced-route1-10 | correct | 2 | 36 | PASS | 対象外 |
| catalog | special-1 | correct | 2 | 4 | PASS | PASS |
| catalog | special-2 | correct | 1 | 5 | PASS | PASS |
| catalog | special-3 | correct | 4 | 6 | PASS | PASS |
| catalog | special-4 | correct | 1 | 7 | PASS | PASS |
| catalog | special-5 | correct | 9 | 9 | PASS | PASS |
| archive | advanced_route_1 | correct | 4 | 16 | PASS | 対象外 |
| archive | advanced_route_2 | correct | 2 | 24 | PASS | 対象外 |
| archive | advanced_route_3 | correct | 8 | 33 | PASS | 対象外 |
| test | test-set-a-q1 | correct | 7 | 10 | PASS | 対象外 |
| test | test-set-a-q2 | correct | 6 | 9 | PASS | 対象外 |
| test | test-set-a-q3 | correct | 1 | 16 | PASS | 対象外 |
| test | test-set-a-q4 | correct | 5 | 19 | PASS | 対象外 |
| test | test-set-a-q5 | correct | 6 | 21 | PASS | 対象外 |
| test-v2 | test-set-a-q1 | correct | 7 | 10 | PASS | 対象外 |
| test-v2 | test-set-a-q2 | correct | 6 | 13 | PASS | 対象外 |
| test-v2 | test-set-a-q3 | correct | 1 | 16 | PASS | 対象外 |
| test-v2 | test-set-a-q4 | correct | 5 | 19 | PASS | 対象外 |
| test-v2 | test-set-a-q5 | correct | 6 | 21 | PASS | 対象外 |
| test-legacy | test-set-a-q1 | correct | 7 | 10 | PASS | 対象外 |
| test-legacy | test-set-a-q2 | correct | 6 | 14 | PASS | 対象外 |
| test-legacy | test-set-a-q3 | correct | 1 | 18 | PASS | 対象外 |
| test-legacy | test-set-a-q4 | correct | 5 | 24 | PASS | 対象外 |
| test-legacy | test-set-a-q5 | correct | 6 | 26 | PASS | 対象外 |

## 未実施

## Build

Web / Playables / CrazyGamesの3ビルドすべてPASS。既存の500kB超chunk警告あり。

Commit・Push・Deployなし。全ステージの手動起動・回答画面・CUBE TEST完走のブラウザ回帰は未実施。したがって視覚的不一致を含む元のGate全体は未完了。
