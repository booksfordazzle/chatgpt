# Contact surface

Routes /contact.html and /en/contact.html. Mode: Operate. Preserve the dark/ivory world, Google Sans, shared header/footer, logo-aligned gutter, owner business address and FAQ link.

Owner revision: replace email reveal with a contact form following the supplied horizontal-label reference. Required name, email and message fields use native validation. Desktop labels align beside fields; narrow layouts place labels above fields and stack the business sidebar below the form. Use readable dark fields and a light submit button. Keep the existing bilingual heading.

Native POST to https://formsubmit.co/ermitikos@gmail.com forwards via FormSubmit after one-time recipient activation. Use the provider's default spam verification and confirmation page; do not draw a fake CAPTCHA or claim local delivery success. Include a honeypot, subject, language, and service/privacy disclosure. CSP permits only the specific FormSubmit origin in form-action in addition to self. No paid mailbox, client secret, marketing enrolment or automatic reply is introduced.

Delivery must be verified after activation on the deployed domain. Until then, inbox delivery is unverified. See CONTACT_SETUP.md.

Latest owner refinement: use AJAX with inline Greek/English feedback and no external confirmation screen for JavaScript visitors. Disable provider CAPTCHA; keep honeypot and native form fallback. Preserve input on failure and explicitly reject activation responses. CSP permits FormSubmit in connect-src too. No-JavaScript visitors still use native provider navigation.

Current owner revision: replace the business sidebar with the supplied portrait contact-product.jpg, retaining full composition. Overlay existing FAQ help in the dark upper section. Closing H1 is now “Είμαστε εδώ για να σε ακούσουμε.” / “We’re here to listen.” Remove the reply-email explanatory sentence. Stack portrait below form on mobile.

Security revision: native FormSubmit POST with CAPTCHA enabled, honeypot retained and localized contact-sent return pages. This supersedes the AJAX/no-CAPTCHA flow. No inbox delivery claim is made by the branded return page.
