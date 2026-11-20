# Skin Research Google Sheets connection

Target: https://docs.google.com/spreadsheets/d/1mNlfIPPEO1eEm6L8RsmRuCZ0A5jVkX2MpnpPY2RhVAA/edit

The receiver adds a dedicated **Skin Research** tab; it does not replace gid=0 or touch the existing Waitlist sheet. Each confirmed submission contains a random retry identifier, UTC timestamp, consent version and the five selected Greek answer labels. No quiz answers, result, email, IP or user-agent is written. All five answers and explicit final-send consent are required. Identical retries reuse the same row; a conflicting retry is rejected.

## Activation in the empty Apps Script project (current owner screenshot)

1. Replace the default `function myFunction() {}` in **Code.gs** with the complete content of `google-apps-script/SkinResearchStandalone.gs` (also supplied as `/workspace/audits/skin-profile/Code.gs.txt`). This is a standalone file: do not also add the older `Code.gs` or `SkinResearch.gs` files in this new project.
2. Save. Select **setupSkinResearch** from the function menu and click **Run**. Review/approve the requested Google Sheet access for your own project. Setup checks access and generates the server secret once; it does not add test responses.
3. Open **Project Settings → Script properties**. Find **SKIN_PROFILE_RESEARCH_SECRET**. Copy its value only into the website host's sensitive server setting with the same name. Do not send the secret in chat. Running setup again preserves it.
4. Click **Deploy → New deployment → Web app**. Set **Execute as: Me**, **Who has access: Anyone**. Google Sheet access itself remains private; every write requires the secret.
5. Copy the **Web app URL ending in /exec**. Send this URL for the remaining connection, or put it in the host's server setting **SKIN_PROFILE_RESEARCH_SCRIPT_URL**. Leave `GOOGLE_APPS_SCRIPT_URL` and `WAITLIST_SHARED_SECRET` unchanged; they serve the existing waitlist.
6. Set **SKIN_PROFILE_RESEARCH_V2_ENABLED=true** once the survey receiver is deployed and accessible. Review/deploy the website separately, then submit one controlled test and verify its row in **Skin Research**. Retry the same submission ID to confirm one row. No live readiness claim until verified.

For subsequent script changes use **Deploy → Manage deployments → Edit → New version → Deploy**. Saving source alone does not update the published version. The earlier shared-receiver option (updated `Code.gs` plus `SkinResearch.gs` in the existing project) remains compatible via the existing server settings, but the standalone project above is the current recommended path for the owner's empty editor.

The website returns success only after a receiver response confirms the exact spreadsheet and submission ID and after the receiver reads back the saved row. Failure keeps the form answers and retry ID. A receiver timeout after a write is safe to retry. The client ID is random per completed quiz; it does not identify a person or deduplicate separate visits.

Google Drive metadata access was verified after the owner granted access. No production configuration, receiver deployment or live test submission was performed during local implementation.
