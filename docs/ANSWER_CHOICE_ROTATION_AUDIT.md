# Answer choice rotation audit

Indexes are 1-based, before runtime shuffle. Every set retains 10 choices. Proper rotations only, no reflections.

|Stage|Revision|Choices|Duplicate before|After|
|---|---|---:|---|---|
|stage_1_1|catalog/archive|10|[[4,5],[1,10]]|None|
|stage_1_2|catalog/archive|10|[[4,5],[1,10]]|None|
|stage_1_3|catalog/archive|10|[[4,5],[1,10]]|None|
|stage_1_4|catalog/archive|10|[[4,5],[1,10]]|None|
|stage_1_5|catalog/archive|10|[[4,5],[1,10]]|None|
|stage_1_6|catalog/archive|10|[[4,5],[1,10]]|None|
|stage_1_7|catalog/archive|10|[[4,5],[1,10]]|None|
|stage_1_8|catalog/archive|10|[[4,5],[1,10]]|None|
|stage_1_9|catalog/archive|10|[[4,5],[1,10]]|None|
|stage_1_10|catalog/archive|10|[[4,5],[1,10]]|None|
|stage_2_1|catalog/archive|10|[[3,6],[7,10]]|None|
|stage_2_2|catalog/archive|10|[[3,6],[7,10]]|None|
|stage_2_3|catalog/archive|10|[[3,6],[7,10]]|None|
|stage_2_4|catalog/archive|10|[[3,6],[7,10]]|None|
|stage_2_5|catalog/archive|10|[[3,6],[7,10]]|None|
|stage_2_6|catalog/archive|10|[[3,6],[7,10]]|None|
|stage_2_7|catalog/archive|10|[[3,6],[7,10]]|None|
|stage_2_8|catalog/archive|10|[[3,6],[7,10]]|None|
|stage_2_9|catalog/archive|10|[[3,6],[7,10]]|None|
|stage_2_10|catalog/archive|10|[[3,6],[7,10]]|None|
|stage_3_1|catalog/archive|10|None|None|
|stage_3_2|catalog/archive|10|None|None|
|stage_3_3|catalog/archive|10|None|None|
|stage_3_4|catalog/archive|10|[[2,10]]|None|
|stage_3_5|catalog/archive|10|[[3,4]]|None|
|stage_3_6|catalog/archive|10|None|None|
|stage_3_7|catalog/archive|10|None|None|
|stage_3_8|catalog/archive|10|None|None|
|stage_3_9|catalog/archive|10|None|None|
|stage_3_10|catalog/archive|10|None|None|
|stage_3_11|catalog/archive|10|None|None|
|advanced-route1-1|catalog/archive|10|None|None|
|advanced-route1-2|catalog/archive|10|None|None|
|advanced-route1-3|catalog/archive|10|None|None|
|advanced-route1-4|catalog/archive|10|None|None|
|advanced-route1-5|catalog/archive|10|None|None|
|advanced-route1-6|catalog/archive|10|None|None|
|advanced-route1-7|catalog/archive|10|None|None|
|advanced-route1-8|catalog/archive|10|None|None|
|advanced-route1-9|catalog/archive|10|None|None|
|advanced-route1-10|catalog/archive|10|None|None|
|advanced_route_1|catalog/archive|10|None|None|
|advanced_route_2|catalog/archive|10|None|None|
|advanced_route_3|catalog/archive|10|None|None|
|test-set-a-q1|TEST current|10|None|None|
|test-set-a-q2|TEST current|10|None|None|
|test-set-a-q3|TEST current|10|None|None|
|test-set-a-q4|TEST current|10|None|None|
|test-set-a-q5|TEST current|10|None|None|
|test-set-a-q1|TEST v2|10|None|None|
|test-set-a-q2|TEST v2|10|None|None|
|test-set-a-q3|TEST v2|10|None|None|
|test-set-a-q4|TEST v2|10|None|None|
|test-set-a-q5|TEST v2|10|None|None|
|test-set-a-q1|TEST legacy|10|None|None|
|test-set-a-q2|TEST legacy|10|None|None|
|test-set-a-q3|TEST legacy|10|None|None|
|test-set-a-q4|TEST legacy|10|None|None|
|test-set-a-q5|TEST legacy|10|None|None|

Current and historical TEST Q3 had no rotation-equivalent duplicates in this checkout. The reported Q3 issue could not be reproduced; do not attribute it to a fixed bug without the original build/choices. All 59 sets are protected by tests/choice-audit.test.ts, which logs canonical keys and asserts uniqueness.
