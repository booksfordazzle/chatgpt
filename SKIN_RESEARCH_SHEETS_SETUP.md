# Skin Research Google Sheets connection

Target: https://docs.google.com/spreadsheets/d/1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA/edit

The receiver adds a dedicated **Skin Research** tab; it does not replace gid=0 or touch the existing Waitlist sheet. Each confirmed submission contains a random retry identifier, UTC timestamp, consent version and the five selected Greek answer labels. No quiz answers, result, email, IP or user-agent is written. All five answers and explicit final-send consent are required. Identical retries reuse the same row; a conflicting retry is rejected.

## Activation

1. Give the Google account running the existing Apps Script deployment Editor access to the target spreadsheet. The connected Google Drive account currently receives HTTP 403, so the live target has not been inspected or modified here.
2. In the existing receiver project, update `Code.gs` and add `SkinResearch.gs` from `google-apps-script/`. Preserve all other project files and Script Properties. The current token-authenticated receiver reuses `WAITLIST_SHARED_SECRET`; neither that secret nor the deployment URL belongs in public files.
3. Deploy a new version of the existing Apps Script web app (execute as owner). Saving source alone is insufficient. Keep the existing server-only `GOOGLE_APPS_SCRIPT_URL` and `WAITLIST_SHARED_SECRET` settings; if a new deployment URL is used, update the server setting.
4. Enable `SKIN_PROFILE_RESEARCH_V2_ENABLED=true` only after receiver deployment/access are ready. This destination replaces the older aggregate Supabase sink for the five-question V2 survey; it does not dual-write. Legacy research and optional analytics remain unchanged.
5. Review and deploy the site branch separately. Perform one explicitly labeled controlled test, verify the row in **Skin Research**, then retry the same submission ID to confirm there is still one row. Do not announce production readiness before that check.

The website returns success only after a receiver response confirms the exact spreadsheet and submission ID and after the receiver reads back the saved row. Failure keeps the form answers and retry ID. A receiver timeout after a write is safe to retry. The client ID is random per completed quiz; it does not identify a person or deduplicate separate visits.

No production configuration, receiver deployment or live test submission was performed during local implementation.
