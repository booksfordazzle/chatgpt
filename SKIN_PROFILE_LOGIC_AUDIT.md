# Skin Profile decision audit — 20 November 2026

## Current mobile viewport/scroll architecture — review branch

This supersedes the earlier fixed-control/page-scroll description. At 900px and below, bind the body to `visualViewport.height` through a root variable and hide outer overflow. Header and main fill the available height. Quiz/research forms are flex layouts: `#question-content` and `.profile-study-content` scroll internally, while arrow controls remain static, non-shrinking flex children outside the content scroller, with 18px safe-area spacing. Keep the audio header visible. Hide the footer only during active mobile questions; restore it on landing/results. `show` toggles `is-question-view`, and focus resets the inner scroll position.

The owner's live Brave-on-iPhone cutoff report concerns the older live version. This fix is staged on `codex/skin-profile-mobile`, not live; a physical iPhone Brave test has not been performed. Available WebKit runtime checks passed with local dependencies and `PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS=1`; this is not native-device evidence. Chromium and WebKit checks passed all 15 cards at 320×568, 390×844, 430×932 and 768×1024, plus a simulated 600px visual viewport. All 117 unit tests pass. The final eight-width full flow passed at `/tmp/viewport-full-flow.log`. WebKit touch-context checks also passed rotation to 844×390 and simulated visual-viewport shrink to 600px.

The supplied image ZIP contains all 15 numbered JPGs plus the unused duplicate `14.png`; all 15 are in place and no missing-asset dependency remains. No deployment, Sheets writes, backend changes, staging or other edits are part of this documentation update.


## Supplied numbered images — current mobile draft

The owner supplied `/workspace/attachments/6b5bf82b-594f-47ed-9455-844c600675df/images.zip`. All numbered `1.jpg`–`15.jpg` now replace the question/research imagery: 30 full/small WebP exports with native dimensions and 1200px maximum-width metadata updated. There is no Q1 fallback and missing frame images no longer block this draft. The duplicate portrait `14.png` is ignored in favor of landscape `14.jpg`. Mobile uses CSS focal positions to crop the 4:3 sources to 16:9; desktop retains photo left/text right. The new `15.jpg` silver tin supersedes the previous matte-jar question image, as communicated to the owner. The five result portraits and separate research/marketing tin are preserved.

Current verification: 117 unit tests pass, including 2,688 valid multi-selection combinations. Full eight-width confirmation passed after correcting desktop CTA-related height growth by stretching both image containers. Fresh all-15 mobile image checks passed in Chromium and WebKit. This is still the un-deployed `codex/skin-profile-mobile` branch; no Sheets write, backend change, global edit or staging occurred. Legacy exhaustive single-answer coverage remains distinct from the new multi-select checks.


This is a deterministic educational care-priority guide. It is not a validated diagnostic instrument, a measured skin-type classification, or a clinical risk score. The implementation checks below establish behavior and traceability, not clinical validity. General dermatology source links support the advice; they do not validate this questionnaire or its thresholds.

## Current multi-select draft scope

`codex/skin-profile-mobile` adds arrays only for Q02/Q07 while accepting legacy numeric answers. Q02 permits zero-based pairs [1,3]/[2,3], max two; comfortable 0 and unknown 4 are exclusive, and 1/2 cannot coexist. Q07 permits subsets of 0–3 with unknown 4 exclusive. Q04/Q06 remain single-select. Q02 containing 3 triggers the existing CALM precaution; cleanser habits use any selected soap/scrub, and explanations quote/join actual selections. These are educational rules, not diagnostic scoring.

The 116-test and five-outcome UI checks pass for this review-only branch. The exhaustive 4,608,000 legacy single-answer combinations and 120-combination counts below do not establish exhaustive coverage or distribution for the expanded array state space. No clinical validity or fake probabilities are claimed. This branch is pending review and not live.

## The five reachable outcomes

| Outcome | Base priority from Q04 |
| --- | --- |
| RESTORE | Less dryness, or softness/natural glow |
| ENDURE | Appearance of fine lines and wrinkles |
| CALM | Less discomfort from products |
| BALANCE | Oiliness balance |
| ESSENTIAL | A simpler routine |

Reported burning/stinging after washing (Q02 option 4) OR frequent burning/irritation with new products (Q06 option 3) prioritizes CALM over the selected Q04 goal. This is an editorial precaution to favor gentle care, not a diagnosis of sensitivity, allergy or barrier damage. Occasional discomfort alone does not override the goal. Removing this precaution merely to equalize outcome counts would not improve validity.

