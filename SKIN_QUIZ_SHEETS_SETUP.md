# Skin Quiz — activation

Target: existing Validation Results PRIMAL CORE workbook, separate tab **Skin Quiz**.

The connected Sheets account returned 403 when attempting to create the tab. No live Sheet changes or quiz submissions were made from this session. The updated Apps Script creates the tab using the owner's existing authorization.

## Owner steps

1. In the existing dedicated Skin Research Apps Script project, replace Code.gs with the complete contents of `google-apps-script/SkinResearchStandalone.gs` in this PR. Do not change or reveal Script Properties; the existing secret stays the same.
2. Save, select **setupSkinQuiz**, and click **Run**. It creates Skin Quiz and its header without changing Skin Research or existing rows.
3. **Deploy → Manage deployments → pencil → Version: New version → Deploy.** Edit the existing web-app deployment so its `/exec` URL remains unchanged.
4. Merge this PR so the website uses the new quiz API action.
5. Complete one controlled quiz with the optional anonymous-storage checkbox selected. Confirm the result page reports successful storage and one row appears in Skin Quiz. Refresh and confirm there is still only one row. Treat that row as a test when analysing responses.

No new Vercel environment variables are needed: this uses the existing dedicated research URL/secret and enabled flag. New code must be deployed in Apps Script; merging the website alone does not update Google Apps Script.

## Data

Columns A:N: Submission ID, Submitted at (UTC), Consent version, ten question titles, Result. Multiple selections are stored as readable labels separated by ` | `. Result is recomputed from validated answers by the receiver. No email or quiz/research linking ID is included; the quiz has a separate per-attempt random ID.

Storage is optional and unchecked by default. Without consent, no quiz answers are posted. Failed storage does not block viewing the result; refresh retries an unconfirmed save with the same ID; there is no separate retry button. The receiver checks the fixed spreadsheet and headers, reads back the write, rejects changed payloads for an existing ID, and acknowledges `sheetName: Skin Quiz` before the website reports success.

Live tab creation, native formatting and end-to-end live write/readback remain unverified until the owner steps above are complete. Existing automated tests use an in-memory Sheet and mocked API only.
