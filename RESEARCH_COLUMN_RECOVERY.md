# Skin Research column recovery

Live diagnosis: research-v2 controlled submission 00000000-0000-4000-8000-202611210003 returned 503 without confirmed storage. Skin Research has questions A:E, gaps F:Q, Consent version R, gap S, Submission ID T, gap U and Submitted at (UTC) V. The previous research function required exact original header order.

Updated research storage resolves question/metadata columns by their names, preserves gaps and existing data, appends only missing required metadata and deduplicates/readbacks through the actual Submission ID column. Unknown question layouts and duplicate named columns remain rejected.

Activation: replace the existing Apps Script Code.gs with the complete `google-apps-script/PrimalCoreCombined.gs` in this PR; Save; edit the existing PRIMAL QUIZ deployment → New version → Deploy. Do not create a project, modify Sheet columns, change secrets or change URLs. This includes waitlist + quiz + research handlers together.

Verification pending owner deployment: retry the same controlled submission and verify exactly one readable row in Skin Research. That ID is synthetic test data and should be excluded from research analysis. No successful live write was observed during preparation.
