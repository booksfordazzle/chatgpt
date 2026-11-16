# Contact form delivery

Both contact forms POST directly to `https://formsubmit.co/ermitikos@gmail.com`. No paid business mailbox, server credentials or environment variables are needed. Submitted `email` is the visitor address used by FormSubmit for replies; recipient is fixed in the action URL.

## Required activation and delivery check

1. Deploy branch `codex/bilingual-site` through the existing hosting setup.
2. Submit a real test from the deployed contact page and complete FormSubmit's spam verification.
3. Open the activation email in **ermitikos@gmail.com** (check spam) and activate the form. This inbox action must be performed by its owner. FormSubmit may require activation for each site origin; use the production origin for the final check.
4. Submit another test after activation. Confirm that name, visitor email, language and message arrive, and that Reply addresses the visitor. Verify both Greek and English forms. Do not assume the activation-triggering test was delivered.

The browser navigates to FormSubmit for spam verification and its result page. There is no local "message sent" state or fake CAPTCHA. Native browser validation handles required fields and email format, including without JavaScript. The provider handles delivery errors on its own page. A hidden honeypot is also included. The free service is an external dependency; no inbox delivery or service availability has been verified in Codex.

Vercel and Netlify Content Security Policies allow FormSubmit only as a form submission destination. Site scripts, frames and connections remain restricted to self; no embedded third-party scripts are needed. Contact privacy notices identify FormSubmit and Google. Contact messages do not enter the waitlist.
