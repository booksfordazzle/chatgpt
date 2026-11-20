# Skin Profile decision audit — 20 November 2026

This is a deterministic educational care-priority guide. It is not a validated diagnostic instrument, a measured skin-type classification, or a clinical risk score. The implementation checks below establish behavior and traceability, not clinical validity. General dermatology source links support the advice; they do not validate this questionnaire or its thresholds.

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

`scripts/audit-skin-routing.mjs` evaluated all 4,608,000 full ten-answer combinations: zero invalid results and zero CALM results outside the declared goal/precaution conditions. Counts are M921600, A460800, C2304000, B460800, E460800, under artificial equally enumerated options only; these are not user prevalence statistics or clinical evidence. `tests/browser/skin-revisions.cjs` exercised the fetched Drive index with both discomfort flags initially selected, then revised via the actual Back/Next controls: clearing both produced BALANCE, retaining only either flag produced CALM with the matching explanation, and clearing both/changing the goal produced ESSENTIAL. No stale discomfort answers reproduced. No runtime thresholds changed in this follow-up.
