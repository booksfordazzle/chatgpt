# Contact delivery and spam protection

Recipient: **ermitikos@gmail.com**. FormSubmit activation for `https://chatgpt-weld-mu-98.vercel.app/` was confirmed by the owner.

Both contact forms now use native POST with `_captcha=true` and `_honey`, so FormSubmit can verify spam protection on its own page. The previous AJAX path disabled CAPTCHA and has been removed. After acceptance, `_next` returns to `/contact-sent.html` or `/en/contact-sent.html` on the current HTTPS origin; the no-JavaScript fallback uses the known Vercel production domain. Return pages acknowledge submission, not proof of inbox delivery.

Do not disable CAPTCHA to suppress an activation screen: activation is a separate recipient setup step. If the production domain changes, activate that domain in FormSubmit and update the static `_next` URLs. Provider CAPTCHA behavior and actual inbox delivery must be checked on the deployed site by its owner. Automated tests intercept submissions and do not send email.

FormSubmit is a third-party service with a public recipient endpoint. Its anti-abuse enforcement is controlled by the provider. This repository does not provide guaranteed global rate limiting for that endpoint. Monitor spam and consider a provider with server-verified challenge tokens if abuse persists.
