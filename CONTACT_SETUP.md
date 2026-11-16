# Contact form delivery

Recipient: **ermitikos@gmail.com**, via FormSubmit. No paid mailbox or server credentials are needed.

## One-time owner activation

The activation screen is a setup requirement for the recipient, not a recurring visitor confirmation. Open FormSubmit's activation email in **ermitikos@gmail.com**, check spam if needed, and activate the form for the production site. Submit a fresh message afterward and confirm receipt and Reply-to in Gmail. Test both languages. Delivery has not been verified in Codex; activation cannot be bypassed in code.

## Visitor flow

JavaScript POSTs JSON to `https://formsubmit.co/ajax/ermitikos@gmail.com`. Feedback appears inline in Greek or English, with no redirect or separate confirmation page. Only an HTTP success with explicit provider `success: true` or `"true"` counts as submitted. Activation responses are errors even if marked successful. Acceptance is not proof of inbox delivery. Failures/timeouts preserve the message and offer a direct Gmail link. Pending submissions disable the button to prevent duplicates. Native required-field/email validation applies.

`_captcha=false` removes provider CAPTCHA friction; `_honey` remains as the provider's honeypot. This tradeoff reduces spam protection. No-JavaScript visitors use the native POST and provider result page. CSP allows FormSubmit in form-action and connect-src; site scripts stay self-hosted. No waitlist or marketing subscription is created.

## Verification

After production deployment and owner activation, send fresh Greek and English test messages, verify receipt in Gmail and confirm that Reply addresses the visitor. Confirm failure states preserve text. Automated checks use intercepted provider responses and do not prove actual mail delivery.