The previous logic was not hardcoded to CALM. All five outcomes are reachable through the actual ten-question UI. Of the 120 artificially equally weighted Q02×Q04×Q06 combinations, 60 route to CALM, 24 to RESTORE, and 12 each to ENDURE/BALANCE/ESSENTIAL. This explains structural prominence; it is not a measured user distribution, prevalence, accuracy or sensitivity statistic.

## What the ten questions actually do

- Q01: adult age-group context; no age-based diagnosis, automatic anti-aging route or active-ingredient prescription. It does not determine the result.
- Q02: after-wash sensation; strong discomfort precaution and an explicitly quoted observation.
- Q03: daytime sensation; quoted experience and secondary internal moisture/balance context, not a laboratory determination of skin type.
- Q04: the user's selected care priority, forming the base direction.
- Q05: reported fine-line context; conditional educational explanation distinguishing dryness-related appearance from promises to remove wrinkles.
- Q06: product tolerance; frequent discomfort precaution, or cautious new-product advice for occasional discomfort. Never claims unreported burning.
- Q07: cleanser habits; advises reconsidering common soap/body wash/frequent scrub only when selected.
- Q08: moisturizer consistency; conditional routine guidance.
- Q09: sun-protection habit; conditional photo-protection guidance.
- Q10: routine satisfaction/complexity; preserves already tolerated routines or recommends clarification/simplification without assuming a new purchase is necessary.

There are no invented numerical weights, probabilities, scores, measured hydration values or equal-distribution quotas. A primary result does not require every question to influence its label. The explanations now make the actual reported signals and routine inputs visible in the first closed disclosure. They are generated from this session's in-memory answers; no raw quiz answers or result are sent to the research endpoint.

## Corrections in this pass

1. Intro uses the owner's explicit line break, with the superseded question subtitle removed.
2. The first result disclosure is answer-specific. A CALM result selected through Q04 alone no longer uses the generic explanation that implies reported burning/frequent irritation.
3. Unknown observations remain explicitly unknown; occasional discomfort never silently becomes frequent irritation.
4. No primary-routing thresholds changed or silently rebalanced.

## Verification

- Exhaustive assertions for all 120 primary-routing combinations; every outcome is reachable.
- 1,920 combinations of age/cleanser/moisturizer/sunscreen/satisfaction with occasional discomfort preserve the chosen moisture priority.
- Explanation tests distinguish washing discomfort, frequent new-product reactions, goal-only CALM, occasional discomfort, unknown observations and actual habits.
- All five outcomes completed through all ten real questions at both 390px and 1440px, with four initially closed disclosures, correct headings, no submissions, no browser errors or horizontal overflow.
- The full unit suite and production build pass. These are software checks; clinical validation and real-user calibration have not been performed.

The original ten-question structure remains as requested. Claims such as “clinically validated”, “dermatologist approved”, “diagnoses your skin” or a treatment/product suitability guarantee must not be attached to this quiz without appropriate evidence and professional review.

## Reproduction against the delivered Drive ZIP

After the owner again reported only CALM, the exact Drive ZIP was fetched back through the connector and extracted into an isolated workspace folder. The fetched index.html SHA-256 matches the packaged local index.html. `tests/browser/skin-outcomes.cjs` now also accepts PREVIEW_FILE so this delivered offline file can be exercised rather than only the source route. All five outcomes passed through the ten-question UI at 390px and 1440px against that downloaded artifact. The always-CALM report has not been reproduced; the exact file/link and Q02/Q04/Q06 answers are requested. No routing thresholds have been changed based on an unconfirmed reproduction.

## Exhaustive follow-up check

`scripts/audit-skin-routing.mjs` evaluated all 4,608,000 legacy single-answer ten-question combinations: zero invalid results and zero CALM results outside the declared goal/precaution conditions. Counts are M921600, A460800, C2304000, B460800, E460800, under artificial equally enumerated options only; these are not user prevalence statistics or clinical evidence. `tests/browser/skin-revisions.cjs` exercised the fetched Drive index with both discomfort flags initially selected, then revised via the actual Back/Next controls: clearing both produced BALANCE, retaining only either flag produced CALM with the matching explanation, and clearing both/changing the goal produced ESSENTIAL. No stale discomfort answers reproduced. No runtime thresholds changed in this follow-up.
