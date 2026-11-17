# Welcome confirmation email

Mode: Persuade / confirmation. This surface confirms an existing consented launch-update registration. The owner's black-and-white BECYCLE campaign reference informs this email only; the website's V.1 design and behavior remain unchanged.

Keep the centered bull symbol and PRIMAL CORE name, generous vertical spacing, ivory Georgia serif thank-you heading (“Σε ευχαριστούμε για την εμπιστοσύνη.” / “Thank you for your trust.”), and the existing real closed-jar photograph. Follow with the existing launch-update promise, an outlined return-to-site CTA, and the product-development disclosure. No offers, discounts, invented claims or social placeholders.

Email-local colors: background #101010, foreground #f1f0e9, muted #b4b5ae. Center a maximum 600px composition. Use presentation tables and inline styles, with responsive overrides for narrow screens: 24px side padding and 36px heading below 620px; 20px side padding and 30px heading below 360px. Preserve readable layout at 320px, 390px and desktop widths. These rules do not replace shared website tokens or typography.

Use the existing bull asset (`public/apple-touch-icon.png`) and closed-jar photograph (`public/assets/product-gallery-1-1.jpg`) as two inline CID image buffers. Provide meaningful product alt text and the existing plain-text alternative. No remote imagery or tracking. Sender and Reply-To remain hello@primalcore.gr. The footer retains privacy/contact links, MMTX E.E and the supplied address, plus reply-to-withdraw instructions. Withdrawal is manual: the owner must process replies before further campaigns.

Implementation lives in `server/welcome-template.mjs`; `server/welcome-email.mjs` retains the SMTP message and plain-text alternative. `scripts/preview-welcome-email.mjs` generates self-contained `previews/welcome-el.html` and `previews/welcome-en.html` without sending mail. The existing authenticated Sheet claim flow, registration handling and Google Apps Script remain unchanged. With the existing SMTP flow configured, deploying the template through Vercel updates future messages; this visual revision requires no Apps Script editing.

Review evidence: Greek and English browser previews at 390px and 1440px passed the four-screen review. Foreground/background contrast is 16.65:1; muted/background contrast is 9.21:1. The template also includes the narrower 320px layout rules. Browser previews are not real inbox validation; received rendering, image handling and delivery still require controlled mailbox checks.
