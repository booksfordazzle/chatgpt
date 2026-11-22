# PRIMAL CORE Skin Profile results

The quiz finishes at `/skin-profile#result` for every outcome. The existing per-tab navigation state restores the selected outcome on refresh and Back/Forward. The URL contains no answers, email address, or personalized result identifier.

| Quiz ID | Existing outcome | Editorial outcome |
| --- | --- | --- |
| C | CALM | CALM |
| M | RESTORE | HYDRATE |
| A | ENDURE | SMOOTH |
| B | BALANCE | BALANCE |
| E | ESSENTIAL | ESSENTIAL |

The scoring engine and the internal IDs used by the existing Sheets flows are unchanged. E means the visitor chose a simpler routine. PROTECT is implemented as a renderable template and requires an approved quiz mapping for automatic presentation. RESET is outside the five-template brief.

## Photography

All mappings below use the supplied PNGs. Website variants are 600 × 450 and 1200 × 900 WebP. Email uses an 800 × 600 JPEG, displayed at a maximum of 600 × 450. Shared photographs use one asset path across profiles.

| Profile | Position | Source | Asset path under `public/images/skin-profiles/` |
| --- | --- | --- | --- |
| CALM | Hero | Zen Rocks in Rippling Water-4.png | `shared/rippling-water` |
| CALM | Before general information | Mediterranean Rocks and Rippling Water-6.png | `calm/mediterranean-rocks` |
| CALM | Before recommendations | Cream Balm on Volcanic Stone-1.png | `calm/balm-on-volcanic-stone` |
| CALM | Before expectations | Monochrome Stones with Water Droplets-2.png | `shared/water-droplets` |
| CALM | Before morning/evening routine | Monochrome Stone in Still Water-5.png | `hydrate/stone-in-still-water` |
| CALM | Before ingredients | Translucent Crystalline Layers in Monochrome-3.png | `shared/crystalline-layers` |
| HYDRATE | Hero | Monochrome Stone in Still Water-5.png | `hydrate/stone-in-still-water` |
| HYDRATE | Before general information | Zen Rocks in Rippling Water-4.png | `shared/rippling-water` |
| HYDRATE | Before ingredients | Monochrome Stones with Water Droplets-2.png | `shared/water-droplets` |
| SMOOTH | Hero | central image.png | `smooth/fingerprint-texture` |
| SMOOTH | Before recommendations | Monochrome Stone in Still Water-5.png | `hydrate/stone-in-still-water` |
| SMOOTH | Before ingredients | Translucent Crystalline Layers in Monochrome-3.png | `shared/crystalline-layers` |
| BALANCE | Hero | balance.png | `balance/balanced-stones` |
| BALANCE | Before general information | Zen Rocks in Rippling Water-4.png | `shared/rippling-water` |
| BALANCE | Before morning/evening routine | Monochrome Stones with Water Droplets-2.png | `shared/water-droplets` |
| PROTECT | Hero | endure.png | `protect/layered-rock` |
| PROTECT | Before general information | Mediterranean Rocks and Rippling Water-6.png | `calm/mediterranean-rocks` |
| PROTECT | Before ingredients | Translucent Crystalline Layers in Monochrome-3.png | `shared/crystalline-layers` |
| ESSENTIAL | Hero | essential.png | `shared/essential-stone` |

The CALM hero brief called for flowing water over volcanic stone. The supplied photograph of rippling water around dark rocks is the closest available match.

## Copy decisions

The five supplied editorial templates keep their Greek educational sections and individual medical disclaimers. The website continues to show the explanation derived from the actual answers. The four edits below apply to the introductions in both formats.

- CALM removes the sentence beginning «Ανέφερες κάψιμο…» from the shared introduction. The website's answer-specific explanation still identifies a reported symptom when the visitor selected it.
- HYDRATE uses «Η αίσθηση τραβήγματος μπορεί να εμφανιστεί λίγα λεπτά μετά το πλύσιμο του προσώπου.» A visitor can reach HYDRATE by choosing softness or radiance.
- SMOOTH links the visitor's choice to fine lines and presents texture and elasticity as educational topics. The scoring question records concern about fine lines and wrinkles.
- BALANCE says shine and heavy-feeling creams can occur. Its scoring answer establishes a preference for oil balance.

## Email delivery and verification

The existing results form requests separate consent to deliver the result. It sends the calculated result IDs and routine flags, the attempt ID, and the entered address to `POST /api/skin-profile`. The existing Vercel handler validates the request and sends one HTML/plain-text message through the configured SMTP transport. The website, subject, preheader, HTML, and plain-text alternative use the same selected profile. Photographs are public HTTPS JPEGs at `SITE_URL`, which defaults to `https://primalcore.gr`. The Sheets receipt remains downstream of SMTP acceptance. A confirmed SMTP acceptance disables resending for the same attempt in the current tab, including after reload. The existing service does not guarantee exactly-once delivery across different tabs, clients or ambiguous SMTP failures.

To verify deployment, confirm that the public `SITE_URL` serves the JPEGs over HTTPS without sign-in, and test a consented email through the existing configured SMTP and Sheets integrations. For local template review, import `renderSkinResultMessage` from `server/skin-result-template.mjs` with a profile from `public/skin-profile/editorial-copy.mjs`; the return value includes HTML, plain text, and subject.

Local checks cover the production build, automated regression suite, all current quiz results at 320, 768 and 1440 px in Chromium, and the consent, failed-send retry and refresh behavior with a mocked endpoint. SMTP delivery, public production image URLs and native email clients require deployment or service access.
