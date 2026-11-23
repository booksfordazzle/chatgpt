const assert = require('node:assert/strict');
const {chromium} = require('/opt/codex/runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

async function run() {
  const browser = await chromium.launch({
    args: ['--no-sandbox'],
    executablePath: process.env.CHROMIUM_EXECUTABLE
  });
  try {
    for (const scenario of ['email only', 'research only', 'both', 'legacy delivered', 'legacy pending']) {
      const research = scenario !== 'email only';
      const send = !['research only', 'legacy delivered'].includes(scenario);
      const page = await browser.newPage({viewport: {width: 390, height: 844}, reducedMotion: 'reduce'});
      const posts = [];
      let failStorage = true;
      await page.route('**/api/skin-profile', route => {
        if (route.request().method() === 'GET') return route.fulfill({json: {researchV2: true, email: true}});
        const post = route.request().postDataJSON();
        posts.push(post);
        const fail = post.action === 'quiz-save' && failStorage;
        return route.fulfill({status: fail ? 503 : 200, json: {ok: !fail}});
      });
      await page.goto('http://localhost:8097/skin-profile');
      if (await page.locator('#analytics-reject').isVisible()) await page.locator('#analytics-reject').click();
      await page.locator('#profile-adult').check();
      if (research) await page.locator('#profile-save-consent').check();
      await page.locator('#profile-start button').click();
      for (let step = 0; step < 10; step++) {
        if (step === 0) await page.locator('input[name="gender"]').first().check();
        await page.locator('#question-content input[name="answer"]').first().check();
        await page.locator('#question-next').click();
      }
      await page.locator('#result-title').waitFor();
      if (research) {
        await page.waitForFunction(() => document.querySelector('#quiz-save-status').textContent.includes('Δεν επιβεβαιώθηκε'));
        assert.equal(await page.locator('#quiz-save-retry,#restart-profile').count(), 0);
      }
      const quizId = await page.evaluate(() => history.state.primal.quizSubmissionId);
      if (scenario.startsWith('legacy')) {
        await page.evaluate(delivered => {
          const {resultDeliveryId, ...primal} = history.state.primal;
          history.replaceState({...history.state, primal}, '');
          if (delivered) sessionStorage.setItem('primal-result-delivered:' + primal.quizSubmissionId, 'Έχει ήδη σταλεί.');
        }, scenario === 'legacy delivered');
      }
      failStorage = false;
      await page.reload();
      if (research) {
        await page.waitForFunction(() => document.querySelector('#quiz-save-status').textContent.includes('αποθηκεύτηκαν'));
      }
      if (send) {
        await page.locator('#result-email').fill('controlled@example.com');
        await page.locator('[name="deliveryConsent"]').check();
        await page.locator('#result-email-form button').click();
        await page.waitForFunction(() => document.querySelector('#result-email-status').textContent.includes('στάλθηκε'));
      }
      await page.reload();
      await page.locator('#result-title').waitFor();
      const researchPosts = posts.filter(post => post.action === 'quiz-save');
      assert.equal(researchPosts.length, research ? 2 : 0);
      for (const post of researchPosts) {
        assert.equal(post.submissionId, quizId);
        assert.equal(post.answers.length, 10);
        assert(!('email' in post));
      }
      const emails = posts.filter(post => post.action === 'email');
      assert.equal(emails.length, send ? 1 : 0);
      if (send) {
        assert.notEqual(emails[0].submissionId, quizId);
        assert.equal(emails[0].submissionId, await page.evaluate(() => history.state.primal.resultDeliveryId));
        assert(!('answers' in emails[0]));
      }
      if (send || scenario === 'legacy delivered') assert(await page.locator('#result-email-form button').isDisabled());
      if (scenario === 'legacy delivered') assert.equal(await page.locator('#result-email-status').textContent(), 'Έχει ήδη σταλεί.');
      await page.close();
      console.log('PASS', scenario);
    }
  } finally {
    await browser.close();
  }
}

run().catch(error => { console.error(error); process.exitCode = 1; });
