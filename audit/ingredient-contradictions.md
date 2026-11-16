# Ingredient consistency review

Scope: whole-repository search for tallow/ταλόου/στέαρ, mastic/μαστίχ, jojoba/τζοτζόμπα, olive/ελαιόλαδο, beeswax/κερί, vitamin E/βιταμίνη, INCI, ingredient counts and numeric percentages. Historical audit inventories retain the before-copy; generated output repeats source. CSS opacity, layout and video-progress percentages are presentation values, not formula facts.

| Location | Finding | Disposition |
|---|---|---|
| `public/index.html:3` | Provisional display lists tallow, mastic oil, beeswax, jojoba and vitamin E. Final lab-approved INCI/percentages are unavailable. | “Σύνθεση με λίγα, γνωστά συστατικά”; explicit owner TODOs. No asserted four/five-ingredient final formula. |
| `public/blog/tallow-science.html:3` | Old 46–55% fatty-acid range was unsourced. | Replaced by neutral laboratory-confirmation limitation; no invented replacement percentage. |
| `public/en/index.html:3` | Existing English “Just 5 ingredients. Nothing else” and five-ingredient accessible labels are unreconciled with provisional Greek wording. | Existing English is unreviewed, noindexed and excluded from sitemap. No new English copy authored; owner translation/formula review required before indexing. |
| `public/en/blog/tallow-science.html:3` | Existing English 46–55% range is not supported by supplied lab evidence. | Existing English draft retained under the no-new-English constraint; noindex, excluded from sitemap. Remove/approve during separately authorized English review. |
| Greek/English history and ingredient articles | Olive oil appears in historical recipes or comparisons, while current provisional product copy uses jojoba. | Do not treat those historical references as the final formula. No supplied approved INCI establishes an olive-oil substitution. |
| Older sections of `DESIGN.md`, `REVIEW.md`, previous `AUDIT_REPORT.md` in Git history | Earlier instructions/copy described a fixed five ingredients and stronger benefits. | Superseded by the latest audit request and claim ledger. Current DESIGN notice explicitly gives audit wording priority. These are documentation, not lab evidence. |
| Repository search for four-ingredient formula | No current Greek product claim establishing a four-ingredient final INCI found. | Do not infer a final ingredient count. |

Owner must supply final approved INCI, ingredient roles/percentages, product size and substantiation for sensory claims. No PDO/certification or clinical results have been inferred.
