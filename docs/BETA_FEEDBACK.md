# βフィードバック

`VITE_BETA_FEEDBACK_ENABLED` はWeb β版でのみ `true` にする。YouTube Playables / CrazyGames は `ytgame` が存在するため自動的に無効化され、モーダル表示・メール収集・送信を行わない。

回答は `beta_feedback` に保存し、メールアドレスは `beta_feedback_contacts` にのみ保存する。Gameplay Analyticsのpayloadには含めない。両テーブルはRLSで匿名/認証済みクライアントのINSERTのみ許可し、管理者集計はServer側service roleから行う。

表示条件は通常ステージ3クリア、CUBE TEST完走、またはセッションActive Play Time 300秒以上のいずれか。Home復帰時だけ評価し、「今はしない」は24時間、同一セッションでは再表示しない。送信済みは同一匿名プレイヤーで再表示しない。
