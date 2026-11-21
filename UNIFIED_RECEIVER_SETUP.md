# One receiver for PRIMAL CORE

The owner has multiple web-app deployments inside one Apps Script project. Publishing quiz-only code as a new version of a waitlist deployment can remove waitlist handling, and vice versa. Use the self-contained `google-apps-script/PrimalCoreCombined.gs` as the entire Code.gs for that existing project.

This combines the validated reordered-column waitlist receiver, flexible-column quiz receiver and research receiver. It preserves separate purpose-specific secrets and destination Sheets. It does not merge subscriber data and quiz data or send email directly from Apps Script.

## Activation

1. Replace current Code.gs with the entire PrimalCoreCombined.gs. Save. Keep existing Script Properties unchanged: WAITLIST_SHARED_SECRET, SKIN_PROFILE_RESEARCH_SECRET, SPREADSHEET_ID and mail properties.
2. Edit the existing named PRIMAL QUIZ web-app deployment → New version → Deploy. Keep Execute as Me / access Anyone. Keep its URL.
3. In Vercel Production set GOOGLE_APPS_SCRIPT_URL to the exact same existing URL currently used by SKIN_PROFILE_RESEARCH_SCRIPT_URL. Keep both secret variables unchanged. Redeploy Production.
4. Verify quiz/research storage, waitlist registration and mail delivery separately. No live functionality is claimed before these owner-side steps and live confirmation.

Known owner quiz URL at preparation time:
https://script.google.com/macros/s/AKfycbymUT25PzDsUqVDV9llX8F85jsJZFRKKdc2ZH_8ljLZeySbsznBUprL6KB0-uYOr5t-/exec

## Compatibility and checks

Quiz/research actions authenticate with SKIN_PROFILE_RESEARCH_SECRET. Waitlist/mail actions authenticate with WAITLIST_SHARED_SECRET. Quiz ID and research ID remain separate. Quiz and waitlist columns are resolved against the verified header rules, preserving reordered data and gaps. No raw secret is logged. No setup call is needed if existing properties are already configured.

Automated combined receiver tests use mocked Sheets and network calls. Owner-authorized live checks must follow deployment. The prior live waitlist failure was HTTP 502 / receiver_not_confirmed, while quiz had just passed.
