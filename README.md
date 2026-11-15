# PRIMAL CORE

A Greek prelaunch site for primalcore.gr. Greek/English static, server-renderable HTML, self-hosted fonts, responsive WebP images, a supplied 60fps hero film and ingredient film with muted autoplay/loop and independent pause controls, a manually operated ingredient slider, and a full-bleed cinematic product image. No frontend dependencies, analytics, cookies or third-party browser requests.

## Preview by double-clicking (no installation)

Download the latest GitHub ZIP and **extract the entire ZIP first**. Open the extracted folder, then double-click **index.html** at the top level. It opens the site in your browser. Keep the `public` folder and its contents together; do not move the HTML file by itself or open it from inside the ZIP.

Pages, images, styling, navigation and videos use relative paths and work locally. Waitlist submissions require the published server and Supabase configuration, so local previews clearly say they cannot save emails.

## Languages

Greek pages live directly in `public/`; their complete US English counterparts live in `public/en/`, including every blog article and the privacy and registration pages. The 🇺🇸 / 🇬🇷 flag switch opens the corresponding page and works without JavaScript. Keep both language versions in sync when editing copy. Shared styles, scripts and media remain in `public/`. The build includes both languages in the sitemap, with language alternatives declared in each source page. Form feedback and native submission redirects follow the selected language.

## Develop and verify

Requires Node.js 22 or newer. No dependency installation is necessary.

```sh
npm run dev
npm test
npm run build
```

The development server uses port 8080. `public/` is the editable source; `dist/` is the generated publication directory. Build runs from the repository root and generates canonical URLs, social image metadata, robots.txt and sitemap.xml for `https://primalcore.gr`. Set `SITE_URL` to another HTTPS origin only when intentionally changing domains. Build output is ignored by Git. The source upload remains unchanged outside this repository.

## Connect Supabase

The waitlist now persists through a server-only Supabase RPC. Follow [SUPABASE_SETUP.md](SUPABASE_SETUP.md) to create a project, apply `supabase/migrations/202611150001_waitlist.sql`, add `SUPABASE_URL` and `SUPABASE_SECRET_KEY` securely to the function runtime, deploy and verify a real signup. A legacy `SUPABASE_SERVICE_ROLE_KEY` is also supported. Never expose these secrets in `public/` or chat. No Supabase SDK or dependency installation is required.

Without configuration, the API returns 503 and the form retains the email with an honest error. Local development does not automatically load `.env`. `npm run test:db` optionally validates the migration and concurrency in isolated PostgreSQL via Docker; it does not prove hosted storage works.

The old `google-apps-script/Code.gs` is retained as historical source. The active function no longer writes to Sheets. Existing Sheet records have not been transferred or deleted; see the setup guide before changing production traffic. No welcome email, queue position, referrals or rewards are implemented.

## Publish on Netlify

1. Deploy this repository with the included `netlify.toml`: build `npm run build`, publish `dist`, functions directory `netlify/functions`.
2. Configure the server-only Supabase variables above and apply the migration first. Optionally set `SITE_URL=https://primalcore.gr` (this is already the build default).
3. Add `primalcore.gr` as the custom domain, configure DNS as instructed by Netlify, and enable HTTPS. Redirect the `www` variant to the chosen apex domain in hosting domain settings.
4. Verify `/api/waitlist`, an actual Supabase signup and consent receipt, `/blog/`, `/privacy.html`, `/sitemap.xml`, `/robots.txt` and the custom 404 page on the deployed domain. Verify the security headers supplied by `netlify.toml` are active.

A generic static host can serve the pages but **cannot** run the waitlist endpoint. Use Netlify or provide an equivalent server-side adapter. Do not replace confirmed saves with `fetch(..., {mode: 'no-cors'})`; opaque responses cannot prove that a row was saved.

## Before making the site public

- Complete the live Supabase integration and anonymous-access tests. No hosted project or credentials have been supplied; local tests do not establish hosted readiness.
- Confirm the full business address (city/postcode/country), monitored contact mailbox, retention period, hosting/Supabase processor arrangements and any international-transfer disclosures required for your actual configuration. The supplied legal name and street address are included; missing address details were not invented. Define how withdrawal and deletion requests are handled in Supabase and future mailing tools.
- Confirm the existing images, film and packaging artwork are yours to publish and accurately represent the intended product. The old before/after image and certification claims have been removed. Benefit and ingredient descriptions now use the owner-provided wording; confirm supporting evidence before launch. Product images are labelled as developmental; the packaging artwork contains wording that may differ from the final ingredient list.
- Review the general educational articles and substantiate any quantitative ingredient statements before presenting them as scientific references. The articles are not clinical evidence for PRIMAL CORE.

This handoff prepares source and deployment configuration. It does not publish DNS, deploy Netlify, create a hosted Supabase project or apply its migration, or establish regulatory approval for a cosmetic product.

See `REVIEW.md` for the assessment and verification results. Google Sans is self-hosted in Greek/Latin variable subsets, including italics; its SIL Open Font License is in `public/assets/GOOGLE-SANS-LICENSE.txt`.
