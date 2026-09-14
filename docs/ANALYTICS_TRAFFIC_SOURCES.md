# Traffic Source Analytics

`session_start` records the first-touch attribution for that browser session. UTM parameters take precedence over the referrer; without UTM, recognized search/social/video hosts are classified and other hosts become `referral`.

Recommended campaign URLs:

- X: `https://icube-test.vercel.app/?utm_source=x&utm_medium=social&utm_campaign=beta`
- note: `https://icube-test.vercel.app/?utm_source=note&utm_medium=article&utm_campaign=beta`
- YouTube: `https://icube-test.vercel.app/?utm_source=youtube&utm_medium=video&utm_campaign=beta`

Only the referrer hostname and landing pathname are retained; query strings and fragments are not stored. Localhost sessions remain `is_test=true` and are excluded from Production Admin Analytics.
