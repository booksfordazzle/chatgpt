# Welcome confirmation email

Mode: Persuade / confirmation. This surface confirms an existing consented launch-update registration. The owner's black-and-white BECYCLE campaign reference informs this email only; the website's V.1 design and behavior remain unchanged.

Use one centered image wordmark from `public/assets/home-wordmark.jpg` (CID `primal-core-logo`), with no separate bull or textual brand. Keep generous vertical spacing, the ivory “Καλώς ήρθες” / “Welcome” heading and the existing real closed-jar photograph. Subject and plain-text greeting match the welcome heading. Follow with the existing launch-update promise, an outlined return-to-site CTA, and the product-development disclosure. No offers, discounts, invented claims or social placeholders.

Email-local colors: background #000000 (matching the supplied wordmark), foreground #f1f0e9, muted #b4b5ae. Center a maximum 600px composition. Use presentation tables and inline styles, with responsive overrides for narrow screens: 24px side padding and 36px heading below 620px; 20px side padding and 30px heading below 360px. Preserve readable layout at 320px, 390px and desktop widths. These rules do not replace shared website tokens or typography.

Use the supplied wordmark (`public/assets/home-wordmark.jpg`) and closed-jar photograph (`public/assets/product-gallery-1-1.jpg`) as two inline CID image buffers. Provide meaningful product alt text and the existing plain-text alternative. No remote imagery or tracking. Sender and Reply-To remain hello@primalcore.gr. The footer retains privacy/contact links, MMTX E.E and the supplied address, plus reply-to-withdraw instructions. Withdrawal is manual: the owner must process replies before further campaigns.

Set Google Sans explicitly on the heading and message, loading the self-hosted `GoogleSans.woff2` with font-only CORS in `vercel.json`. Preserve Arial/Helvetica fallbacks and the Outlook fallback. Gmail webfont support is not guaranteed; fallback rendering must remain readable.

Implementation lives in `server/welcome-template.mjs`; `server/welcome-email.mjs` retains the SMTP message and plain-text alternative. `scripts/preview-welcome-email.mjs` generates self-contained `previews/welcome-el.html` and `previews/welcome-en.html` without sending mail. The existing authenticated Sheet claim flow, registration handling and Google Apps Script remain unchanged. With the existing SMTP flow configured, deploying the template through Vercel updates future messages; this visual revision requires no Apps Script editing.

Review evidence: the latest Greek and English screenshots replace the previous previews at the same paths. All 71 tests and layout checks at 320px, 390px and 1440px passed. Browser previews are not real inbox validation; received rendering, font fallback, image handling and delivery still require controlled mailbox checks.
